from rest_framework.authtoken.views import obtain_auth_token
from django.urls import path, include
from rest_framework import routers
from .views import BankEntryViewSet

router = routers.DefaultRouter()
router.register(r'entries', BankEntryViewSet, basename='entries')

urlpatterns = [
    path('', include(router.urls)),
    path('api-token-auth/', obtain_auth_token),
]