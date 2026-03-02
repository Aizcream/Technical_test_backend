export type TransactionStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'REFUNDED';

export class TransactionItem {
  constructor(
    public readonly id: string,
    public readonly transactionId: string,
    public readonly productId: string,
    public readonly quantity: number,
    public readonly priceUnit: number,
    public readonly selectedVariant: string | null,
  ) {}
}

export class Transaction {
  private constructor(
    public readonly id: string,
    public readonly clientId: string,
    public readonly amount: number,
    public status: TransactionStatus,
    public readonly createdAt: Date,
    public paymentProviderId: string | null,
    public paymentMethod: string | null,
    public shippingAddress: string | null,
    public readonly items: TransactionItem[],
  ) {}

  approve(): void {
    if (this.status === 'REJECTED') {
      throw new Error('Cannot approve a rejected transaction');
    }
    this.status = 'APPROVED';
  }

  reject(): void {
    if (this.status === 'APPROVED') {
      throw new Error('Cannot reject an already approved transaction');
    }
    this.status = 'REJECTED';
  }

  static create(props: {
    id: string;
    clientId: string;
    amount: number;
    status: TransactionStatus;
    createdAt: Date;
    paymentProviderId?: string | null;
    paymentMethod?: string | null;
    shippingAddress?: string | null;
    items?: TransactionItem[];
  }): Transaction {
    return new Transaction(
      props.id,
      props.clientId,
      props.amount,
      props.status,
      props.createdAt,
      props.paymentProviderId ?? null,
      props.paymentMethod ?? null,
      props.shippingAddress ?? null,
      props.items ?? [],
    );
  }
}
