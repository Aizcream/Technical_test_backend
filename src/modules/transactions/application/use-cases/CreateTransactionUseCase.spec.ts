import { Test, TestingModule } from '@nestjs/testing';
import { ok, err } from 'neverthrow';
import { CreateTransactionUseCase } from './CreateTransactionUseCase';
import { ITransactionRepositorySymbol } from '../../domain/repositories/ITransactionRepository';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateTransactionDto } from '../dtos/CreateTransactionDto';
import { Transaction } from '../../domain/entities/Transaction';

describe('CreateTransactionUseCase', () => {
  let useCase: CreateTransactionUseCase;
  let transactionRepo: any;
  let prisma: any;

  beforeEach(async () => {
    transactionRepo = {
      save: jest.fn(),
    };

    prisma = {
      client: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionUseCase,
        {
          provide: ITransactionRepositorySymbol,
          useValue: transactionRepo,
        },
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    useCase = module.get<CreateTransactionUseCase>(CreateTransactionUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const dto: CreateTransactionDto = {
      email: 'test@example.com',
      name: 'John Doe',
      amount: 1000,
      documentNumber: '123456789',
      phone: '555123456',
      shippingAddress: '123 Test St',
      items: [
        {
          productId: 'p-1',
          quantity: 2,
          priceUnit: 500,
        },
      ],
    };

    it('should create a new client if not found and save transaction', async () => {
      // Mock client not found
      prisma.client.findUnique.mockResolvedValue(null);

      // Mock client created
      const newClient = { id: 'c-1', email: dto.email, name: dto.name };
      prisma.client.create.mockResolvedValue(newClient);

      // Mock save transaction success
      transactionRepo.save.mockResolvedValue(ok(undefined));

      const result = await useCase.execute(dto);

      expect(prisma.client.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(prisma.client.create).toHaveBeenCalled();

      expect(transactionRepo.save).toHaveBeenCalled();
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const tx = result.value;
        expect(tx.clientId).toBe('c-1');
        expect(tx.amount).toBe(1000);
        expect(tx.status).toBe('PENDING');
        expect(tx.items).toHaveLength(1);
      }
    });

    it('should use existing client if found', async () => {
      // Mock client found
      const existingClient = { id: 'c-2', email: dto.email, name: dto.name };
      prisma.client.findUnique.mockResolvedValue(existingClient);

      // Mock save transaction success
      transactionRepo.save.mockResolvedValue(ok(undefined));

      const result = await useCase.execute(dto);

      expect(prisma.client.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(prisma.client.create).not.toHaveBeenCalled();

      expect(transactionRepo.save).toHaveBeenCalled();
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const tx = result.value;
        expect(tx.clientId).toBe('c-2');
      }
    });

    it('should return error if save fails', async () => {
      const existingClient = { id: 'c-2', email: dto.email, name: dto.name };
      prisma.client.findUnique.mockResolvedValue(existingClient);

      const dbError = new Error('DB Error');
      transactionRepo.save.mockResolvedValue(err(dbError));

      const result = await useCase.execute(dto);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBe(dbError);
      }
    });
  });
});
