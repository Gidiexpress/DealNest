from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, UserDetailView, PublicProfileView, FileUploadView, UserViewSet, NotificationViewSet,
    NotificationListView, NotificationMarkReadView, PlatformSettingsView
)
from .kyc_views import RequestVerificationView
from . import admin_views

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', UserDetailView.as_view(), name='auth_me'),
    path('notifications/<int:id>/read/', NotificationMarkReadView.as_view(), name='notification-read'),
    path('settings/', PlatformSettingsView.as_view(), name='platform-settings'),
    path('kyc/request/', RequestVerificationView.as_view(), name='kyc-request'),
    path('profile/<str:username>/', PublicProfileView.as_view(), name='public_profile'),
    path('upload/', FileUploadView.as_view(), name='file_upload'),
    
    # Admin Dashboard Endpoints
    path('admin/stats/', admin_views.AdminStatsView.as_view(), name='admin_stats'),
    path('admin/users/', admin_views.AdminUserListView.as_view(), name='admin_users'),
    path('admin/users/<int:id>/', admin_views.AdminUserDetailView.as_view(), name='admin_user_detail'),
    path('admin/users/<int:id>/action/', admin_views.AdminUserActionView.as_view(), name='admin_user_action'),
    path('admin/deals/', admin_views.AdminDealListView.as_view(), name='admin_deals'),
    path('admin/deals/<int:id>/', admin_views.AdminDealDetailView.as_view(), name='admin_deal_detail'),
    path('admin/disputes/', admin_views.AdminDisputeListView.as_view(), name='admin_disputes'),
    path('admin/disputes/<int:id>/', admin_views.AdminDisputeDetailView.as_view(), name='admin_dispute_detail'),
    path('admin/disputes/<int:id>/resolve/', admin_views.AdminDisputeDetailView.as_view(), name='admin_dispute_resolve'),
    
    # Financial Reports
    path('admin/financials/stats/', admin_views.AdminFinancialStatsView.as_view(), name='admin_financial_stats'),
    path('admin/financials/transactions/', admin_views.AdminTransactionListView.as_view(), name='admin_financial_txs'),
    
    # Platform Settings
    path('admin/settings/', admin_views.AdminPlatformSettingsView.as_view(), name='admin_platform_settings'),
    path('admin/integrations/', admin_views.AdminIntegrationsView.as_view(), name='admin_integrations'),
]
