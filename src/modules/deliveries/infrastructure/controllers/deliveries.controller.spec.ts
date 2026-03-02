import { Test, TestingModule } from '@nestjs/testing';
import { DeliveriesController } from './deliveries.controller';
import {
  GetAllDeliveriesUseCase,
  GetDeliveryByTransactionUseCase,
  UpdateDeliveryStatusUseCase,
} from '../../application/use-cases/DeliveryUseCases';
import { ok, err } from 'neverthrow';
import { HttpStatus } from '@nestjs/common';

describe('DeliveriesController', () => {
  let controller: DeliveriesController;
  let getAllUseCase: any;
  let trackUseCase: any;
  let updateUseCase: any;

  beforeEach(async () => {
    getAllUseCase = { execute: jest.fn() };
    trackUseCase = { execute: jest.fn() };
    updateUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveriesController],
      providers: [
        { provide: GetAllDeliveriesUseCase, useValue: getAllUseCase },
        { provide: GetDeliveryByTransactionUseCase, useValue: trackUseCase },
        { provide: UpdateDeliveryStatusUseCase, useValue: updateUseCase },
      ],
    }).compile();

    controller = module.get<DeliveriesController>(DeliveriesController);
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

  describe('findAll', () => {
    it('should return all deliveries', async () => {
      const res = mockRes();
      const mockData = [{ id: '1' }];
      getAllUseCase.execute.mockResolvedValue(ok(mockData));

      await controller.findAll(res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({ data: mockData });
    });

    it('should return 500 if use case fails', async () => {
      const res = mockRes();
      getAllUseCase.execute.mockResolvedValue(err(new Error('Fail')));

      await controller.findAll(res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('track', () => {
    it('should return delivery details if found', async () => {
      const res = mockRes();
      const mockData = { id: '1', transactionId: 'tx-1' };
      trackUseCase.execute.mockResolvedValue(ok(mockData));

      await controller.track('tx-1', res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({ data: mockData });
    });

    it('should return 404 if not found', async () => {
      const res = mockRes();
      trackUseCase.execute.mockResolvedValue(ok(null));

      await controller.track('tx-1', res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });

    it('should return 500 if error occurs', async () => {
      const res = mockRes();
      trackUseCase.execute.mockResolvedValue(err(new Error('Fail')));

      await controller.track('tx-1', res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('update', () => {
    it('should update delivery status', async () => {
      const res = mockRes();
      const mockData = { id: '1', status: 'IN_TRANSIT' };
      updateUseCase.execute.mockResolvedValue(ok(mockData));

      await controller.update('1', { status: 'IN_TRANSIT' } as any, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Delivery status updated',
        data: mockData,
      });
    });

    it('should return 400 if update fails', async () => {
      const res = mockRes();
      updateUseCase.execute.mockResolvedValue(err(new Error('Bad Request')));

      await controller.update('1', { status: 'INVALID' } as any, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });
  });
});
