
from django.contrib import admin
from .models import Attendance,SalaryPayment, Expense


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ("employee", "date", "status")
    list_filter = ("date", "status")
    search_fields = ("employee__username",)
    date_hierarchy = "date"

@admin.register(SalaryPayment)
class SalaryPaymentAdmin(admin.ModelAdmin):
    list_display = (
        "employee",
        "payment_date",
        "days_paid",
        "daily_salary",
        "amount_paid",
    )
    list_filter = ("payment_date",)
    search_fields = ("employee__name",)
    date_hierarchy = "payment_date"

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "expense_type",
        "amount",
        "expense_date",
        "created_by",
        "is_voided",
    )
    list_filter = ("expense_type", "expense_date", "is_voided")
    search_fields = ("title", "description", "created_by__username")
    date_hierarchy = "expense_date"