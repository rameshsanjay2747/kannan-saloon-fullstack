
from decimal import Decimal

from rest_framework import serializers

from .models import Attendance, SalaryPayment,Expense

# from decimal import Decimal
# from rest_framework import serializers
# from .models import Attendance, SalaryPayment


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()

    employee_username = serializers.CharField(
        source="employee.username",
        read_only=True,
    )

    def get_employee_name(self, obj):
        profile = getattr(obj.employee, "employee_profile", None)

        if profile:
            return profile.name

        return obj.employee.username

    class Meta:
        model = Attendance
        fields = [
            "id",
            "employee",
            "employee_name",
            "employee_username",
            "date",
            "status",
            "notes",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "employee_name",
            "employee_username",
            "created_at",
        ]



class SalaryPaymentSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(
        source="employee.name",
        read_only=True,
    )

    calculated_salary = serializers.SerializerMethodField()

    class Meta:
        model = SalaryPayment
        fields = [
            "id",
            "employee",
            "employee_name",
            "payment_date",
            "days_paid",
            "daily_salary",
            "amount_paid",
            "calculated_salary",
            "notes",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "employee_name",
            "daily_salary",
            "amount_paid",
            "calculated_salary",
            "created_at",
        ]

    def get_calculated_salary(self, obj):
        return obj.calculated_salary

    def create(self, validated_data):
        employee = validated_data["employee"]
        days_paid = validated_data.get("days_paid", Decimal("1"))

        daily_salary = employee.daily_salary
        amount_paid = (daily_salary * days_paid).quantize(
            Decimal("0.01")
        )

        return SalaryPayment.objects.create(
            daily_salary=daily_salary,
            amount_paid=amount_paid,
            **validated_data,
        )

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.daily_salary = instance.employee.daily_salary
        instance.amount_paid = (
            instance.days_paid * instance.daily_salary
        ).quantize(Decimal("0.01"))

        instance.save()
        return instance


class ExpenseSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(
        source="created_by.username",
        read_only=True,
    )

    class Meta:
        model = Expense
        fields = [
            "id",
            "expense_type",
            "title",
            "description",
            "amount",
            "expense_date",
            "created_by",
            "created_by_username",
            "created_at",
            "is_voided",
        ]
        read_only_fields = [
            "id",
            "created_by",
            "created_by_username",
            "created_at",
            "is_voided",
        ]
