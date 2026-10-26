
from django.db import transaction
from rest_framework import serializers

from .models import User, EmployeeProfile
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class EmployeeProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )
    account_username = serializers.CharField(
        source="user.username",
        read_only=True,
    )
    user_id = serializers.IntegerField(
    source="user.id",
    read_only=True,
)

    class Meta:
        model = EmployeeProfile
        fields = [
            "id",
            "user_id",
            "username",
            "password",
            "account_username",
            "name",
            "phone",
            "native_place",
            "experience_level",
            "daily_salary",
            "is_active",
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):
        username = validated_data.pop("username")
        password = validated_data.pop("password")

        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError({
                "username": "This username already exists."
            })

        with transaction.atomic():
            user = User.objects.create_user(
                username=username,
                password=password,
                role="EMPLOYEE",
            )

            employee = EmployeeProfile.objects.create(
                user=user,
                **validated_data,
            )

        return employee
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        data["role"] = self.user.role
        data["username"] = self.user.username

        return data