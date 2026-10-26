
from rest_framework import generics

from .models import EmployeeProfile
from .serializers import EmployeeProfileSerializer
from .permissions import IsAdminRole
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer

class EmployeeListCreateView(generics.ListCreateAPIView):
    queryset = EmployeeProfile.objects.select_related("user").all().order_by("name")
    serializer_class = EmployeeProfileSerializer
    permission_classes = [IsAdminRole]


class EmployeeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = EmployeeProfile.objects.select_related("user").all()
    serializer_class = EmployeeProfileSerializer
    permission_classes = [IsAdminRole]
    lookup_field = "pk"
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer