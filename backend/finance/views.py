from decimal import Decimal

from django.db.models import Sum
from django.utils import timezone
from django.utils.dateparse import parse_date

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import IsAdminRole
from main.models import CustomerService
from .models import Attendance, Expense, SalaryPayment
from .serializers import (
    AttendanceSerializer,
    SalaryPaymentSerializer,
    ExpenseSerializer,
)
from django.db.models.functions import TruncDate
# from .serializers import ExpenseSerializer
class DailyBusinessReportView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        today = timezone.localdate()

        start_date = parse_date(
            request.query_params.get("start_date", str(today))
        )
        end_date = parse_date(
            request.query_params.get("end_date", str(today))
        )

        if not start_date or not end_date or start_date > end_date:
            return Response(
                {"error": "Valid start_date and end_date required (YYYY-MM-DD)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        collections = CustomerService.objects.filter(
            service_date__date__range=(start_date, end_date)
        ).aggregate(total=Sum("amount"))["total"] or Decimal("0.00")

        business_expenses = Expense.objects.filter(
            expense_type="BUSINESS",
            is_voided=False,
            expense_date__range=(start_date, end_date),
        ).aggregate(total=Sum("amount"))["total"] or Decimal("0.00")

        personal_expenses = Expense.objects.filter(
            expense_type="PERSONAL",
            is_voided=False,
            expense_date__range=(start_date, end_date),
        ).aggregate(total=Sum("amount"))["total"] or Decimal("0.00")

        salary_paid = SalaryPayment.objects.filter(
            payment_date__range=(start_date, end_date)
        ).aggregate(total=Sum("amount_paid"))["total"] or Decimal("0.00")

        net_business_balance = (
            collections - business_expenses - salary_paid
        )

        return Response({
            "start_date": str(start_date),
            "end_date": str(end_date),
            "total_service_collection": str(collections),
            "business_expenses": str(business_expenses),
            "salary_paid": str(salary_paid),
            "admin_personal_expenses": str(personal_expenses),
            "net_business_balance": str(net_business_balance),
        })

class AttendanceListCreateView(generics.ListCreateAPIView):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAdminRole]


class SalaryPaymentListCreateView(generics.ListCreateAPIView):
    queryset = SalaryPayment.objects.select_related(
        "employee",
        "employee__user",
    ).all().order_by("-payment_date", "-id")

    serializer_class = SalaryPaymentSerializer
    permission_classes = [IsAdminRole]


class ExpenseListCreateView(generics.ListCreateAPIView):
    queryset = Expense.objects.select_related(
        "created_by"
    ).all().order_by("-expense_date", "-id")

    serializer_class = ExpenseSerializer
    permission_classes = [IsAdminRole]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Expense.objects.select_related(
        "created_by"
    ).all()

    serializer_class = ExpenseSerializer
    permission_classes = [IsAdminRole]

    def perform_destroy(self, instance):
        # Keep the financial record; mark it as cancelled.
        instance.is_voided = True
        instance.save(update_fields=["is_voided"])


class DailyBusinessReportView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        today = timezone.localdate()

        start_date = parse_date(
            request.query_params.get("start_date", str(today))
        )
        end_date = parse_date(
            request.query_params.get("end_date", str(today))
        )

        if not start_date or not end_date or start_date > end_date:
            return Response(
                {
                    "error": (
                        "Valid start_date and end_date required "
                        "(YYYY-MM-DD)."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 1. Service collections - date-wise
        service_rows = (
            CustomerService.objects.filter(
                service_date__date__range=(start_date, end_date)
            )
            .annotate(day=TruncDate("service_date"))
            .values("day")
            .annotate(total=Sum("amount"))
        )

        # 2. Expenses - date-wise and type-wise
        expense_rows = (
            Expense.objects.filter(
                is_voided=False,
                expense_date__range=(start_date, end_date),
            )
            .values("expense_date", "expense_type")
            .annotate(total=Sum("amount"))
        )

        # 3. Salary payments - date-wise
        salary_rows = (
            SalaryPayment.objects.filter(
                payment_date__range=(start_date, end_date)
            )
            .values("payment_date")
            .annotate(total=Sum("amount_paid"))
        )

        # Store daily totals in dictionaries
        daily = {}

        def get_day(day):
            if day not in daily:
                daily[day] = {
                    "service_collection": Decimal("0.00"),
                    "business_expenses": Decimal("0.00"),
                    "salary_paid": Decimal("0.00"),
                    "admin_personal_expenses": Decimal("0.00"),
                }
            return daily[day]

        for row in service_rows:
            get_day(row["day"])["service_collection"] = (
                row["total"] or Decimal("0.00")
            )

        for row in expense_rows:
            day_data = get_day(row["expense_date"])
            amount = row["total"] or Decimal("0.00")

            if row["expense_type"] == "BUSINESS":
                day_data["business_expenses"] = amount
            elif row["expense_type"] == "PERSONAL":
                day_data["admin_personal_expenses"] = amount

        for row in salary_rows:
            get_day(row["payment_date"])["salary_paid"] = (
                row["total"] or Decimal("0.00")
            )

        # Build chart data, including dates with zero transactions
        daily_breakdown = []
        collections = Decimal("0.00")
        business_expenses = Decimal("0.00")
        salary_paid = Decimal("0.00")
        personal_expenses = Decimal("0.00")

        current_date = start_date

        from datetime import timedelta

        while current_date <= end_date:
            values = get_day(current_date)

            income = values["service_collection"]
            expenses = values["business_expenses"]
            salary = values["salary_paid"]
            personal = values["admin_personal_expenses"]

            collections += income
            business_expenses += expenses
            salary_paid += salary
            personal_expenses += personal

            daily_breakdown.append({
                "date": str(current_date),
                "service_collection": str(income),
                "business_expenses": str(expenses),
                "salary_paid": str(salary),
                "admin_personal_expenses": str(personal),
                "total_business_outflow": str(expenses + salary),
                "net_business_balance": str(income - expenses - salary),
            })

            current_date += timedelta(days=1)

        net_business_balance = (
            collections - business_expenses - salary_paid
        )

        return Response({
            "start_date": str(start_date),
            "end_date": str(end_date),
            "total_service_collection": str(collections),
            "business_expenses": str(business_expenses),
            "salary_paid": str(salary_paid),
            "total_business_outflow": str(
                business_expenses + salary_paid
            ),
            "admin_personal_expenses": str(personal_expenses),
            "net_business_balance": str(net_business_balance),
            "daily_breakdown": daily_breakdown,
        })


