
from django.contrib import admin
from .models import Service, CustomerService


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ("name", "price", "is_active")
    search_fields = ("name",)
    list_filter = ("is_active",)


@admin.register(CustomerService)
class CustomerServiceAdmin(admin.ModelAdmin):
    list_display = (
        "customer_name",
        "customer_phone",
        "service",
        "employee",
        "amount",
        "service_date",
    )
    search_fields = ("customer_name", "customer_phone")
    list_filter = ("service", "service_date")
    readonly_fields = ("service_date",)