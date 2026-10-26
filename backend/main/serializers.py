from rest_framework import serializers
from .models import Service, CustomerService


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ["id", "name", "price", "is_active"]


class CustomerServiceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(
        source="employee.username",
        read_only=True
    )
    service_name = serializers.CharField(
        source="service.name",
        read_only=True
    )

    class Meta:
        model = CustomerService
        fields = [
            "id",
            "customer_name",
            "customer_phone",
            "service",
            "service_name",
            "employee_name",
            "amount",
            "service_date",
        ]
        read_only_fields = ["amount", "service_date"]