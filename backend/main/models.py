
from django.db import models
from django.conf import settings


class Service(models.Model):
    name = models.CharField(max_length=100, unique=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - Rs.{self.price}"


class CustomerService(models.Model):
    customer_name = models.CharField(max_length=100)
    customer_phone = models.CharField(max_length=15, blank=True)

    service = models.ForeignKey(
        Service,
        on_delete=models.PROTECT,
        related_name="customer_entries"
    )

    employee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="customer_services"
    )

    amount = models.DecimalField(max_digits=8, decimal_places=2)
    service_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.customer_name} - {self.service.name}"