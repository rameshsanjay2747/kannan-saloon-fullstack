
from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    ROLE_CHOICES = [
        ("ADMIN", "Admin"),
        ("EMPLOYEE", "Employee"),
    ]

    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default="EMPLOYEE",
    )

    def __str__(self):
        return f"{self.username} - {self.role}"


class EmployeeProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.PROTECT,
        related_name="employee_profile",
    )

    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    native_place = models.CharField(max_length=100, blank=True)

    experience_level = models.CharField(
        max_length=20,
        choices=[
            ("FRESHER", "Fresher"),
            ("EXPERIENCED", "Experienced"),
        ],
    )

    daily_salary = models.DecimalField(
        max_digits=8,
        decimal_places=2,
    )

    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
