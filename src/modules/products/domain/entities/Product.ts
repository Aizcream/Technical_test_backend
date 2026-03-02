export interface ProductVariant {
  id: string;
  productId: string;
  label: string; // "Talla", "Color", "Concentración"
  value: string; // "9", "Negro", "Eau de Parfum"
}

export class Product {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly price: number,
    public readonly stock: number,
    public readonly description: string | null,
    public readonly imageUrl: string | null,
    public readonly category: string | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly variants: ProductVariant[],
  ) {}

  static create(props: {
    id: string;
    name: string;
    price: number;
    stock: number;
    description?: string | null;
    imageUrl?: string | null;
    category?: string | null;
    isActive: boolean;
    createdAt: Date;
    variants?: ProductVariant[];
  }): Product {
    return new Product(
      props.id,
      props.name,
      props.price,
      props.stock,
      props.description ?? null,
      props.imageUrl ?? null,
      props.category ?? null,
      props.isActive,
      props.createdAt,
      props.variants ?? [],
    );
  }
}
