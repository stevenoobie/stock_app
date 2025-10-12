import { Sale, SaleItem, Product } from '@prisma/client';
import { SaleDto } from 'src/dto/saleDto';

export class SaleMapper {
  static toDto(
    sale: Sale & {
      saleItems: (SaleItem & { product: Product | null })[];
    },
  ): SaleDto {
    return {
      id: sale.id,
      customerName: sale.clientName ?? undefined,
      customerPhone: sale.clientPhone ?? undefined,
      createdById: sale.createdById,
      sales: sale.saleItems.map((item) => ({
        productId: item.productId,
        productName: item.product?.name ?? undefined,
        material: item.material as 'gold' | 'silver' | 'copper',
        qty: item.quantity,
        price: item.unitPrice,
        discount: item.discountPercentage ?? undefined,
      })),
      globalDiscount: sale.globalDiscount ?? undefined,
      totalBeforeDiscount: sale.totalBeforeDiscount,
      totalAfterDiscount: sale.totalAfterDiscount,
      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt,
    };
  }

  static toDtos(
    sales: (Sale & {
      saleItems: (SaleItem & { product: Product | null })[];
    })[],
  ): SaleDto[] {
    return sales.map((sale) => this.toDto(sale));
  }
}
