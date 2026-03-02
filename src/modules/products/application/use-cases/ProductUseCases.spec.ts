import { Test, TestingModule } from '@nestjs/testing';
import { ok, err } from 'neverthrow';
import {
  GetAllProductsUseCase,
  GetProductByIdUseCase,
} from './ProductUseCases';
import { IProductRepositorySymbol } from '../../domain/repositories/IProductRepository';
import { Product } from '../../domain/entities/Product';

describe('ProductUseCases', () => {
  let getAllUseCase: GetAllProductsUseCase;
  let getByIdUseCase: GetProductByIdUseCase;
  let productRepo: any;

  beforeEach(async () => {
    productRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllProductsUseCase,
        GetProductByIdUseCase,
        {
          provide: IProductRepositorySymbol,
          useValue: productRepo,
        },
      ],
    }).compile();

    getAllUseCase = module.get<GetAllProductsUseCase>(GetAllProductsUseCase);
    getByIdUseCase = module.get<GetProductByIdUseCase>(GetProductByIdUseCase);
  });

  describe('GetAllProductsUseCase', () => {
    it('should return all products from repository', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', price: 100, stock: 10, isActive: true },
        { id: '2', name: 'Product 2', price: 200, stock: 5, isActive: true },
      ];
      productRepo.findAll.mockResolvedValue(ok(mockProducts));

      const result = await getAllUseCase.execute();

      expect(productRepo.findAll).toHaveBeenCalled();
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual(mockProducts);
        expect(result.value).toHaveLength(2);
      }
    });

    it('should return error if repository fails', async () => {
      const dbError = new Error('DB Error');
      productRepo.findAll.mockResolvedValue(err(dbError));

      const result = await getAllUseCase.execute();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBe(dbError);
      }
    });
  });

  describe('GetProductByIdUseCase', () => {
    it('should return a product by id', async () => {
      const mockProduct = {
        id: '1',
        name: 'Product 1',
        price: 100,
        stock: 10,
        isActive: true,
      };
      productRepo.findById.mockResolvedValue(ok(mockProduct));

      const result = await getByIdUseCase.execute('1');

      expect(productRepo.findById).toHaveBeenCalledWith('1');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual(mockProduct);
      }
    });

    it('should return null if product not found', async () => {
      productRepo.findById.mockResolvedValue(ok(null));

      const result = await getByIdUseCase.execute('999');

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBeNull();
      }
    });

    it('should return error if repository fails', async () => {
      const dbError = new Error('DB Error');
      productRepo.findById.mockResolvedValue(err(dbError));

      const result = await getByIdUseCase.execute('1');

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBe(dbError);
      }
    });
  });
});
