from django.contrib.auth import get_user_model
from rest_framework.serializers import ModelSerializer
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class ApexTokenObtainPairSerializer(TokenObtainPairSerializer):
    pass


class RegisterSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "email", "password", "role"]

        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        password = validated_data.pop("password")

        user = User.objects.create_user(**validated_data)

        user.set_password(password)
        user.save()

        return user


class CurrentUserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "email", "role"]
