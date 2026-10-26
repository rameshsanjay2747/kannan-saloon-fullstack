
from django.db import models
from django.conf import settings


class Attendance(models.Model):
    STATUS_CHOICES = [
        ("PRESENT", "Present"),
        ("ABSENT", "Absent"),
        ("HALF_DAY", "Half Day"),
    ]

    employee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="attendance_records",
        limit_choices_to={"role": "EMPLOYEE"},
    )
    date = models.DateField()
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="PRESENT",
    )
    notes = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["employee", "date"],
                name="unique_employee_attendance_per_day",
            )
        ]

    def __str__(self):
        return f"{self.employee.username} - {self.date} - {self.status}"

class SalaryPayment(models.Model):
    employee = models.ForeignKey(
        "accounts.EmployeeProfile",
        on_delete=models.PROTECT,
        related_name="salary_payments",
    )
    payment_date = models.DateField()
    days_paid = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=1,
    )
    daily_salary = models.DecimalField(
        max_digits=8,
        decimal_places=2,
    )
    amount_paid = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )
    notes = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def calculated_salary(self):
        return self.days_paid * self.daily_salary

    def __str__(self):
        return f"{self.employee.name} - Rs.{self.amount_paid} - {self.payment_date}"


class Expense(models.Model):
    EXPENSE_TYPE_CHOICES = [
        ("BUSINESS", "Business Expense"),
        ("PERSONAL", "Admin Personal Expense"),
    ]

    expense_type = models.CharField(
        max_length=10,
        choices=EXPENSE_TYPE_CHOICES,
    )
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    expense_date = models.DateField()
    created_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.PROTECT,
        related_name="recorded_expenses",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    is_voided = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.title} - Rs.{self.amount}"