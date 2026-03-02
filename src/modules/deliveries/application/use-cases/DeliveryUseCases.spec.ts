import { Test, TestingModule } from '@nestjs/testing';
import { ok, err } from 'neverthrow';
import {
  GetAllDeliveriesUseCase,
  GetDeliveryByTransactionUseCase,
  UpdateDeliveryStatusUseCase,
} from './DeliveryUseCases';
import { IDeliveryRepositorySymbol } from '../../domain/repositories/IDeliveryRepository';
import { DeliveryStatus } from '../../domain/entities/Delivery';

describe('DeliveryUseCases', () => {
  let getAllDeliveries: GetAllDeliveriesUseCase;
  let getDeliveryByTransaction: GetDeliveryByTransactionUseCase;
  let updateDeliveryStatus: UpdateDeliveryStatusUseCase;
  let deliveryRepo: any;

  beforeEach(async () => {
    deliveryRepo = {
      findAll: jest.fn(),
      findByTransactionId: jest.fn(),
      updateStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllDeliveriesUseCase,
        GetDeliveryByTransactionUseCase,
        UpdateDeliveryStatusUseCase,
        {
          provide: IDeliveryRepositorySymbol,
          useValue: deliveryRepo,
        },
      ],
    }).compile();

    getAllDeliveries = module.get<GetAllDeliveriesUseCase>(
      GetAllDeliveriesUseCase,
    );
    getDeliveryByTransaction = module.get<GetDeliveryByTransactionUseCase>(
      GetDeliveryByTransactionUseCase,
    );
    updateDeliveryStatus = module.get<UpdateDeliveryStatusUseCase>(
      UpdateDeliveryStatusUseCase,
    );
  });

  describe('GetAllDeliveriesUseCase', () => {
    it('should return all deliveries', async () => {
      const mockDeliveries = [{ id: '1', status: 'PENDING' }];
      deliveryRepo.findAll.mockResolvedValue(ok(mockDeliveries));

      const result = await getAllDeliveries.execute();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual(mockDeliveries);
      }
    });
  });

  describe('GetDeliveryByTransactionUseCase', () => {
    it('should return a delivery by transaction id', async () => {
      const mockDelivery = { id: '1', transactionId: 'tx-1' };
      deliveryRepo.findByTransactionId.mockResolvedValue(ok(mockDelivery));

      const result = await getDeliveryByTransaction.execute('tx-1');

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual(mockDelivery);
      }
    });
  });

  describe('UpdateDeliveryStatusUseCase', () => {
    it('should update delivery status', async () => {
      const mockDelivery = { id: '1', status: 'IN_TRANSIT' };
      deliveryRepo.updateStatus.mockResolvedValue(ok(mockDelivery));

      const result = await updateDeliveryStatus.execute(
        '1',
        'IN_TRANSIT' as any,
        'Carrier',
        'TRACK123',
      );

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual(mockDelivery);
      }
      expect(deliveryRepo.updateStatus).toHaveBeenCalledWith('1', 'IN_TRANSIT');
    });

    it('should return error if update fails', async () => {
      deliveryRepo.updateStatus.mockResolvedValue(
        err(new Error('Update failed')),
      );

      const result = await updateDeliveryStatus.execute(
        '1',
        'IN_TRANSIT' as any,
      );

      expect(result.isErr()).toBe(true);
    });
  });
});
