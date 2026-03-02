import { Injectable } from '@nestjs/common';
import { Result, err, ok } from 'neverthrow';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Product, ProductVariant } from '../../domain/entities/Product';
import {
  DatabaseError,
  IProductRepository,
} from '../../domain/repositories/IProductRepository';

@Injectable()
export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Result<Product[], DatabaseError>> {
    try {
      const data = await this.prisma.product.findMany({
        where: { isActive: true },
        include: { variants: true },
        orderBy: { createdAt: 'desc' },
      });

      const products = data.map((p) =>
        Product.create({
          id: p.id,
          name: p.name,
          price: p.price,
          stock: p.stock,
          description: p.description,
          imageUrl: p.imageUrl,
          category: p.category,
          isActive: p.isActive,
          createdAt: p.createdAt,
          variants: p.variants.map(
            (v): ProductVariant => ({
              id: v.id,
              productId: v.productId,
              label: v.label,
              value: v.value,
            }),
          ),
        }),
      );
      return ok(products);
    } catch (error) {
      return err(new DatabaseError(error));
    }
  }

  async findById(id: string): Promise<Result<Product | null, DatabaseError>> {
    try {
      const p = await this.prisma.product.findUnique({
        where: { id },
        include: { variants: true },
      });
      if (!p) return ok(null);

      return ok(
        Product.create({
          id: p.id,
          name: p.name,
          price: p.price,
          stock: p.stock,
          description: p.description,
          imageUrl: p.imageUrl,
          category: p.category,
          isActive: p.isActive,
          createdAt: p.createdAt,
          variants: p.variants.map(
            (v): ProductVariant => ({
              id: v.id,
              productId: v.productId,
              label: v.label,
              value: v.value,
            }),
          ),
        }),
      );
    } catch (error) {
      return err(new DatabaseError(error));
    }
  }

  async updateStock(
    id: string,
    quantity: number,
  ): Promise<Result<void, DatabaseError>> {
    try {
      await this.prisma.product.update({
        where: { id },
        data: { stock: { decrement: quantity } },
      });
      return ok(undefined);
    } catch (error) {
      return err(new DatabaseError(error));
    }
  }
}
