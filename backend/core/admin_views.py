from rest_framework import views, permissions, response, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.contrib.auth import get_user_model
from django.db.models import Sum, Q, F, Count
from django.utils import timezone
from django.db import transaction
from rest_framework.exceptions import ValidationError
from datetime import timedelta
from decimal import Decimal

from deals.models import Deal, Dispute, DealMessage, DealSubmission
from payments.models import PaymentTransaction, Payout
from core.models import Notification, PlatformSettings, ThirdPartyIntegration
from core.audit import AdminAuditLog

User = get_user_model()

class AdminStatsView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        total_users = User.objects.count()
        freelancers = User.objects.filter(role='freelancer').count()
        clients = User.objects.filter(role='client').count()
        pending_kyc = User.objects.filter(kyc_status='pending').count()
        
        # Deals
        total_deals = Deal.objects.count()
        completed_deals = Deal.objects.filter(status='completed').count()
        active_deals = Deal.objects.exclude(status__in=['completed', 'cancelled', 'refunded']).count()
        
        # Financials
        # Escrow: Deals that are funded but not released (held by platform)
        escrow_balance = Deal.objects.filter(
            status__in=['funded', 'in_progress', 'delivered', 'disputed']
        ).aggregate(Sum('amount'))['amount__sum'] or 0
        
        # Outflow: Total money that has left the system (successful withdrawals)
        total_outflow = PaymentTransaction.objects.filter(
            transaction_type='withdrawal',
            status='success'
        ).aggregate(Sum('amount_paid'))['amount_paid__sum'] or 0

        # Pending: Money waiting to be sent (including OTP pending or manual approval)
        pending_outflow = PaymentTransaction.objects.filter(
            transaction_type='withdrawal',
            status='pending'
        ).aggregate(Sum('amount_paid'))['amount_paid__sum'] or 0

        # Volume: Total completed deal volume
        total_volume = Deal.objects.filter(status='completed').aggregate(Sum('amount'))['amount__sum'] or 0
        
        return response.Response({
            "users": {
                "total": total_users,
                "freelancers": freelancers,
                "clients": clients,
                "pending_kyc": pending_kyc
            },
            "deals": {
                "total": total_deals,
                "active": active_deals,
                "completed": completed_deals
            },
            "financials": {
                "escrow_balance": float(escrow_balance),
                "total_volume": float(total_volume),
                "total_outflow": float(total_outflow),
                "pending_payouts": float(pending_outflow),
                "estimated_revenue": float(total_volume) * 0.05
            }
        })

class AdminUserListView(views.APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def get(self, request):
        # Basic pagination could be added here or via DRF generics, 
        # keeping it simple for "Command Center" initially
        users = User.objects.all().order_by('-date_joined')[:100] # Limit to recent 100 for now
        data = [{
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "role": u.role,
            "reference_id": u.reference_id,
            "balance": float(u.balance),
            "is_active": u.is_active,
            "date_joined": u.date_joined
        } for u in users]
        return response.Response(data)

class AdminDealListView(views.APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def get(self, request):
        deals = Deal.objects.all().select_related('client', 'freelancer').order_by('-created_at')[:50]
        
        # Real-time Stats for the Oversight Header
        escrow_balance = Deal.objects.filter(
            status__in=['funded', 'in_progress', 'delivered', 'disputed']
        ).aggregate(Sum('amount'))['amount__sum'] or 0
        
        active_deals = Deal.objects.filter(status__in=['funded', 'in_progress', 'delivered']).count()
        open_disputes = Dispute.objects.filter(resolved_at__isnull=True).count()
        
        deal_data = [{
            "id": d.id,
            "title": d.title,
            "client": d.client.username,
            "freelancer": d.freelancer.username if d.freelancer else "-",
            "amount": float(d.amount),
            "status": d.status,
            "reference_id": d.reference_id,
            "created_at": d.created_at
        } for d in deals]
        
        return response.Response({
            "deals": deal_data,
            "stats": {
                "total_escrow": float(escrow_balance),
                "active_deals": active_deals,
                "open_disputes": open_disputes
            }
        })

class AdminDealDetailView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, id):
        try:
            deal = Deal.objects.select_related('client', 'freelancer', 'job_type').get(id=id)
            messages = DealMessage.objects.filter(deal=deal).order_by('created_at')
            submissions = DealSubmission.objects.filter(deal=deal).order_by('-created_at')
            
            return response.Response({
                "deal": {
                    "id": deal.id,
                    "title": deal.title,
                    "description": deal.description,
                    "amount": float(deal.amount),
                    "status": deal.status,
                    "reference_id": deal.reference_id,
                    "client": deal.client.username,
                    "client_id": deal.client.id,
                    "freelancer": deal.freelancer.username if deal.freelancer else None,
                    "freelancer_id": deal.freelancer.id if deal.freelancer else None,
                    "job_type": deal.job_type.name if deal.job_type else None,
                    "created_at": deal.created_at,
                    "updated_at": deal.updated_at,
                    "attachments": deal.attachments,
                    "milestones": deal.milestones,
                    "deadline": deal.deadline,
                },
                "messages": [{
                    "user": m.user.username,
                    "message": m.message,
                    "files": m.files,
                    "time": m.created_at
                } for m in messages],
                "submissions": [{
                    "round": s.revision_round,
                    "notes": s.notes,
                    "links": s.links,
                    "files": s.files,
                    "time": s.created_at
                } for s in submissions]
            })
        except Deal.DoesNotExist:
            return response.Response({"error": "Deal not found"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, id):
        try:
            deal = Deal.objects.get(id=id)
            action = request.data.get('action')
            reason = request.data.get('reason', 'Administrative action')
            
            changes = {"action": action, "reason": reason}
            
            if action == 'cancel_deal':
                if deal.status in ['completed', 'refunded', 'cancelled']:
                    return response.Response({"error": "Cannot cancel a finished deal"}, status=400)
                
                # If funded, refund the client
                if deal.status in ['funded', 'in_progress', 'delivered', 'disputed']:
                    # Find the transaction to see how much was actually paid
                    tx = PaymentTransaction.objects.filter(deal=deal, status='success', transaction_type='deal_payment').first()
                    refund_amount = tx.amount_paid if tx else deal.amount
                    
                    deal.client.balance += Decimal(str(refund_amount))
                    deal.client.save()
                    changes['refunded'] = True
                    changes['refund_amount'] = float(refund_amount)
                
                deal.status = 'cancelled'
                deal.save()
                
            elif action == 'force_complete':
                if deal.status in ['completed', 'refunded', 'cancelled']:
                    return response.Response({"error": "Deal is already in a final state"}, status=400)
                
                if not deal.freelancer:
                    return response.Response({"error": "No freelancer assigned to complete"}, status=400)
            
                settings = PlatformSettings.objects.first()
                if not settings:
                    settings = PlatformSettings.objects.create()
                
                breakdown = settings.calculate_fee_breakdown(deal.amount)
                net_amount = breakdown['total_to_receive']
                
                deal.freelancer.balance += Decimal(str(net_amount))
                deal.freelancer.save()
                deal.status = 'completed'
                deal.save()
                changes['funds_released'] = True
                changes['net_released'] = float(net_amount)
                changes['fee_deducted'] = breakdown['freelancer_fee']
            
            elif action == 'update_status':
                new_status = request.data.get('status')
                if new_status in dict(Deal.STATUS_CHOICES):
                    deal.status = new_status
                    deal.save()
                    changes['new_status'] = new_status
                else:
                    return response.Response({"error": "Invalid status"}, status=400)
            
            else:
                return response.Response({"error": "Invalid action"}, status=400)

            # Audit log
            AdminAuditLog.objects.create(
                admin=request.user,
                action=f"admin_{action}",
                target_model="Deal",
                target_id=deal.id,
                changes=changes,
                ip_address=self._get_client_ip(request)
            )
            
            return response.Response({"message": f"Action {action} processed successfully"})
            
        except Deal.DoesNotExist:
            return response.Response({"error": "Deal not found"}, status=status.HTTP_404_NOT_FOUND)

    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

class AdminDisputeListView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        disputes = Dispute.objects.all().select_related('deal', 'opened_by').order_by('-created_at')
        data = [{
            "id": d.id,
            "reference_id": d.reference_id,
            "deal_title": d.deal.title,
            "opened_by": d.opened_by.username,
            "reason": d.reason,
            "status": "Resolved" if d.resolved_at else "Open",
            "created_at": d.created_at
        } for d in disputes]
        return response.Response(data)

class AdminDisputeDetailView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, id):
        try:
            dispute = Dispute.objects.select_related('deal').get(id=id)
        except Dispute.DoesNotExist:
            return response.Response({"error": "Dispute not found"}, status=404)
        
        deal = dispute.deal
        messages = DealMessage.objects.filter(deal=deal).order_by('created_at')
        submissions = DealSubmission.objects.filter(deal=deal).order_by('-created_at')
        
        return response.Response({
            "dispute": {
                "id": dispute.id,
                "reference_id": dispute.reference_id,
                "reason": dispute.reason,
                "evidence": dispute.evidence_files,
                "opened_by": dispute.opened_by.username,
                "created_at": dispute.created_at,
                "status": "Resolved" if dispute.resolved_at else "Open",
                "admin_decision": dispute.admin_decision,
                "decision_notes": dispute.decision_notes
            },
            "deal": {
                "id": deal.id,
                "reference_id": deal.reference_id,
                "title": deal.title,
                "description": deal.description,
                "amount": float(deal.amount),
                "client": deal.client.username,
                "freelancer": deal.freelancer.username if deal.freelancer else "None",
            },
            "chat_history": [{
                "user": m.user.username,
                "message": m.message,
                "files": m.files,
                "time": m.created_at
            } for m in messages],
            "submissions": [{
                "round": s.revision_round,
                "notes": s.notes,
                "links": s.links,
                "files": s.files,
                "time": s.created_at
            } for s in submissions]
        })

    def post(self, request, id):
        from django.db import transaction
        
        try:
            dispute = Dispute.objects.get(id=id)
        except Dispute.DoesNotExist:
            return response.Response({"error": "Dispute not found"}, status=404)
            
        if dispute.resolved_at:
             return response.Response({"error": "Dispute already resolved"}, status=400)
        
        decision = request.data.get('decision') # release_to_freelancer, full_refund, partial_refund
        notes = request.data.get('notes', '')
        refund_amount = float(request.data.get('refund_amount', 0))
        
        deal = dispute.deal
        
        # Get platform settings for fee calculation
        settings = PlatformSettings.objects.first()
        if not settings:
            settings = PlatformSettings.objects.create() # Create default if none exist
        
        with transaction.atomic():
            if decision == 'release_to_freelancer':
                if deal.freelancer:
                    # Calculate net amount after fees
                    breakdown = settings.calculate_fee_breakdown(deal.amount)
                    net_amount = breakdown['total_to_receive']
                    
                    deal.freelancer.balance += Decimal(str(net_amount))
                    deal.freelancer.save()
                    deal.status = 'completed'
                
            elif decision == 'full_refund':
                # Find how much client actually paid
                tx = PaymentTransaction.objects.filter(deal=deal, status='success', transaction_type='deal_payment').first()
                refund_amount_client = tx.amount_paid if tx else deal.amount
                
                deal.client.balance += Decimal(str(refund_amount_client))
                deal.client.save()
                deal.status = 'refunded'
                
            elif decision == 'partial_refund':
                if refund_amount > float(deal.amount) or refund_amount < 0:
                     return response.Response({"error": "Invalid refund amount"}, status=400)
                     
                freelancer_share = float(deal.amount) - refund_amount
                breakdown = settings.calculate_fee_breakdown(deal.amount)
                f_fee = breakdown['freelancer_fee']
                net_freelancer_share = max(0, freelancer_share - f_fee)
                
                deal.client.balance += Decimal(str(refund_amount))
                deal.client.save()
                
                if deal.freelancer:
                    deal.freelancer.balance += Decimal(str(net_freelancer_share))
                    deal.freelancer.save()
                
                deal.status = 'completed'
                    
            # Update Deal and Create Notifications
            deal.save()
            
            # Update Dispute Record
            dispute.admin_decision = decision
            dispute.decision_notes = notes
            dispute.resolved_at = timezone.now()
            dispute.save()

            # Enhanced Notifications with Justification
            notes_snippet = f"\n\nJustification: {notes}" if notes else ""
            
            if decision == 'release_to_freelancer':
                Notification.objects.create(recipient=deal.client, deal=deal, type='dispute_resolved',
                    content=f"Dispute resolved for '{deal.title}'. Funds released to freelancer.{notes_snippet}")
                Notification.objects.create(recipient=deal.freelancer, deal=deal, type='dispute_resolved',
                    content=f"Dispute resolved for '{deal.title}'. You have won the dispute.{notes_snippet}")
                
            elif decision == 'full_refund':
                Notification.objects.create(recipient=deal.client, deal=deal, type='dispute_resolved',
                    content=f"Dispute resolved for '{deal.title}'. Funds refunded to you.{notes_snippet}")
                Notification.objects.create(recipient=deal.freelancer, deal=deal, type='dispute_resolved',
                    content=f"Dispute resolved for '{deal.title}'. Funds refunded to client.{notes_snippet}")
                
            elif decision == 'partial_refund':
                Notification.objects.create(recipient=deal.client, deal=deal, type='dispute_resolved',
                    content=f"Dispute resolved for '{deal.title}'. Partial refund processed.{notes_snippet}")
                Notification.objects.create(recipient=deal.freelancer, deal=deal, type='dispute_resolved',
                    content=f"Dispute resolved for '{deal.title}'. Partial payment released to you.{notes_snippet}")

        return response.Response({"status": "success", "decision": decision})

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from decimal import Decimal
from django.utils import timezone
from .models import PlatformSettings, AdminAuditLog, ThirdPartyIntegration # Added ThirdPartyIntegration

class AdminPlatformSettingsView(APIView):
    """
    GET: Retrieve current platform settings
    PATCH: Update platform settings (secure with audit logging)
    
    Security:
    - Admin-only access
    - Input validation
    - Audit logging for all changes
    - Sensitive keys masked in responses
    """
    permission_classes = [permissions.IsAdminUser]
    
    def get(self, request):
        try:
            settings = PlatformSettings.objects.first()
            if not settings:
                # Create default settings if none exist
                settings = PlatformSettings.objects.create()
            
            # Mask sensitive keys for security
            data = {
                "id": settings.id,
                "active_gateway": settings.active_gateway,
                "use_test_mode": settings.use_test_mode,
                "platform_fee_percent": str(settings.platform_fee_percent),
                "min_platform_fee": str(settings.min_platform_fee),
                "max_platform_fee": str(settings.max_platform_fee),
                "fee_payer": settings.fee_payer,
                "dispute_window_days": settings.dispute_window_days,
                "auto_release_days": settings.auto_release_days,
                "support_email": settings.support_email,
                "whatsapp_link": settings.whatsapp_link,
                # Mask API keys (show only last 4 chars)
                "paystack_public_key": self._mask_key(settings.paystack_public_key),
                "paystack_secret_key": self._mask_key(settings.paystack_secret_key),
                "flutterwave_public_key": self._mask_key(settings.flutterwave_public_key),
                "flutterwave_secret_key": self._mask_key(settings.flutterwave_secret_key),
            }
            
            return Response(data)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
    
    def patch(self, request):
        try:
            settings = PlatformSettings.objects.first()
            if not settings:
                settings = PlatformSettings.objects.create()
            
            # Track changes for audit log
            changes = {}
            old_values = {}
            
            # Validate and update fields
            allowed_fields = [
                'active_gateway', 'use_test_mode', 'platform_fee_percent',
                'min_platform_fee', 'max_platform_fee',
                'fee_payer', 'dispute_window_days', 'auto_release_days',
                'support_email', 'whatsapp_link',
                'paystack_public_key', 'paystack_secret_key',
                'flutterwave_public_key', 'flutterwave_secret_key'
            ]
            
            for field in allowed_fields:
                if field in request.data:
                    old_value = getattr(settings, field)
                    new_value = request.data[field]
                    
                    # Security: Validate inputs
                    try:
                        if field in ['platform_fee_percent', 'min_platform_fee', 'max_platform_fee']:
                            if new_value in [None, '']:
                                new_value = Decimal('0')
                            else:
                                new_value = Decimal(str(new_value))
                            
                            if field == 'platform_fee_percent':
                                if new_value < 0 or new_value > 100:
                                    return Response({"error": f"Invalid {field}: Must be between 0 and 100"}, status=400)
                            else:
                                if new_value < 0:
                                     return Response({"error": f"Invalid {field}: Must be non-negative"}, status=400)
                        
                        if field == 'active_gateway' and new_value not in ['paystack', 'flutterwave']:
                            return Response({"error": "Invalid gateway. Must be 'paystack' or 'flutterwave'"}, status=400)
                        
                        if field in ['dispute_window_days', 'auto_release_days']:
                            if new_value in [None, '']:
                                new_value = 0
                            else:
                                new_value = int(new_value)
                            
                            if new_value < 0 or new_value > 365:
                                return Response({"error": f"Invalid {field}: Must be between 0 and 365 days"}, status=400)
                    except (ValueError, TypeError, Exception):
                        return Response({"error": f"Invalid format for {field}"}, status=400)
                    
                    # Track change (mask sensitive keys in audit log)
                    if '_key' in field:
                        old_values[field] = self._mask_key(str(old_value))
                        changes[field] = self._mask_key(str(new_value)) if new_value else None
                    else:
                        old_values[field] = str(old_value)
                        changes[field] = str(new_value)
                    
                    setattr(settings, field, new_value)
            
            settings.save()
            
            # Security: Audit log
            if changes:
                # from .audit import AdminAuditLog # Assuming AdminAuditLog is imported or defined
                AdminAuditLog.objects.create(
                    admin=request.user,
                    action="update_platform_settings",
                    target_model="PlatformSettings",
                    target_id=settings.id,
                    changes={"changed_fields": changes, "old_values": old_values},
                    ip_address=self._get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')[:255]
                )
            
            return Response({"message": "Settings updated successfully", "changes": list(changes.keys())})
            
        except ValueError as e:
            return Response({"error": f"Invalid input: {str(e)}"}, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
    
    def _mask_key(self, key):
        """Mask API key for security (show only last 4 characters)"""
        if not key or len(key) < 4:
            return "****"
        return "*" * (len(key) - 4) + key[-4:]
    
    def _get_client_ip(self, request):
        """Get client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

class AdminFinancialStatsView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        # Revenue: 5% of all completed deals
        completed_volume = Deal.objects.filter(status='completed').aggregate(Sum('amount'))['amount__sum'] or 0
        total_revenue = float(completed_volume) * 0.05
        
        # Escrow: Funds currently held
        escrow_balance = Deal.objects.filter(
            status__in=['funded', 'in_progress', 'delivered', 'disputed']
        ).aggregate(Sum('amount'))['amount__sum'] or 0
        
        # Outflow: Total successful withdrawals
        total_outflow = PaymentTransaction.objects.filter(
            transaction_type='withdrawal',
            status='success'
        ).aggregate(Sum('amount_paid'))['amount_paid__sum'] or 0
        
        # Pending: Withdrawals waiting for OTP or approval
        pending_outflow = PaymentTransaction.objects.filter(
            transaction_type='withdrawal',
            status='pending'
        ).aggregate(Sum('amount_paid'))['amount_paid__sum'] or 0
        
        # Recent Transactions
        recent_txs = PaymentTransaction.objects.all().select_related('user').order_by('-created_at')[:10]
        tx_data = [{
            "id": tx.id,
            "type": tx.transaction_type,
            "amount": float(tx.amount_paid),
            "status": tx.status,
            "user": tx.user.username if tx.user else "Unknown",
            "date": tx.created_at
        } for tx in recent_txs]

        return response.Response({
            "revenue": total_revenue,
            "volume": float(completed_volume),
            "escrow": float(escrow_balance),
            "total_payout": float(total_outflow),
            "pending_payout": float(pending_outflow),
            "recent_transactions": tx_data
        })

class AdminTransactionListView(views.APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def get(self, request):
        txs = PaymentTransaction.objects.all().select_related('user').order_by('-created_at')[:50]
        data = [{
            "id": tx.id,
            "reference": tx.reference,
            "type": tx.transaction_type,
            "amount": float(tx.amount_paid),
            "gateway": tx.gateway,
            "status": tx.status,
            "user": tx.user.username if tx.user else "-",
            "date": tx.created_at
        } for tx in txs]
        return response.Response(data)

class AdminUserDetailView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, id):
        try:
            user = User.objects.get(id=id)
            # Get user's recent deals
            recent_deals = Deal.objects.filter(
                Q(client=user) | Q(freelancer=user)
            ).order_by('-created_at')[:10]
            
            deal_data = [{
                "id": d.id,
                "reference_id": d.reference_id,
                "title": d.title,
                "amount": float(d.amount),
                "status": d.status,
                "role": "client" if d.client == user else "freelancer",
                "date": d.created_at
            } for d in recent_deals]

            return response.Response({
                "id": user.id,
                "reference_id": user.reference_id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role,
                "kyc_status": user.kyc_status,
                "is_active": user.is_active,
                "balance": float(user.balance),
                "date_joined": user.date_joined,
                "last_login": user.last_login,
                "deals_count": user.total_deals_completed,
                "disputes_count": user.disputes_count,
                "recent_deals": deal_data
            })
        except User.DoesNotExist:
            return response.Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, id):
        try:
            user = User.objects.get(id=id)
            old_data = {
                "email": user.email,
                "role": user.role,
                "kyc_status": user.kyc_status,
                "is_active": user.is_active
            }
            
            data = request.data
            fields_updated = []
            
            if 'email' in data:
                user.email = data['email']
                fields_updated.append('email')
            if 'role' in data:
                user.role = data['role']
                fields_updated.append('role')
            if 'kyc_status' in data:
                user.kyc_status = data['kyc_status']
                fields_updated.append('kyc_status')
            if 'is_active' in data:
                user.is_active = data['is_active']
                fields_updated.append('is_active')
                
            user.save()
            
            # Audit Log
            AdminAuditLog.objects.create(
                admin=request.user,
                action="update_user",
                target_model="User",
                target_id=user.id,
                changes={
                    "old": old_data,
                    "new": {f: getattr(user, f) for f in fields_updated}
                },
                ip_address=self._get_client_ip(request)
            )
            
            return response.Response({"message": "User updated successfully"})
        except User.DoesNotExist:
            return response.Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

class AdminUserActionView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, id):
        try:
            user = User.objects.get(id=id)
            action = request.data.get('action')
            reason = request.data.get('reason', 'No reason provided')
            
            if action == 'ban':
                user.is_active = False
                user.save()
                AdminAuditLog.objects.create(
                    admin=request.user,
                    action="ban_user",
                    target_model="User",
                    target_id=user.id,
                    changes={"reason": reason},
                    ip_address=self._get_client_ip(request)
                )
                return response.Response({"message": "User banned successfully"})
                
            elif action == 'unban':
                user.is_active = True
                user.save()
                AdminAuditLog.objects.create(
                    admin=request.user,
                    action="unban_user",
                    target_model="User",
                    target_id=user.id,
                    changes={"reason": reason},
                    ip_address=self._get_client_ip(request)
                )
                return response.Response({"message": "User unbanned successfully"})
                
            elif action == 'adjust_balance':
                amount = request.data.get('amount')
                if amount is None:
                    return response.Response({"error": "Amount is required"}, status=status.HTTP_400_BAD_REQUEST)
                
                old_balance = user.balance
                user.balance += Decimal(str(amount))
                user.save()
                
                AdminAuditLog.objects.create(
                    admin=request.user,
                    action="adjust_balance",
                    target_model="User",
                    target_id=user.id,
                    changes={
                        "old_balance": float(old_balance),
                        "new_balance": float(user.balance),
                        "adjustment": float(amount),
                        "reason": reason
                    },
                    ip_address=self._get_client_ip(request)
                )
                return response.Response({"message": f"Balance adjusted by {amount}"})
                
            return response.Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
            
        except User.DoesNotExist:
            return response.Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

class AdminIntegrationsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        integrations = ThirdPartyIntegration.objects.all()
        # Initialize default services if they don't exist
        existing_services = [i.service for i in integrations]
        for service_code, service_name in ThirdPartyIntegration.SERVICE_CHOICES:
            if service_code not in existing_services:
                ThirdPartyIntegration.objects.create(service=service_code)
        
        # Re-fetch after initialization
        integrations = ThirdPartyIntegration.objects.all()
        
        data = [{
            "id": i.id,
            "service": i.service,
            "service_name": i.get_service_display(),
            "public_key": self._mask_key(i.public_key),
            "secret_key": self._mask_key(i.secret_key),
            "is_active": i.is_active,
            "config": i.config,
            "updated_at": i.updated_at
        } for i in integrations]
        return Response(data)

    def patch(self, request):
        service = request.data.get('service')
        try:
            integration = ThirdPartyIntegration.objects.get(service=service)
            
            changes = {}
            if 'public_key' in request.data:
                integration.public_key = request.data['public_key']
                changes['public_key'] = self._mask_key(integration.public_key)
            if 'secret_key' in request.data:
                integration.secret_key = request.data['secret_key']
                changes['secret_key'] = self._mask_key(integration.secret_key)
            if 'is_active' in request.data:
                integration.is_active = request.data['is_active']
                changes['is_active'] = integration.is_active
            if 'config' in request.data:
                integration.config.update(request.data['config'])
                changes['config'] = integration.config
                
            integration.save()
            
            # Audit log
            AdminAuditLog.objects.create(
                admin=request.user,
                action="update_integration",
                target_model="ThirdPartyIntegration",
                target_id=integration.id,
                changes=changes,
                ip_address=self._get_client_ip(request)
            )
            
            return Response({"message": f"{integration.get_service_display()} updated successfully"})
        except ThirdPartyIntegration.DoesNotExist:
            return Response({"error": "Integration not found"}, status=404)

    def _mask_key(self, key):
        if not key or len(key) < 4:
            return "****"
        return "*" * (len(key) - 4) + key[-4:]

    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
