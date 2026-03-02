import { Result } from 'neverthrow';
import { Transaction } from '../entities/Transaction';

export class DatabaseError extends Error {
  constructor(public readonly cause: unknown) {
    super('Database operation failed');
  }
}

export interface ITransactionRepository {
  save(transaction: Transaction): Promise<Result<Transaction, DatabaseError>>;
  findById(id: string): Promise<Result<Transaction | null, DatabaseError>>;
  findMany(): Promise<Result<Transaction[], DatabaseError>>;
}

export const ITransactionRepositorySymbol = Symbol('ITransactionRepository');
