import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SaleDto } from '../dto/saleDto';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../dto/paginationDto';
import { SaleMapper } from './sale.mapper';
import { User } from '../interface/user.interface';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  private HOUR = 1000 * 60 * 60;
  private OWN_EDIT_WINDOW_MS = 24 * this.HOUR;

  async createSale(createSaleDto: SaleDto, user: User) {
    const productIds = createSaleDto.sales.map((item) => item.productId);
    const stocks = await this.prisma.stock.findMany({
      where: { productId: { in: productIds } },
    });
    const stockMap = new Map(stocks.map((s) => [s.productId, s]));

    for (const item of createSaleDto.sales) {
      const stock = stockMap.get(item.productId);
      if (!stock) {
        throw new HttpException(
          `No stock record found for product ${item.productName}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      let availableQty = 0;
      if (item.material === 'gold') availableQty = stock.quantity_gold;
      if (item.material === 'silver') availableQty = stock.quantity_silver;
      if (item.material === 'copper') availableQty = stock.quantity_copper;
      if (item.qty > availableQty) {
        throw new HttpException(
          `Product ${item.productName} (${item.material}), requested ${item.qty}, available ${availableQty}`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const res = await this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: {
          totalBeforeDiscount: createSaleDto.totalBeforeDiscount,
          globalDiscount: createSaleDto.globalDiscount ?? 0,
          totalAfterDiscount: createSaleDto.totalAfterDiscount,
          clientName: createSaleDto.customerName,
          clientPhone: createSaleDto.customerPhone,
          createdById: user.id,
          saleItems: {
            create: createSaleDto.sales.map((item) => ({
              productId: item.productId,
              material: item.material,
              quantity: item.qty,
              unitPrice: item.price,
              discountPercentage: item.discount ?? 0,
            })),
          },
        },
      });

      for (const item of createSaleDto.sales) {
        if (item.material === 'gold') {
          await tx.stock.update({
            where: { productId: item.productId },
            data: { quantity_gold: { decrement: item.qty } },
          });
        } else if (item.material === 'silver') {
          await tx.stock.update({
            where: { productId: item.productId },
            data: { quantity_silver: { decrement: item.qty } },
          });
        } else if (item.material === 'copper') {
          await tx.stock.update({
            where: { productId: item.productId },
            data: { quantity_copper: { decrement: item.qty } },
          });
        }
      }

      return sale;
    });

    return res;
  }

  async getAllSalesPaginated(paginationDto: PaginationDto) {
    const skip = +(paginationDto.skip ?? 0);
    const take = +(paginationDto.take ?? 10);
    const search = paginationDto.search?.trim();

    const where = search
      ? {
          OR: [
            { clientName: { contains: search, mode: 'insensitive' as const } },
            { clientPhone: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [sales, total] = await this.prisma.$transaction([
      this.prisma.sale.findMany({
        include: {
          saleItems: {
            include: {
              product: true,
            },
          },
        },
        skip,
        take,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.sale.count({ where }),
    ]);

    return {
      data: SaleMapper.toDtos(sales),
      total,
    };
  }

  async getSaleById(id: number) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        saleItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!sale) {
      throw new HttpException(
        `Sale with id ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return SaleMapper.toDto(sale);
  }

  async updateSale(id: number, updateSaleDto: SaleDto, user: User) {
    await this.ensureCanModify(id, user);

    return this.prisma.$transaction(async (tx) => {
      const oldSale = await tx.sale.findUnique({
        where: { id },
        include: { saleItems: true },
      });

      if (!oldSale) {
        throw new HttpException(
          `Sale with id ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      for (const item of oldSale.saleItems) {
        if (item.material === 'gold') {
          await tx.stock.update({
            where: { productId: item.productId },
            data: { quantity_gold: { increment: item.quantity } },
          });
        } else if (item.material === 'silver') {
          await tx.stock.update({
            where: { productId: item.productId },
            data: { quantity_silver: { increment: item.quantity } },
          });
        } else if (item.material === 'copper') {
          await tx.stock.update({
            where: { productId: item.productId },
            data: { quantity_copper: { increment: item.quantity } },
          });
        }
      }

      const productIds = updateSaleDto.sales.map((item) => item.productId);
      const stocks = await tx.stock.findMany({
        where: { productId: { in: productIds } },
      });
      const stockMap = new Map(stocks.map((s) => [s.productId, s]));

      for (const item of updateSaleDto.sales) {
        const stock = stockMap.get(item.productId);
        if (!stock) {
          throw new HttpException(
            `No stock record found for product ${item.productName}`,
            HttpStatus.BAD_REQUEST,
          );
        }

        let availableQty = 0;
        if (item.material === 'gold') availableQty = stock.quantity_gold;
        if (item.material === 'silver') availableQty = stock.quantity_silver;
        if (item.material === 'copper') availableQty = stock.quantity_copper;

        if (item.qty > availableQty) {
          throw new HttpException(
            `Product ${item.productName} (${item.material}), requested ${item.qty}, available ${availableQty}`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      await tx.saleItem.deleteMany({ where: { saleId: id } });

      const updatedSale = await tx.sale.update({
        where: { id },
        data: {
          totalBeforeDiscount: updateSaleDto.totalBeforeDiscount,
          globalDiscount: updateSaleDto.globalDiscount ?? 0,
          totalAfterDiscount: updateSaleDto.totalAfterDiscount,
          clientName: updateSaleDto.customerName,
          clientPhone: updateSaleDto.customerPhone,
          saleItems: {
            create: updateSaleDto.sales.map((item) => ({
              productId: item.productId,
              material: item.material,
              quantity: item.qty,
              unitPrice: item.price,
              discountPercentage: item.discount ?? 0,
            })),
          },
        },
        include: {
          saleItems: { include: { product: true } },
        },
      });

      for (const item of updateSaleDto.sales) {
        if (item.material === 'gold') {
          await tx.stock.update({
            where: { productId: item.productId },
            data: { quantity_gold: { decrement: item.qty } },
          });
        } else if (item.material === 'silver') {
          await tx.stock.update({
            where: { productId: item.productId },
            data: { quantity_silver: { decrement: item.qty } },
          });
        } else if (item.material === 'copper') {
          await tx.stock.update({
            where: { productId: item.productId },
            data: { quantity_copper: { decrement: item.qty } },
          });
        }
      }

      return SaleMapper.toDto(updatedSale);
    });
  }

  async deleteSale(id: number, user: User) {
    await this.ensureCanModify(id, user);
    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id },
        include: { saleItems: true },
      });

      if (!sale) {
        throw new HttpException(
          `Sale with id ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      for (const item of sale.saleItems) {
        if (item.material === 'gold') {
          await tx.stock.update({
            where: { productId: item.productId },
            data: { quantity_gold: { increment: item.quantity } },
          });
        } else if (item.material === 'silver') {
          await tx.stock.update({
            where: { productId: item.productId },
            data: { quantity_silver: { increment: item.quantity } },
          });
        } else if (item.material === 'copper') {
          await tx.stock.update({
            where: { productId: item.productId },
            data: { quantity_copper: { increment: item.quantity } },
          });
        }
      }

      await tx.saleItem.deleteMany({ where: { saleId: id } });
      await tx.sale.delete({ where: { id } });

      return { message: `Sale ${id} deleted successfully` };
    });
  }

  private async ensureCanModify(saleId: number, user: User) {
    const sale = await this.prisma.sale.findUnique({ where: { id: saleId } });
    if (!sale) throw new NotFoundException('Sale not found');

    if (user.role === 'admin') return sale;

    const ownerId = sale.createdById;

    if (!ownerId || ownerId !== user.id) {
      throw new ForbiddenException('You can only modify your own sales');
    }

    const age = Date.now() - new Date(sale.createdAt).getTime();
    if (age > this.OWN_EDIT_WINDOW_MS) {
      throw new ForbiddenException(
        'You can no longer edit this sale (time limit expired)',
      );
    }

    return sale;
  }
}
