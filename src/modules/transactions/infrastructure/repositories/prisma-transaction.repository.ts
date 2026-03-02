import { Injectable } from '@nestjs/common';
import { Result, err, ok } from 'neverthrow';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  Transaction,
  TransactionItem,
  TransactionStatus,
} from '../../domain/entities/Transaction';
import {
  DatabaseError,
  ITransactionRepository,
} from '../../domain/repositories/ITransactionRepository';

@Injectable()
export class PrismaTransactionRepository implements ITransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(
    transaction: Transaction,
  ): Promise<Result<Transaction, DatabaseError>> {
    try {
      await this.prisma.transaction.upsert({
        where: { id: transaction.id },
        update: {
          status: transaction.status,
          paymentProviderId: transaction.paymentProviderId,
          paymentMethod: transaction.paymentMethod,
        },
        create: {
          id: transaction.id,
          clientId: transaction.clientId,
          amount: transaction.amount,
          status: transaction.status,
          shippingAddress: transaction.shippingAddress,
          items: {
            create: transaction.items.map((i) => ({
              id: i.id,
              productId: i.productId,
              quantity: i.quantity,
              priceUnit: i.priceUnit,
              selectedVariant: i.selectedVariant,
            })),
          },
        },
      });
      return ok(transaction);
    } catch (error) {
      return err(new DatabaseError(error));
    }
  }

  async findById(
    id: string,
  ): Promise<Result<Transaction | null, DatabaseError>> {
    try {
      const data = await this.prisma.transaction.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!data) return ok(null);

      const items = data.items.map(
        (i) =>
          new TransactionItem(
            i.id,
            i.transactionId,
            i.productId,
            i.quantity,
            i.priceUnit,
            i.selectedVariant,
          ),
      );

      return ok(
        Transaction.create({
          id: data.id,
          clientId: data.clientId,
          amount: data.amount,
          status: data.status as TransactionStatus,
          createdAt: data.createdAt,
          paymentProviderId: data.paymentProviderId,
          paymentMethod: data.paymentMethod,
          shippingAddress: data.shippingAddress,
          items,
        }),
      );
    } catch (error) {
      return err(new DatabaseError(error));
    }
  }

  async findMany(): Promise<Result<Transaction[], DatabaseError>> {
    try {
      const data = await this.prisma.transaction.findMany({
        include: { items: true, client: true },
        orderBy: { createdAt: 'desc' },
      });

      const transactions = data.map((d) => {
        const items = d.items.map(
          (i) =>
            new TransactionItem(
              i.id,
              i.transactionId,
              i.productId,
              i.quantity,
              i.priceUnit,
              i.selectedVariant,
            ),
        );
        return Transaction.create({
          id: d.id,
          clientId: d.clientId,
          amount: d.amount,
          status: d.status as TransactionStatus,
          createdAt: d.createdAt,
          paymentProviderId: d.paymentProviderId,
          paymentMethod: d.paymentMethod,
          shippingAddress: d.shippingAddress,
          items,
        });
      });

      return ok(transactions);
    } catch (error) {
      return err(new DatabaseError(error));
    }
  }
}
