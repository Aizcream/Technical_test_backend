import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import {
  CreateTransactionUseCase,
  GetTransactionByIdUseCase,
  GetAllTransactionsUseCase,
} from '../../application/use-cases/CreateTransactionUseCase';
import { UpdateTransactionStatusUseCase } from '../../application/use-cases/UpdateTransactionStatusUseCase';
import { ok, err } from 'neverthrow';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let createTxUseCase: any;
  let getTxByIdUseCase: any;
  let getAllTxUseCase: any;
  let updateTxStatusUseCase: any;

  beforeEach(async () => {
    createTxUseCase = { execute: jest.fn() };
    getTxByIdUseCase = { execute: jest.fn() };
    getAllTxUseCase = { execute: jest.fn() };
    updateTxStatusUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        { provide: CreateTransactionUseCase, useValue: createTxUseCase },
        { provide: GetTransactionByIdUseCase, useValue: getTxByIdUseCase },
        { provide: GetAllTransactionsUseCase, useValue: getAllTxUseCase },
        {
          provide: UpdateTransactionStatusUseCase,
          useValue: updateTxStatusUseCase,
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
  });

  const mockRes = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should return 201 on success', async () => {
      const res = mockRes();
      const mockTx = { id: 'uuid', status: 'PENDING' };
      createTxUseCase.execute.mockResolvedValue(ok(mockTx));

      const dto: any = { amount: 100 };
      await controller.create(dto, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Transaction created',
        data: mockTx,
      });
    });

    it('should return 500 on failure', async () => {
      const res = mockRes();
      createTxUseCase.execute.mockResolvedValue(err(new Error('Fatal error')));

      await controller.create({} as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error creating transaction',
        error: 'Fatal error',
      });
    });
  });

  describe('findAll', () => {
    it('should return 200 and list of transactions', async () => {
      const res = mockRes();
      const mocks = [{ id: '1' }];
      getAllTxUseCase.execute.mockResolvedValue(ok(mocks));

      await controller.findAll(res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: mocks });
    });

    it('should return 500 on error', async () => {
      const res = mockRes();
      getAllTxUseCase.execute.mockResolvedValue(err(new Error('DB error')));

      await controller.findAll(res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('findOne', () => {
    it('should return 200 and the transaction', async () => {
      const res = mockRes();
      getTxByIdUseCase.execute.mockResolvedValue(ok({ id: '1' }));

      await controller.findOne('1', res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: { id: '1' } });
    });

    it('should return 404 if not found', async () => {
      const res = mockRes();
      getTxByIdUseCase.execute.mockResolvedValue(ok(null));

      await controller.findOne('1', res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 on error', async () => {
      const res = mockRes();
      getTxByIdUseCase.execute.mockResolvedValue(err(new Error('Error')));

      await controller.findOne('1', res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateStatus', () => {
    it('should return 200 on success', async () => {
      const res = mockRes();
      updateTxStatusUseCase.execute.mockResolvedValue(
        ok({ id: '1', status: 'APPROVED' }),
      );

      await controller.updateStatus('1', { status: 'APPROVED' } as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Transaction status updated',
        data: { id: '1', status: 'APPROVED' },
      });
    });

    it('should return 404 if transaction not found', async () => {
      const res = mockRes();
      updateTxStatusUseCase.execute.mockResolvedValue(
        err(new Error('Transaction 1 not found')),
      );

      await controller.updateStatus('1', { status: 'APPROVED' } as any, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 for other errors', async () => {
      const res = mockRes();
      updateTxStatusUseCase.execute.mockResolvedValue(
        err(new Error('Prisma error')),
      );

      await controller.updateStatus('1', { status: 'APPROVED' } as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
