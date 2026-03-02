import { Result } from 'neverthrow';
import { Product } from '../entities/Product';

export class DatabaseError extends Error {
  constructor(public readonly cause: unknown) {
    super('Database operation failed');
  }
}

export interface IProductRepository {
  findAll(): Promise<Result<Product[], DatabaseError>>;
  findById(id: string): Promise<Result<Product | null, DatabaseError>>;
  updateStock(
    id: string,
    quantity: number,
  ): Promise<Result<void, DatabaseError>>;
}

export const IProductRepositorySymbol = Symbol('IProductRepository');
