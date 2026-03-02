import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ProductsModule } from '../products/products.module';
import { TransactionsController } from './infrastructure/controllers/transactions.controller';
import {
  CreateTransactionUseCase,
  GetTransactionByIdUseCase,
  GetAllTransactionsUseCase,
} from './application/use-cases/CreateTransactionUseCase';
import { UpdateTransactionStatusUseCase } from './application/use-cases/UpdateTransactionStatusUseCase';
import { PrismaTransactionRepository } from './infrastructure/repositories/prisma-transaction.repository';
import { ITransactionRepositorySymbol } from './domain/repositories/ITransactionRepository';

@Module({
  imports: [PrismaModule, ProductsModule],
  controllers: [TransactionsController],
  providers: [
    CreateTransactionUseCase,
    GetTransactionByIdUseCase,
    GetAllTransactionsUseCase,
    UpdateTransactionStatusUseCase,
    {
      provide: ITransactionRepositorySymbol,
      useClass: PrismaTransactionRepository,
    },
  ],
})
export class TransactionsModule {}
