from rest_framework import serializers
from .models import BankEntry

class BankEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = BankEntry
        fields = '__all__'