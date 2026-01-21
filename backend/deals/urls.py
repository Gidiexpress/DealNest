from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DealViewSet, PublicDealView
from .cron_views import cron_release_funds

router = DefaultRouter()
router.register(r'deals', DealViewSet, basename='deals')

urlpatterns = [
    path('', include(router.urls)),
    path('d/<slug:slug>/public/', PublicDealView.as_view(), name='public_deal'),
    path('cron/release-funds/', cron_release_funds, name='cron_release_funds'),
]
