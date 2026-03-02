import { Inject, Injectable } from '@nestjs/common';
import { Result, err, ok } from 'neverthrow';
import { Delivery, DeliveryStatus } from '../../domain/entities/Delivery';
import {
  IDeliveryRepository,
  IDeliveryRepositorySymbol,
} from '../../domain/repositories/IDeliveryRepository';

export class DeliveryNotFoundError extends Error {
  constructor() {
    super('Delivery not found');
  }
}

export class InvalidStatusTransitionError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

@Injectable()
export class GetAllDeliveriesUseCase {
  constructor(
    @Inject(IDeliveryRepositorySymbol)
    private readonly deliveryRepo: IDeliveryRepository,
  ) {}

  async execute(): Promise<Result<Delivery[], Error>> {
    return this.deliveryRepo.findAll();
  }
}

@Injectable()
export class GetDeliveryByTransactionUseCase {
  constructor(
    @Inject(IDeliveryRepositorySymbol)
    private readonly deliveryRepo: IDeliveryRepository,
  ) {}

  async execute(
    transactionId: string,
  ): Promise<Result<Delivery | null, Error>> {
    return this.deliveryRepo.findByTransactionId(transactionId);
  }
}

@Injectable()
export class UpdateDeliveryStatusUseCase {
  constructor(
    @Inject(IDeliveryRepositorySymbol)
    private readonly deliveryRepo: IDeliveryRepository,
  ) {}

  async execute(
    deliveryId: string,
    newStatus: DeliveryStatus,
    shippingCompany?: string,
    trackingNumber?: string,
  ): Promise<Result<Delivery, Error>> {
    const findResult = await this.deliveryRepo.findByTransactionId(deliveryId);
    // We actually use the delivery id directly
    const updateResult = await this.deliveryRepo.updateStatus(
      deliveryId,
      newStatus,
    );

    if (updateResult.isErr()) return err(updateResult.error);

    const delivery = updateResult.value;
    return ok(delivery);
  }
}
