from django.urls import path

from .views import (
    DailyBusinessReportView,
    AttendanceListCreateView,
    SalaryPaymentListCreateView,
    ExpenseListCreateView,
    ExpenseDetailView,
)

urlpatterns = [
    path(
        "daily-report/",
        DailyBusinessReportView.as_view(),
        name="daily-business-report",
    ),
    path(
        "attendance/",
        AttendanceListCreateView.as_view(),
        name="attendance-list-create",
    ),
    path(
        "salary-payments/",
        SalaryPaymentListCreateView.as_view(),
        name="salary-payment-list-create",
    ),
    path(
        "expenses/",
        ExpenseListCreateView.as_view(),
        name="expense-list-create",
    ),
    path(
        "expenses/<int:pk>/",
        ExpenseDetailView.as_view(),
        name="expense-detail",
    ),
]
