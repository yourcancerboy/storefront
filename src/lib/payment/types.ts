export interface CreateInvoiceRequest {
  orderId: string;
  orderNumber: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  items: { name: string; quantity: number; price: number }[];
  dueDate: Date;
}

export interface InvoiceResponse {
  invoiceNumber: string;
  invoiceUrl?: string;
  externalId?: string;
  amount: number;
  dueDate: Date;
  bankAccounts: BankAccountInfo[];
}

export interface BankAccountInfo {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface XenditVARequest {
  externalId: string;
  bankCode: string;
  name: string;
  expectedAmount: number;
  expirationDate: Date;
}

export interface XenditVAResponse {
  id: string;
  externalId: string;
  bankCode: string;
  accountNumber: string;
  name: string;
  expectedAmount: number;
  expirationDate: string;
  status: string;
}

export interface PaymentAdapter {
  createInvoice(request: CreateInvoiceRequest): Promise<InvoiceResponse>;
  createVirtualAccount(request: XenditVARequest): Promise<XenditVAResponse>;
  verifyWebhook(payload: unknown, token: string): boolean;
}
