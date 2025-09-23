import { Product, Stock } from '@prisma/client';
import { ProductDto } from 'src/dto/productDto';

export class ProductMapper {
  static toDto(product: Product & { stock?: Stock | null }): ProductDto {
    return {
      id: product.id,
      name: product.name,
      code: product.code,
      gold: {
        weight: product.weight_gold,
        price: product.price_gold,
        quantity: product.stock?.quantity_gold ?? 0,
      },
      silver: {
        weight: product.weight_silver,
        price: product.price_silver,
        quantity: product.stock?.quantity_silver ?? 0,
      },
      copper: {
        weight: product.weight_copper,
        price: product.price_copper,
        quantity: product.stock?.quantity_copper ?? 0,
      },
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
  static toDtos(
    products: (Product & { stock?: Stock | null })[],
  ): ProductDto[] {
    return products.map((product) => this.toDto(product));
  }
}
