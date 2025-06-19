from django.db import models

class BankEntry(models.Model):
    date = models.DateField()
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    balance = models.DecimalField(max_digits=10, decimal_places=2)
    bank = models.CharField(max_length=50, default="HDFC")  # Example banks

    from_account = models.CharField(max_length=255, blank=True, default="")
    to_account = models.CharField(max_length=255, blank=True, default="")

    TRANSACTION_MODES = [
        ("cash", "Cash"),
        ("card", "Card"),
        ("bank_transfer", "Bank Transfer"),
        ("upi", "UPI"),
    ]
    transaction_mode = models.CharField(
        max_length=20, choices=TRANSACTION_MODES, blank=True, default="cash"
    )

    def __str__(self):
        return f"{self.date} - {self.description} ({self.bank})"