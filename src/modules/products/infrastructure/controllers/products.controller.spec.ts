import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import {
  GetAllProductsUseCase,
  GetProductByIdUseCase,
} from '../../application/use-cases/ProductUseCases';
import { ok, err } from 'neverthrow';

describe('ProductsController', () => {
  let controller: ProductsController;
  let getAllProducts: any;
  let getProductById: any;

  beforeEach(async () => {
    getAllProducts = {
      execute: jest.fn(),
    };
    getProductById = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: GetAllProductsUseCase, useValue: getAllProducts },
        { provide: GetProductByIdUseCase, useValue: getProductById },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return 200 and a list of products', async () => {
      const mockResult = [{ id: '1', name: 'Product A' }];
      getAllProducts.execute.mockResolvedValue(ok(mockResult));

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.findAll(res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: mockResult });
    });

    it('should return 500 if use case fails', async () => {
      getAllProducts.execute.mockResolvedValue(
        err(new Error('Internal error')),
      );

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.findAll(res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error fetching products',
      });
    });
  });

  describe('findOne', () => {
    it('should return 200 and the product if found', async () => {
      const mockProduct = { id: '1', name: 'Product A' };
      getProductById.execute.mockResolvedValue(ok(mockProduct));

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.findOne('1', res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: mockProduct });
      expect(getProductById.execute).toHaveBeenCalledWith('1');
    });

    it('should return 404 if product is not found', async () => {
      getProductById.execute.mockResolvedValue(ok(null));

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.findOne('1', res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Product not found' });
    });

    it('should return 500 if use case fails', async () => {
      getProductById.execute.mockResolvedValue(
        err(new Error('Internal error')),
      );

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.findOne('1', res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error fetching product',
      });
    });
  });
});
