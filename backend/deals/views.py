from rest_framework import viewsets, permissions, status, views
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Deal
from .serializers import DealSerializer, DealMessageSerializer
from .services import DealService
import logging

logger = logging.getLogger(__name__)

class DealViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DealSerializer
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        return Deal.objects.filter(Q(client=user) | Q(freelancer=user)).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)

    def get_object(self):
        # Specific handling for 'accept' to allow unassigned deals access
        if self.action == 'accept':
            queryset = Deal.objects.all()
            filter_kwargs = {self.lookup_field: self.kwargs[self.lookup_field]}
            obj = get_object_or_404(queryset, **filter_kwargs)
            self.check_object_permissions(self.request, obj)
            return obj
        return super().get_object()

    @action(detail=True, methods=['post'])
    def fund(self, request, id=None):
        deal = self.get_object()
        payment_method = request.data.get('payment_method', 'gateway')
        callback_url = request.data.get('callback_url')
        
        try:
            result = DealService.fund_deal(deal, request.user, payment_method, callback_url)
            return Response(result)
        except Exception as e:
            if hasattr(e, 'detail'): # DRF Exception
                raise e
            return Response({'error': str(e)}, status=500)

    @action(detail=True, methods=['post'])
    def accept(self, request, id=None):
        deal = self.get_object()
        deal = DealService.accept_deal(deal, request.user)
        return Response(DealSerializer(deal).data)

    @action(detail=True, methods=['post'])
    def start_work(self, request, id=None):
        deal = self.get_object()
        deal = DealService.start_work(deal, request.user)
        return Response(DealSerializer(deal).data)

    @action(detail=True, methods=['post'])
    def deliver(self, request, id=None):
        deal = self.get_object()
        deal = DealService.deliver_work(deal, request.user, request.data)
        return Response(DealSerializer(deal).data)

    @action(detail=True, methods=['post'])
    def approve(self, request, id=None):
        deal = self.get_object()
        result = DealService.approve_deal(deal, request.user)
        return Response(result)

    @action(detail=True, methods=['post'])
    def dispute(self, request, id=None):
        deal = self.get_object()
        reason = request.data.get('reason')
        result = DealService.dispute_deal(deal, request.user, reason)
        return Response(result)

    @action(detail=True, methods=['post'])
    def request_revision(self, request, id=None):
        deal = self.get_object()
        feedback = request.data.get('feedback')
        deal = DealService.request_revision(deal, request.user, feedback)
        return Response(DealSerializer(deal).data)

    @action(detail=True, methods=['get', 'post'])
    def messages(self, request, id=None):
        deal = self.get_object()
        
        if request.method == 'GET':
            # Check permission manually since it's a detail action but not standard DRF CRUD
            if request.user != deal.client and request.user != deal.freelancer:
                return Response({'error': 'Not authorized'}, status=403)
            messages = deal.messages.all().order_by('created_at')
            serializer = DealMessageSerializer(messages, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            content = request.data.get('message')
            files = request.data.get('files', [])
            msg = DealService.send_message(deal, request.user, content, files)
            return Response(DealMessageSerializer(msg).data, status=201)

class PublicDealView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        deal = get_object_or_404(Deal, unique_shareable_url=slug)
        return Response(DealSerializer(deal).data)
