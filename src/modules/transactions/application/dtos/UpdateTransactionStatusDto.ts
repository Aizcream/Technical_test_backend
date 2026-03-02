import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TransactionStatusEnum {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING',
}

export class UpdateTransactionStatusDto {
  @ApiProperty({
    enum: TransactionStatusEnum,
    example: 'APPROVED',
    description: 'New status from Wompi',
  })
  @IsEnum(TransactionStatusEnum)
  status: TransactionStatusEnum;

  @ApiProperty({
    required: false,
    example: '15113-1772438743-25017',
    description: 'Wompi transaction ID (paymentProviderId)',
  })
  @IsOptional()
  @IsString()
  paymentProviderId?: string;

  @ApiProperty({
    required: false,
    example: 'CARD',
    description: 'Payment method type',
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
