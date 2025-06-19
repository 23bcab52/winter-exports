from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import BankEntry
from .serializers import BankEntrySerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum

class BankEntryViewSet(viewsets.ModelViewSet):
    queryset = BankEntry.objects.all().order_by('date', 'id')
    serializer_class = BankEntrySerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['date', 'bank']
    ordering_fields = ['date', 'id']

    @action(detail=False, methods=['get'])
    def by_month(self, request):
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        qs = self.queryset
        if year and month:
            qs = qs.filter(date__year=year, date__month=month)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        # Accepts ?date=YYYY-MM-DD or ?month=MM&year=YYYY
        date = request.query_params.get('date')
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        qs = self.queryset
        if date:
            qs = qs.filter(date=date)
        elif year and month:
            qs = qs.filter(date__year=year, date__month=month)
        else:
            return Response({"error": "Provide date=YYYY-MM-DD or month=MM&year=YYYY"}, status=400)
        total_credit = qs.filter(amount__gt=0).aggregate(Sum('amount'))['amount__sum'] or 0
        total_debit = qs.filter(amount__lt=0).aggregate(Sum('amount'))['amount__sum'] or 0
        entries = self.get_serializer(qs, many=True).data
        response = {
            "total_credit": total_credit,
            "total_debit": abs(total_debit),
            "closing_balance": entries[-1]['balance'] if entries else 0,
            "entries": entries
        }
        return Response(response)

    @action(detail=False, methods=['get'])
    def dates(self, request):
        # Returns a list of all unique dates with entries, newest first
        dates = (
            BankEntry.objects.values_list('date', flat=True)
            .distinct().order_by('-date')
        )
        return Response(list(dates))

    @action(detail=False, methods=['get'])
    def by_date(self, request):
        """
        Returns entries for a specific date and the opening balance for that date.
        Usage: /bankentries/by_date/?date=YYYY-MM-DD
        """
        date = request.query_params.get("date")
        if not date:
            return Response({"error": "Missing date parameter"}, status=400)
        entries = BankEntry.objects.filter(date=date).order_by("id")
        # Get last entry before this date for opening balance
        prev_entry = (
            BankEntry.objects.filter(date__lt=date)
            .order_by('-date', '-id')
            .first()
        )
        opening_balance = prev_entry.balance if prev_entry else 0
        data = {
            "opening_balance": opening_balance,
            "entries": BankEntrySerializer(entries, many=True).data
        }
        return Response(data)