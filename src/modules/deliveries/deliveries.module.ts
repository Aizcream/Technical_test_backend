import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { DeliveriesController } from './infrastructure/controllers/deliveries.controller';
import {
  GetAllDeliveriesUseCase,
  GetDeliveryByTransactionUseCase,
  UpdateDeliveryStatusUseCase,
} from './application/use-cases/DeliveryUseCases';
import { PrismaDeliveryRepository } from './infrastructure/repositories/prisma-delivery.repository';
import { IDeliveryRepositorySymbol } from './domain/repositories/IDeliveryRepository';

@Module({
  imports: [PrismaModule],
  controllers: [DeliveriesController],
  providers: [
    GetAllDeliveriesUseCase,
    GetDeliveryByTransactionUseCase,
    UpdateDeliveryStatusUseCase,
    {
      provide: IDeliveryRepositorySymbol,
      useClass: PrismaDeliveryRepository,
    },
  ],
  exports: [IDeliveryRepositorySymbol],
})
export class DeliveriesModule {}
