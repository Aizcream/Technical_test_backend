export type DeliveryStatus =
  | 'PENDING'
  | 'PREPARING'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'RETURNED'
  | 'LOST';

export class Delivery {
  private constructor(
    public readonly id: string,
    public readonly transactionId: string,
    public status: DeliveryStatus,
    public shippingCompany: string | null,
    public trackingNumber: string | null,
    public estimatedArrivalDate: Date | null,
    public actualArrivalDate: Date | null,
    public shippingNotes: string | null,
    public readonly createdAt: Date,
  ) {}

  updateStatus(newStatus: DeliveryStatus): void {
    const validTransitions: Record<DeliveryStatus, DeliveryStatus[]> = {
      PENDING: ['PREPARING'],
      PREPARING: ['IN_TRANSIT'],
      IN_TRANSIT: ['DELIVERED', 'RETURNED', 'LOST'],
      DELIVERED: [],
      RETURNED: [],
      LOST: [],
    };

    if (!validTransitions[this.status].includes(newStatus)) {
      throw new Error(`Cannot transition from ${this.status} to ${newStatus}`);
    }

    this.status = newStatus;

    if (newStatus === 'DELIVERED') {
      this.actualArrivalDate = new Date();
    }
  }

  static create(props: {
    id: string;
    transactionId: string;
    status: DeliveryStatus;
    shippingCompany?: string | null;
    trackingNumber?: string | null;
    estimatedArrivalDate?: Date | null;
    actualArrivalDate?: Date | null;
    shippingNotes?: string | null;
    createdAt: Date;
  }): Delivery {
    return new Delivery(
      props.id,
      props.transactionId,
      props.status,
      props.shippingCompany ?? null,
      props.trackingNumber ?? null,
      props.estimatedArrivalDate ?? null,
      props.actualArrivalDate ?? null,
      props.shippingNotes ?? null,
      props.createdAt,
    );
  }
}
