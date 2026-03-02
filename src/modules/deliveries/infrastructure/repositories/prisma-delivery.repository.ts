import { Injectable } from '@nestjs/common';
import { Result, err, ok } from 'neverthrow';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Delivery, DeliveryStatus } from '../../domain/entities/Delivery';
import {
  DatabaseError,
  IDeliveryRepository,
} from '../../domain/repositories/IDeliveryRepository';

@Injectable()
export class PrismaDeliveryRepository implements IDeliveryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(delivery: Delivery): Promise<Result<Delivery, DatabaseError>> {
    try {
      await this.prisma.delivery.create({
        data: {
          id: delivery.id,
          transactionId: delivery.transactionId,
          status: delivery.status,
          shippingCompany: delivery.shippingCompany,
          trackingNumber: delivery.trackingNumber,
          estimatedArrivalDate: delivery.estimatedArrivalDate,
          shippingNotes: delivery.shippingNotes,
        },
      });
      return ok(delivery);
    } catch (error) {
      return err(new DatabaseError(error));
    }
  }

  async findByTransactionId(
    transactionId: string,
  ): Promise<Result<Delivery | null, DatabaseError>> {
    try {
      const d = await this.prisma.delivery.findUnique({
        where: { transactionId },
      });
      if (!d) return ok(null);
      return ok(
        Delivery.create({
          id: d.id,
          transactionId: d.transactionId,
          status: d.status as DeliveryStatus,
          shippingCompany: d.shippingCompany,
          trackingNumber: d.trackingNumber,
          estimatedArrivalDate: d.estimatedArrivalDate,
          actualArrivalDate: d.actualArrivalDate,
          shippingNotes: d.shippingNotes,
          createdAt: d.createdAt,
        }),
      );
    } catch (error) {
      return err(new DatabaseError(error));
    }
  }

  async findAll(): Promise<Result<Delivery[], DatabaseError>> {
    try {
      const data = await this.prisma.delivery.findMany({
        include: { transaction: { include: { client: true } } },
        orderBy: { createdAt: 'desc' },
      });
      const deliveries = data.map((d) =>
        Delivery.create({
          id: d.id,
          transactionId: d.transactionId,
          status: d.status as DeliveryStatus,
          shippingCompany: d.shippingCompany,
          trackingNumber: d.trackingNumber,
          estimatedArrivalDate: d.estimatedArrivalDate,
          actualArrivalDate: d.actualArrivalDate,
          shippingNotes: d.shippingNotes,
          createdAt: d.createdAt,
        }),
      );
      return ok(deliveries);
    } catch (error) {
      return err(new DatabaseError(error));
    }
  }

  async updateStatus(
    id: string,
    status: string,
  ): Promise<Result<Delivery, DatabaseError>> {
    try {
      const d = await this.prisma.delivery.update({
        where: { id },
        data: {
          status: status as any,
          ...(status === 'DELIVERED' ? { actualArrivalDate: new Date() } : {}),
        },
      });
      return ok(
        Delivery.create({
          id: d.id,
          transactionId: d.transactionId,
          status: d.status as DeliveryStatus,
          shippingCompany: d.shippingCompany,
          trackingNumber: d.trackingNumber,
          estimatedArrivalDate: d.estimatedArrivalDate,
          actualArrivalDate: d.actualArrivalDate,
          shippingNotes: d.shippingNotes,
          createdAt: d.createdAt,
        }),
      );
    } catch (error) {
      return err(new DatabaseError(error));
    }
  }
}
