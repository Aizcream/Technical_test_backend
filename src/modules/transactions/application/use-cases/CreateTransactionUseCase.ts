import { Inject, Injectable } from '@nestjs/common';
import { Result, err, ok } from 'neverthrow';
import { v4 as uuidv4 } from 'uuid';
import {
  Transaction,
  TransactionItem,
} from '../../domain/entities/Transaction';
import {
  ITransactionRepository,
  ITransactionRepositorySymbol,
  DatabaseError,
} from '../../domain/repositories/ITransactionRepository';
import { CreateTransactionDto } from '../dtos/CreateTransactionDto';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject(ITransactionRepositorySymbol)
    private readonly transactionRepo: ITransactionRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    dto: CreateTransactionDto,
  ): Promise<Result<Transaction, Error>> {
    // 1. Find or create the client by email (Guest Checkout pattern)
    let client = await this.prisma.client.findUnique({
      where: { email: dto.email },
    });

    if (!client) {
      client = await this.prisma.client.create({
        data: {
          name: dto.name,
          email: dto.email,
          documentNumber: dto.documentNumber,
          phone: dto.phone,
          address: dto.shippingAddress,
        },
      });
    }

    const transactionId = uuidv4();

    // 2. Map DTO items to Domain Items
    const items = dto.items.map(
      (item) =>
        new TransactionItem(
          uuidv4(),
          transactionId,
          item.productId,
          item.quantity,
          item.priceUnit,
          item.selectedVariant ?? null,
        ),
    );

    const transaction = Transaction.create({
      id: transactionId,
      clientId: client.id,
      amount: dto.amount,
      status: 'PENDING',
      createdAt: new Date(),
      shippingAddress: dto.shippingAddress,
      items,
    });

    // 3. Save (ROP)
    const saveResult = await this.transactionRepo.save(transaction);
    if (saveResult.isErr()) return err(saveResult.error);

    return ok(transaction);
  }
}

@Injectable()
export class GetTransactionByIdUseCase {
  constructor(
    @Inject(ITransactionRepositorySymbol)
    private readonly transactionRepo: ITransactionRepository,
  ) {}

  async execute(id: string): Promise<Result<Transaction | null, Error>> {
    return this.transactionRepo.findById(id);
  }
}

@Injectable()
export class GetAllTransactionsUseCase {
  constructor(
    @Inject(ITransactionRepositorySymbol)
    private readonly transactionRepo: ITransactionRepository,
  ) {}

  async execute(): Promise<Result<Transaction[], Error>> {
    return this.transactionRepo.findMany();
  }
}
