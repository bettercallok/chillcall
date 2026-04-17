from django.contrib import admin
from django.urls import path
from signaling.views import health_check

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health_check, name='health_check'),
    path('health', health_check, name='health_check_no_slash'),
]
