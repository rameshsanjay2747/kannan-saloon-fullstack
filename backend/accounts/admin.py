
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, EmployeeProfile


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Saloon Role", {"fields": ("role",)}),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Saloon Role", {"fields": ("role",)}),
    )


@admin.register(EmployeeProfile)
class EmployeeProfileAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "phone",
        "experience_level",
        "daily_salary",
        "is_active",
    )
    list_filter = ("experience_level", "is_active")
    search_fields = ("name", "phone")
