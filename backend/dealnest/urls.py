from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from django.views.generic import RedirectView

urlpatterns = [
    path('', RedirectView.as_view(url='admin/')),
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')), # We will route main APIs here
    path('api/', include('deals.urls')),
    path('api/payments/', include('payments.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
