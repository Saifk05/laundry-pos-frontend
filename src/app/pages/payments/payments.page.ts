import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface PaymentDay {
  date: string;
  total: number;
  upi: number;
  cash: number;
  deepCleanTotal: number;
  deepCleanUpi: number;
  deepCleanCash: number;
  expanded?: boolean;
}

@Component({
  selector: 'app-payments',
  standalone: true,
  templateUrl: './payments.page.html',
  styleUrls: ['./payments.page.scss'],
  imports: [
    FormsModule
  ]
})
export class PaymentsPage {

  startDate = '2026-08-01';
  endDate = '2026-08-08';

  deepCleanOnly = false;

  payments: PaymentDay[] = [
    {
      date: '2026-08-08',
      total: 8420,
      upi: 5120,
      cash: 3300,
      deepCleanTotal: 2600,
      deepCleanUpi: 1700,
      deepCleanCash: 900
    },
    {
      date: '2026-08-07',
      total: 12650,
      upi: 7450,
      cash: 5200,
      deepCleanTotal: 3900,
      deepCleanUpi: 2400,
      deepCleanCash: 1500
    },
    {
      date: '2026-08-06',
      total: 9850,
      upi: 6100,
      cash: 3750,
      deepCleanTotal: 3150,
      deepCleanUpi: 2000,
      deepCleanCash: 1150
    },
    {
      date: '2026-08-05',
      total: 14320,
      upi: 8920,
      cash: 5400,
      deepCleanTotal: 4480,
      deepCleanUpi: 2920,
      deepCleanCash: 1560
    },
    {
      date: '2026-08-04',
      total: 11240,
      upi: 6840,
      cash: 4400,
      deepCleanTotal: 3380,
      deepCleanUpi: 2080,
      deepCleanCash: 1300
    },
    {
      date: '2026-08-03',
      total: 3274,
      upi: 2400,
      cash: 874,
      deepCleanTotal: 1250,
      deepCleanUpi: 900,
      deepCleanCash: 350
    },
    {
      date: '2026-08-02',
      total: 17986,
      upi: 7171,
      cash: 10815,
      deepCleanTotal: 5900,
      deepCleanUpi: 2350,
      deepCleanCash: 3550
    },
    {
      date: '2026-08-01',
      total: 10547,
      upi: 5762,
      cash: 4785,
      deepCleanTotal: 3700,
      deepCleanUpi: 2150,
      deepCleanCash: 1550
    }
  ];

  get filteredPayments(): PaymentDay[] {

    return this.payments.filter((payment) => {

      const paymentDate =
        new Date(payment.date);

      const start =
        new Date(this.startDate);

      const end =
        new Date(this.endDate);

      return (
        paymentDate >= start &&
        paymentDate <= end
      );
    });
  }

  get totalAmount(): number {

    return this.filteredPayments.reduce(
      (total, item) =>
        total +
        (
          this.deepCleanOnly
            ? item.deepCleanTotal
            : item.total
        ),
      0
    );
  }

  get totalUpi(): number {

    return this.filteredPayments.reduce(
      (total, item) =>
        total +
        (
          this.deepCleanOnly
            ? item.deepCleanUpi
            : item.upi
        ),
      0
    );
  }

  get totalCash(): number {

    return this.filteredPayments.reduce(
      (total, item) =>
        total +
        (
          this.deepCleanOnly
            ? item.deepCleanCash
            : item.cash
        ),
      0
    );
  }

  getDisplayTotal(
    payment: PaymentDay
  ): number {

    return this.deepCleanOnly
      ? payment.deepCleanTotal
      : payment.total;
  }

  getDisplayUpi(
    payment: PaymentDay
  ): number {

    return this.deepCleanOnly
      ? payment.deepCleanUpi
      : payment.upi;
  }

  getDisplayCash(
    payment: PaymentDay
  ): number {

    return this.deepCleanOnly
      ? payment.deepCleanCash
      : payment.cash;
  }

  toggleRow(
    payment: PaymentDay
  ): void {

    payment.expanded =
      !payment.expanded;
  }

  refresh(): void {

    console.log({
      startDate: this.startDate,
      endDate: this.endDate,
      deepCleanOnly: this.deepCleanOnly,
      payments: this.filteredPayments
    });
  }
}