import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import {
  CreateTransactionUseCase,
  GetTransactionByIdUseCase,
  GetAllTransactionsUseCase,
} from '../../application/use-cases/CreateTransactionUseCase';
import { UpdateTransactionStatusUseCase } from '../../application/use-cases/UpdateTransactionStatusUseCase';
import { CreateTransactionDto } from '../../application/dtos/CreateTransactionDto';
import { UpdateTransactionStatusDto } from '../../application/dtos/UpdateTransactionStatusDto';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly getTransactionByIdUseCase: GetTransactionByIdUseCase,
    private readonly getAllTransactionsUseCase: GetAllTransactionsUseCase,
    private readonly updateTransactionStatusUseCase: UpdateTransactionStatusUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Creates a new transaction (Guest Checkout)' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({
    status: 201,
    description: 'Transaction successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  async create(@Body() dto: CreateTransactionDto, @Res() res: Response) {
    const result = await this.createTransactionUseCase.execute(dto);

    if (result.isErr()) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error creating transaction',
        error: result.error.message,
      });
    }

    return res.status(HttpStatus.CREATED).json({
      message: 'Transaction created',
      data: result.value,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all transactions (Admin)' })
  @ApiResponse({ status: 200 })
  async findAll(@Res() res: Response) {
    const result = await this.getAllTransactionsUseCase.execute();
    if (result.isErr()) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error fetching transactions' });
    }
    return res.status(HttpStatus.OK).json({ data: result.value });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction by ID' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const result = await this.getTransactionByIdUseCase.execute(id);
    if (result.isErr()) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error fetching transaction' });
    }
    if (!result.value) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: 'Transaction not found' });
    }
    return res.status(HttpStatus.OK).json({ data: result.value });
  }

  /**
   * PATCH /transactions/:id/status
   * Called by the frontend after Wompi confirms the payment.
   * Updates the transaction status and decrements stock if APPROVED.
   */
  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update transaction status and decrement stock if APPROVED',
  })
  @ApiBody({ type: UpdateTransactionStatusDto })
  @ApiResponse({ status: 200, description: 'Status updated.' })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionStatusDto,
    @Res() res: Response,
  ) {
    const result = await this.updateTransactionStatusUseCase.execute(id, dto);

    if (result.isErr()) {
      const errMsg = result.error.message;
      if (errMsg.includes('not found')) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: errMsg });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error updating transaction', error: errMsg });
    }

    return res.status(HttpStatus.OK).json({
      message: 'Transaction status updated',
      data: result.value,
    });
  }
}
