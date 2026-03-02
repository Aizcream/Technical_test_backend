import { Controller, Get, Param, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  GetAllProductsUseCase,
  GetProductByIdUseCase,
} from '../../application/use-cases/ProductUseCases';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly getAllProducts: GetAllProductsUseCase,
    private readonly getProductById: GetProductByIdUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all active products with their variants' })
  @ApiResponse({ status: 200, description: 'List of products returned.' })
  async findAll(@Res() res: Response) {
    const result = await this.getAllProducts.execute();

    if (result.isErr()) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error fetching products' });
    }

    return res.status(HttpStatus.OK).json({ data: result.value });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single product by ID with its variants' })
  @ApiResponse({ status: 200, description: 'Product found.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const result = await this.getProductById.execute(id);

    if (result.isErr()) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error fetching product' });
    }

    if (!result.value) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: 'Product not found' });
    }

    return res.status(HttpStatus.OK).json({ data: result.value });
  }
}
