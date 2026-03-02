import { Test, TestingModule } from '@nestjs/testing';
import { ok, err } from 'neverthrow';
import { UpdateTransactionStatusUseCase } from './UpdateTransactionStatusUseCase';
import { ITransactionRepositorySymbol } from '../../domain/repositories/ITransactionRepository';
import { IProductRepositorySymbol } from '../../../products/domain/repositories/IProductRepository';
import { PrismaService } from '../../../../prisma/prisma.service';
import { UpdateTransactionStatusDto } from '../dtos/UpdateTransactionStatusDto';
import { Transaction } from '../../domain/entities/Transaction';

describe('UpdateTransactionStatusUseCase', () => {
  let useCase: UpdateTransactionStatusUseCase;
  let transactionRepo: any;
  let productRepo: any;
  let prisma: any;

  beforeEach(async () => {
    transactionRepo = {
      findById: jest.fn(),
    };

    productRepo = {};

    prisma = {
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTransactionStatusUseCase,
        {
          provide: ITransactionRepositorySymbol,
          useValue: transactionRepo,
        },
        {
          provide: IProductRepositorySymbol,
          useValue: productRepo,
        },
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    useCase = module.get<UpdateTransactionStatusUseCase>(
      UpdateTransactionStatusUseCase,
    );
  });

  describe('execute', () => {
    const transactionId = 'tx-1';

    // We mock the domain entity representation
    const mockTransactionContent = {
      id: transactionId,
      status: 'PENDING',
      amount: 1000,
      clientId: 'c-1',
      items: [{ productId: 'p-1', quantity: 2 }],
    };

    it('should return error if transaction is not found', async () => {
      transactionRepo.findById.mockResolvedValue(ok(null));

      const result = await useCase.execute(transactionId, {
        status: 'APPROVED' as any,
      });

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toContain('not found');
      }
    });

    it('should update status and decrement stock if APPROVED', async () => {
      // We simulate findById returning a transaction object
      const txEntity = { ...mockTransactionContent };
      transactionRepo.findById.mockResolvedValue(ok(txEntity));

      // We need to simulate Prisma transaction behavior
      // $transaction usually executes the callback, providing an object with prisma models
      const mockPrismaTxClient = {
        transaction: { update: jest.fn() },
        product: { update: jest.fn() },
        delivery: { create: jest.fn() },
      };

      prisma.$transaction.mockImplementation(async (callback: any) => {
        return callback(mockPrismaTxClient);
      });

      const dto: UpdateTransactionStatusDto = {
        status: 'APPROVED' as any,
        paymentProviderId: 'prov_123',
        paymentMethod: 'CARD',
      };

      const result = await useCase.execute(transactionId, dto);

      expect(prisma.$transaction).toHaveBeenCalled();

      // Verification of interior tx calls
      expect(mockPrismaTxClient.transaction.update).toHaveBeenCalledWith({
        where: { id: transactionId },
        data: expect.objectContaining({
          status: 'APPROVED',
          paymentProviderId: 'prov_123',
          paymentMethod: 'CARD',
        }),
      });

      expect(mockPrismaTxClient.product.update).toHaveBeenCalledWith({
        where: { id: 'p-1' },
        data: { stock: { decrement: 2 } },
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.status).toBe('APPROVED');
      }
    });

    it('should only update status and NOT decrement stock if DECLINED', async () => {
      const txEntity = { ...mockTransactionContent };
      transactionRepo.findById.mockResolvedValue(ok(txEntity));

      const mockPrismaTxClient = {
        transaction: { update: jest.fn() },
        product: { update: jest.fn() },
        delivery: { create: jest.fn() },
      };

      prisma.$transaction.mockImplementation(async (callback: any) => {
        return callback(mockPrismaTxClient);
      });

      const dto: UpdateTransactionStatusDto = {
        status: 'DECLINED' as any,
        // other fields optional
      };

      const result = await useCase.execute(transactionId, dto);

      expect(mockPrismaTxClient.transaction.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'REJECTED', // mapped status
          }),
        }),
      );

      // Should not decrement stock
      expect(mockPrismaTxClient.product.update).not.toHaveBeenCalled();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.status).toBe('REJECTED');
      }
    });

    it('should return error if prisma transaction fails', async () => {
      const txEntity = { ...mockTransactionContent };
      transactionRepo.findById.mockResolvedValue(ok(txEntity));

      const mockError = new Error('Prisma crash');
      prisma.$transaction.mockRejectedValue(mockError);

      const result = await useCase.execute(transactionId, {
        status: 'APPROVED' as any,
      });

      expect(result.isErr()).toBe(true);
    });
  });
});
