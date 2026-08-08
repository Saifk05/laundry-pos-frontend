import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Invoice {
  id: number;

  invoiceNumber: string;
  orderNumber: string;

  status: string;

  customerType: 'B2C' | 'CLIENT' | 'DEEP_CLEAN';

  clientName: string;

  paidAmount: number;
  dueAmount: number;

  total: number;
  tax: number;
  taxableAmount: number;

  expressAmount: number;
  discountAmount: number;

  grossTotal: number;

  createdAt: string;
  deletedAt: string;

  paidAt: string;
  deliveredAt: string;

  store: string;
}

@Component({
  selector: 'app-bill',
  standalone: true,
  templateUrl: './bill.page.html',
  styleUrls: ['./bill.page.scss'],
  imports: [
    FormsModule
  ]
})
export class BillPage {

  b2cOnly = false;
  deepCleanOnly = false;
  clientOnly = false;

  selectedClient = 'All';

  orderIdSearch = '';

  createdDate = '';
  deliveredDate = '';

  invoiceStatus = 'All';
  sortBy = 'Created Date Desc';

  clients: string[] = [
    'All',
    'ABC Technologies',
    'Hubballi Hospital',
    'GreenLeaf Hotel',
    'Prime Residency'
  ];

  statuses: string[] = [
    'All',
    'Draft',
    'Paid',
    'Partially Paid',
    'Deleted'
  ];

  sortOptions: string[] = [
    'Created Date Desc',
    'Created Date Asc',
    'Amount High to Low',
    'Amount Low to High'
  ];

  invoices: Invoice[] = [
    {
      id: 1,
      invoiceNumber: 'TMP95374290',
      orderNumber: '2080555',
      status: 'Deleted',
      customerType: 'B2C',
      clientName: '',
      paidAmount: 0,
      dueAmount: 870,
      total: 870,
      tax: 0,
      taxableAmount: 0,
      expressAmount: 0,
      discountAmount: 0,
      grossTotal: 870,
      createdAt: '2026-08-02 03:17 PM',
      deletedAt: '2026-08-02 03:19 PM',
      paidAt: '-',
      deliveredAt: '-',
      store: 'FAB-HUBLI-89510'
    },
    {
      id: 2,
      invoiceNumber: 'TMP24061492',
      orderNumber: '2080555',
      status: 'Draft',
      customerType: 'B2C',
      clientName: '',
      paidAmount: 0,
      dueAmount: 0,
      total: 0,
      tax: 0,
      taxableAmount: 0,
      expressAmount: 0,
      discountAmount: 870,
      grossTotal: 870,
      createdAt: '2026-08-02 03:17 PM',
      deletedAt: '-',
      paidAt: '-',
      deliveredAt: '-',
      store: 'FAB-HUBLI-89510'
    },
    {
      id: 3,
      invoiceNumber: 'TMP85749520',
      orderNumber: '2081673',
      status: 'Draft',
      customerType: 'B2C',
      clientName: '',
      paidAmount: 0,
      dueAmount: 129,
      total: 129,
      tax: 0,
      taxableAmount: 0,
      expressAmount: 0,
      discountAmount: 0,
      grossTotal: 129,
      createdAt: '2026-08-03 01:48 PM',
      deletedAt: '-',
      paidAt: '-',
      deliveredAt: '-',
      store: 'FAB-HUBLI-89510'
    },
    {
      id: 4,
      invoiceNumber: 'INV2081721',
      orderNumber: '2081721',
      status: 'Paid',
      customerType: 'B2C',
      clientName: '',
      paidAmount: 680,
      dueAmount: 0,
      total: 680,
      tax: 0,
      taxableAmount: 680,
      expressAmount: 100,
      discountAmount: 50,
      grossTotal: 730,
      createdAt: '2026-08-04 10:20 AM',
      deletedAt: '-',
      paidAt: '2026-08-04 10:22 AM',
      deliveredAt: '2026-08-06 06:30 PM',
      store: 'FAB-HUBLI-89510'
    },
    {
      id: 5,
      invoiceNumber: 'INV2081790',
      orderNumber: '2081790',
      status: 'Partially Paid',
      customerType: 'DEEP_CLEAN',
      clientName: '',
      paidAmount: 800,
      dueAmount: 450,
      total: 1250,
      tax: 0,
      taxableAmount: 1250,
      expressAmount: 0,
      discountAmount: 0,
      grossTotal: 1250,
      createdAt: '2026-08-05 12:35 PM',
      deletedAt: '-',
      paidAt: '2026-08-05 12:40 PM',
      deliveredAt: '-',
      store: 'FAB-HUBLI-89510'
    },
    {
      id: 6,
      invoiceNumber: 'INV2081812',
      orderNumber: '2081812',
      status: 'Draft',
      customerType: 'CLIENT',
      clientName: 'ABC Technologies',
      paidAmount: 0,
      dueAmount: 2300,
      total: 2300,
      tax: 0,
      taxableAmount: 2300,
      expressAmount: 0,
      discountAmount: 200,
      grossTotal: 2500,
      createdAt: '2026-08-06 09:10 AM',
      deletedAt: '-',
      paidAt: '-',
      deliveredAt: '-',
      store: 'FAB-HUBLI-89510'
    },
    {
      id: 7,
      invoiceNumber: 'INV2081844',
      orderNumber: '2081844',
      status: 'Paid',
      customerType: 'CLIENT',
      clientName: 'Hubballi Hospital',
      paidAmount: 4750,
      dueAmount: 0,
      total: 4750,
      tax: 0,
      taxableAmount: 4750,
      expressAmount: 0,
      discountAmount: 250,
      grossTotal: 5000,
      createdAt: '2026-08-07 11:45 AM',
      deletedAt: '-',
      paidAt: '2026-08-07 11:50 AM',
      deliveredAt: '2026-08-08 09:30 AM',
      store: 'FAB-HUBLI-89510'
    },
    {
      id: 8,
      invoiceNumber: 'INV2081901',
      orderNumber: '2081901',
      status: 'Draft',
      customerType: 'DEEP_CLEAN',
      clientName: '',
      paidAmount: 0,
      dueAmount: 1800,
      total: 1800,
      tax: 0,
      taxableAmount: 1800,
      expressAmount: 100,
      discountAmount: 100,
      grossTotal: 1800,
      createdAt: '2026-08-08 02:15 PM',
      deletedAt: '-',
      paidAt: '-',
      deliveredAt: '-',
      store: 'FAB-HUBLI-89510'
    }
  ];

  get filteredInvoices(): Invoice[] {

    let result =
      this.invoices.filter((invoice) => {

        const matchesB2c =
          !this.b2cOnly ||
          invoice.customerType === 'B2C';

        const matchesDeepClean =
          !this.deepCleanOnly ||
          invoice.customerType === 'DEEP_CLEAN';

        const matchesClient =
          !this.clientOnly ||
          invoice.customerType === 'CLIENT';

        const matchesClientName =
          this.selectedClient === 'All' ||
          invoice.clientName === this.selectedClient;

        const matchesOrder =
          !this.orderIdSearch ||
          invoice.orderNumber.includes(
            this.orderIdSearch.trim()
          );

        const matchesStatus =
          this.invoiceStatus === 'All' ||
          invoice.status.toLowerCase() ===
          this.invoiceStatus.toLowerCase();

        const matchesCreatedDate =
          !this.createdDate ||
          invoice.createdAt.startsWith(
            this.createdDate
          );

        const matchesDeliveredDate =
          !this.deliveredDate ||
          invoice.deliveredAt.startsWith(
            this.deliveredDate
          );

        return (
          matchesB2c &&
          matchesDeepClean &&
          matchesClient &&
          matchesClientName &&
          matchesOrder &&
          matchesStatus &&
          matchesCreatedDate &&
          matchesDeliveredDate
        );
      });

    result = [...result];

    if (
      this.sortBy ===
      'Amount High to Low'
    ) {

      result.sort(
        (a, b) =>
          b.grossTotal -
          a.grossTotal
      );

    } else if (
      this.sortBy ===
      'Amount Low to High'
    ) {

      result.sort(
        (a, b) =>
          a.grossTotal -
          b.grossTotal
      );

    } else if (
      this.sortBy ===
      'Created Date Asc'
    ) {

      result.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
      );

    } else {

      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
    }

    return result;
  }

  get totalPaid(): number {

    return this.filteredInvoices.reduce(
      (total, invoice) =>
        total + invoice.paidAmount,
      0
    );
  }

  get totalDue(): number {

    return this.filteredInvoices.reduce(
      (total, invoice) =>
        total + invoice.dueAmount,
      0
    );
  }

  get totalAmount(): number {

    return this.filteredInvoices.reduce(
      (total, invoice) =>
        total + invoice.total,
      0
    );
  }

  get totalTax(): number {

    return this.filteredInvoices.reduce(
      (total, invoice) =>
        total + invoice.tax,
      0
    );
  }

  get totalTaxable(): number {

    return this.filteredInvoices.reduce(
      (total, invoice) =>
        total + invoice.taxableAmount,
      0
    );
  }

  get totalExpress(): number {

    return this.filteredInvoices.reduce(
      (total, invoice) =>
        total + invoice.expressAmount,
      0
    );
  }

  get totalDiscount(): number {

    return this.filteredInvoices.reduce(
      (total, invoice) =>
        total + invoice.discountAmount,
      0
    );
  }

  get grossTotal(): number {

    return this.filteredInvoices.reduce(
      (total, invoice) =>
        total + invoice.grossTotal,
      0
    );
  }

  loadInvoices(): void {

    console.log(
      'Loaded invoices:',
      this.filteredInvoices
    );
  }

  clearFilters(): void {

    this.b2cOnly = false;
    this.deepCleanOnly = false;
    this.clientOnly = false;

    this.selectedClient = 'All';

    this.orderIdSearch = '';

    this.createdDate = '';
    this.deliveredDate = '';

    this.invoiceStatus = 'All';

    this.sortBy =
      'Created Date Desc';
  }

  receipt(
    invoice: Invoice
  ): void {

    console.log(
      'Receipt:',
      invoice
    );
  }

  settle(
    invoice: Invoice
  ): void {

    console.log(
      'Settle invoice:',
      invoice
    );
  }
}