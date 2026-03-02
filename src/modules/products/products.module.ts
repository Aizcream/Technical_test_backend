import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ProductsController } from './infrastructure/controllers/products.controller';
import {
  GetAllProductsUseCase,
  GetProductByIdUseCase,
} from './application/use-cases/ProductUseCases';
import { PrismaProductRepository } from './infrastructure/repositories/prisma-product.repository';
import { IProductRepositorySymbol } from './domain/repositories/IProductRepository';

@Module({
  imports: [PrismaModule],
  controllers: [ProductsController],
  providers: [
    GetAllProductsUseCase,
    GetProductByIdUseCase,
    {
      provide: IProductRepositorySymbol,
      useClass: PrismaProductRepository,
    },
  ],
  exports: [IProductRepositorySymbol],
})
export class ProductsModule {}
