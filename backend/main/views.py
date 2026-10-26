from django.shortcuts import render

# Create your views here.
from rest_framework import generics
from accounts.permissions import IsAdminRole
from rest_framework.permissions import IsAuthenticated
from .models import Service, CustomerService
from .serializers import (
    ServiceSerializer,
    CustomerServiceSerializer,
)


class ServiceListView(generics.ListAPIView):
    queryset = Service.objects.filter(is_active=True)
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]


class CustomerServiceListCreateView(generics.ListCreateAPIView):
    serializer_class = CustomerServiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "ADMIN" or user.is_superuser:
            return CustomerService.objects.all()

        return CustomerService.objects.filter(employee=user)

    def perform_create(self, serializer):
        serializer.save(
            employee=self.request.user,
            amount=serializer.validated_data["service"].price
        )


class ServiceManagementListCreateView(generics.ListCreateAPIView):
    queryset = Service.objects.all().order_by("name")
    serializer_class = ServiceSerializer
    permission_classes = [IsAdminRole]


class ServiceManagementDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAdminRole]