// Type definitions for @paystack/inline-js
declare module '@paystack/inline-js' {
  interface PaystackTransaction {
    reference: string;
    status: string;
    trans: string;
    transaction: string;
    message: string;
    trxref: string;
  }

  interface PaystackMetadataField {
    display_name: string;
    variable_name: string;
    value: string | number;
  }

  interface PaystackOptions {
    key: string;
    email: string;
    amount: number;
    currency?: string;
    ref?: string;
    metadata?: {
      custom_fields?: PaystackMetadataField[];
      [key: string]: unknown;
    };
    channels?: ('card' | 'bank' | 'ussd' | 'qr' | 'mobile_money' | 'bank_transfer')[];
    label?: string;
    onSuccess: (transaction: PaystackTransaction) => void;
    onCancel?: () => void;
    onLoad?: () => void;
    container?: string;
  }

  export default class PaystackPop {
    constructor();
    newTransaction(options: PaystackOptions): void;
    cancelTransaction(): void;
    resumeTransaction(accessCode: string): void;
  }
}

