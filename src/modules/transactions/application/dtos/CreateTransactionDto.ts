import {
  IsString,
  IsEmail,
  IsNumber,
  Min,
  IsUUID,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TransactionItemDto {
  @ApiProperty({ description: 'ID of the product' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 1, description: 'Quantity of items' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 45000, description: 'Price per unit in COP' })
  @IsNumber()
  @Min(0)
  priceUnit: number;

  @ApiProperty({
    required: false,
    example: 'Talla: 9',
    description:
      'Selected variant (e.g. Talla: 9, Concentración: Eau de Parfum)',
  })
  @IsOptional()
  @IsString()
  selectedVariant?: string;
}

export class CreateTransactionDto {
  @ApiProperty({ example: 'juan@correo.com' })
  @IsEmail({}, { message: 'El correo debe ser válido' })
  email: string;

  @ApiProperty({ example: 'Juan Perez' })
  @IsString()
  name: string;

  @ApiProperty({ example: '123456789', required: false })
  @IsOptional()
  @IsString()
  documentNumber?: string;

  @ApiProperty({ example: '3001234567', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Calle 123 #45-67, Bogotá', required: false })
  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @ApiProperty({ example: 45000, description: 'Total amount in COP' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ type: [TransactionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionItemDto)
  items: TransactionItemDto[];
}
