import { Inject, Injectable, Logger } from '@nestjs/common';
import { Result, err, ok } from 'neverthrow';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  ITransactionRepository,
  ITransactionRepositorySymbol,
  DatabaseError,
} from '../../domain/repositories/ITransactionRepository';
import {
  IProductRepository,
  IProductRepositorySymbol,
} from '../../../products/domain/repositories/IProductRepository';
import { UpdateTransactionStatusDto } from '../dtos/UpdateTransactionStatusDto';
import { Transaction } from '../../domain/entities/Transaction';

@Injectable()
export class UpdateTransactionStatusUseCase {
  private readonly logger = new Logger(UpdateTransactionStatusUseCase.name);

  constructor(
    @Inject(ITransactionRepositorySymbol)
    private readonly transactionRepo: ITransactionRepository,
    @Inject(IProductRepositorySymbol)
    private readonly productRepo: IProductRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    transactionId: string,
    dto: UpdateTransactionStatusDto,
  ): Promise<Result<Transaction, Error>> {
    // 1. Find the transaction
    const findResult = await this.transactionRepo.findById(transactionId);
    if (findResult.isErr()) return err(findResult.error);

    const transaction = findResult.value;
    if (!transaction) {
      return err(new Error(`Transaction ${transactionId} not found`));
    }

    // 2. Map Wompi status to our domain status
    const mappedStatus = this.mapWompiStatus(dto.status);

    // 3. Atomically update status + decrement stock if APPROVED
    try {
      await this.prisma.$transaction(async (tx) => {
        // Update the transaction status + paymentProviderId
        await tx.transaction.update({
          where: { id: transactionId },
          data: {
            status: mappedStatus as any,
            paymentProviderId: dto.paymentProviderId ?? null,
            paymentMethod: dto.paymentMethod ?? null,
          },
        });

        // Decrement stock only on APPROVED
        if (mappedStatus === 'APPROVED') {
          for (const item of transaction.items) {
            this.logger.log(
              `Decrementing stock for product ${item.productId} by ${item.quantity}`,
            );
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            });
          }

          // Create a new Delivery record linked to this transaction
          this.logger.log(
            `Creating delivery record for transaction ${transactionId}`,
          );
          await tx.delivery.create({
            data: {
              transactionId: transactionId,
              status: 'PENDING',
            },
          });
        }
      });

      // Return updated transaction
      transaction.status = mappedStatus as any;
      return ok(transaction);
    } catch (error) {
      this.logger.error('Error updating transaction status', error);
      return err(new DatabaseError(error));
    }
  }

  private mapWompiStatus(
    wompiStatus: string,
  ): 'PENDING' | 'APPROVED' | 'REJECTED' {
    switch (wompiStatus) {
      case 'APPROVED':
        return 'APPROVED';
      case 'DECLINED':
      case 'VOIDED':
      case 'ERROR':
        return 'REJECTED';
      default:
        return 'PENDING';
    }
  }
}
