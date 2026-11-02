from rest_framework import serializers
from .models import Service, CustomerService, CustomerServiceItem


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ["id", "name", "price", "is_active"]


class CustomerServiceItemSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(
        source="service.name",
        read_only=True
    )

    class Meta:
        model = CustomerServiceItem
        fields = ["id", "service", "service_name", "price"]


class CustomerServiceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(
        source="employee.username",
        read_only=True
    )

    # Existing records compatibility
    service_name = serializers.SerializerMethodField()
    service_details = CustomerServiceItemSerializer(
        source="items",
        many=True,
        read_only=True
    )

    # New multiple-service input
    services = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Service.objects.filter(is_active=True),
        write_only=True
    )

    class Meta:
        model = CustomerService
        fields = [
            "id",
            "customer_name",
            "customer_phone",
            "service",
            "service_name",
            "services",
            "service_details",
            "employee_name",
            "amount",
            "service_date",
        ]
        read_only_fields = [
            "service",
            "amount",
            "service_date"
        ]

    def get_service_name(self, obj):
        names = [item.service.name for item in obj.items.all()]

        if names:
            return " + ".join(names)

        # Old entry compatibility
        if obj.service:
            return obj.service.name

        return ""

    def create(self, validated_data):
        selected_services = validated_data.pop("services")

        customer_entry = CustomerService.objects.create(
            amount=0,
            **validated_data
        )

        total = 0

        for service in selected_services:
            CustomerServiceItem.objects.create(
                customer_service=customer_entry,
                service=service,
                price=service.price
            )

            total += service.price

        customer_entry.amount = total
        customer_entry.save(update_fields=["amount"])

        return customer_entry