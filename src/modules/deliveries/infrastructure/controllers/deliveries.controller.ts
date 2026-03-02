import {
  Controller,
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
  GetAllDeliveriesUseCase,
  GetDeliveryByTransactionUseCase,
  UpdateDeliveryStatusUseCase,
} from '../../application/use-cases/DeliveryUseCases';
import { UpdateDeliveryStatusDto } from '../../application/dtos/DeliveryDtos';
import { DeliveryStatus } from '../../domain/entities/Delivery';

@ApiTags('deliveries')
@Controller('deliveries')
export class DeliveriesController {
  constructor(
    private readonly getAllDeliveries: GetAllDeliveriesUseCase,
    private readonly getDeliveryByTransaction: GetDeliveryByTransactionUseCase,
    private readonly updateDeliveryStatus: UpdateDeliveryStatusUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all deliveries (Admin Dashboard)' })
  @ApiResponse({ status: 200, description: 'List of all deliveries.' })
  async findAll(@Res() res: Response) {
    const result = await this.getAllDeliveries.execute();
    if (result.isErr()) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error fetching deliveries' });
    }
    return res.status(HttpStatus.OK).json({ data: result.value });
  }

  @Get('track/:transactionId')
  @ApiOperation({
    summary: 'Track a delivery by transaction ID (Guest Tracking)',
  })
  @ApiResponse({ status: 200, description: 'Delivery status found.' })
  @ApiResponse({
    status: 404,
    description: 'No delivery found for this transaction.',
  })
  async track(
    @Param('transactionId') transactionId: string,
    @Res() res: Response,
  ) {
    const result = await this.getDeliveryByTransaction.execute(transactionId);
    if (result.isErr()) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error tracking delivery' });
    }
    if (!result.value) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: 'No delivery found for this transaction' });
    }
    return res.status(HttpStatus.OK).json({ data: result.value });
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update delivery status (Admin)' })
  @ApiBody({ type: UpdateDeliveryStatusDto })
  @ApiResponse({ status: 200, description: 'Delivery status updated.' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDeliveryStatusDto,
    @Res() res: Response,
  ) {
    const result = await this.updateDeliveryStatus.execute(
      id,
      dto.status as DeliveryStatus,
      dto.shippingCompany,
      dto.trackingNumber,
    );

    if (result.isErr()) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: result.error.message });
    }

    return res.status(HttpStatus.OK).json({
      message: 'Delivery status updated',
      data: result.value,
    });
  }
}
