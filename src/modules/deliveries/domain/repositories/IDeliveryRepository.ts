import { Result } from 'neverthrow';
import { Delivery } from '../entities/Delivery';

export class DatabaseError extends Error {
  constructor(public readonly cause: unknown) {
    super('Database operation failed');
  }
}

export interface IDeliveryRepository {
  save(delivery: Delivery): Promise<Result<Delivery, DatabaseError>>;
  findByTransactionId(
    transactionId: string,
  ): Promise<Result<Delivery | null, DatabaseError>>;
  findAll(): Promise<Result<Delivery[], DatabaseError>>;
  updateStatus(
    id: string,
    status: string,
  ): Promise<Result<Delivery, DatabaseError>>;
}

export const IDeliveryRepositorySymbol = Symbol('IDeliveryRepository');
