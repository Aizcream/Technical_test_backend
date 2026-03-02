import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDeliveryStatusDto {
  @ApiProperty({
    enum: [
      'PENDING',
      'PREPARING',
      'IN_TRANSIT',
      'DELIVERED',
      'RETURNED',
      'LOST',
    ],
    example: 'IN_TRANSIT',
  })
  @IsEnum([
    'PENDING',
    'PREPARING',
    'IN_TRANSIT',
    'DELIVERED',
    'RETURNED',
    'LOST',
  ])
  status: string;

  @ApiProperty({ required: false, example: 'Servientrega' })
  @IsOptional()
  @IsString()
  shippingCompany?: string;

  @ApiProperty({ required: false, example: 'SRV-123456789' })
  @IsOptional()
  @IsString()
  trackingNumber?: string;
}

export class TrackDeliveryDto {
  @ApiProperty({ example: 'juan@correo.com' })
  @IsString()
  email: string;

  @ApiProperty({ example: 'uuid-de-la-transaccion' })
  @IsString()
  transactionId: string;
}
