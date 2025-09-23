import { Stock } from '@prisma/client';
import { StockDto } from 'src/dto/stockDto';

export class StockMapper {
  static toDto(
    stock: Stock & { product: { name: string; code: string } },
  ): StockDto {
    return {
      id: stock.id,
      productName: stock.product.name,
      productCode: stock.product.code,
      gold: stock.quantity_gold,
      silver: stock.quantity_silver,
      copper: stock.quantity_copper,
      createdAt: stock.createdAt,
      updatedAt: stock.updatedAt,
    };
  }
  static toDtos(
    stocks: (Stock & { product: { name: string; code: string } })[],
  ): StockDto[] {
    return stocks.map((stock) => this.toDto(stock));
  }
}
