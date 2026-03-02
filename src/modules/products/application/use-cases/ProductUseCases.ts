import { Inject, Injectable } from '@nestjs/common';
import { Result, err, ok } from 'neverthrow';
import { Product } from '../../domain/entities/Product';
import {
  IProductRepository,
  IProductRepositorySymbol,
} from '../../domain/repositories/IProductRepository';

@Injectable()
export class GetAllProductsUseCase {
  constructor(
    @Inject(IProductRepositorySymbol)
    private readonly productRepo: IProductRepository,
  ) {}

  async execute(): Promise<Result<Product[], Error>> {
    return this.productRepo.findAll();
  }
}

@Injectable()
export class GetProductByIdUseCase {
  constructor(
    @Inject(IProductRepositorySymbol)
    private readonly productRepo: IProductRepository,
  ) {}

  async execute(id: string): Promise<Result<Product | null, Error>> {
    return this.productRepo.findById(id);
  }
}
