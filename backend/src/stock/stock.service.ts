import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PaginationDto } from '../dto/paginationDto';
import { PrismaService } from '../prisma/prisma.service';
import { StockMapper } from './stock.mapper';
import { Prisma } from '@prisma/client';
import { CreateStockDto } from '../dto/stockDto';

@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllStockPaginated(paginationDto: PaginationDto) {
    const skip = +(paginationDto.skip ?? 0);
    const take = +(paginationDto.take ?? 0);
    const search = paginationDto.search?.trim();
    const threshold = +(paginationDto.threshold ?? 5);
    const gold = paginationDto.gold === 'true';
    const silver = paginationDto.silver === 'true';
    const copper = paginationDto.copper === 'true';

    const filters: Prisma.StockWhereInput[] = [];

    if (search) {
      filters.push({
        OR: [
          { product: { name: { contains: search, mode: 'insensitive' } } },
          { product: { code: { contains: search, mode: 'insensitive' } } },
        ],
      });
    }

    if (gold || silver || copper) {
      const lowStockConditions: Prisma.StockWhereInput[] = [];
      if (gold) lowStockConditions.push({ quantity_gold: { lte: threshold } });
      if (silver)
        lowStockConditions.push({ quantity_silver: { lte: threshold } });
      if (copper)
        lowStockConditions.push({ quantity_copper: { lte: threshold } });
      if (lowStockConditions.length > 0) {
        filters.push({ OR: lowStockConditions });
      }
    }

    const where: Prisma.StockWhereInput =
      filters.length > 0 ? { AND: filters } : {};

    const [stock, total] = await this.prisma.$transaction([
      this.prisma.stock.findMany({
        include: { product: true },
        skip,
        take,
        where,
      }),
      this.prisma.stock.count({ where }),
    ]);

    return {
      data: StockMapper.toDtos(stock),
      total,
    };
  }

  async updateStock(dto: CreateStockDto) {
    try {
      await this.prisma.stock.update({
        where: {
          productId: dto.productId,
        },
        data: {
          quantity_gold: dto.quantity_gold,
          quantity_silver: dto.quantity_silver,
          quantity_copper: dto.quantity_copper,
        },
      });
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getStockForProduct(id: number) {
    try {
      const stock = await this.prisma.stock.findFirst({
        where: {
          productId: id,
        },
        include: {
          product: {
            select: { id: true, name: true, code: true },
          },
        },
      });
      return stock;
    } catch (e) {
      throw new HttpException('Stock not found.', HttpStatus.NOT_FOUND);
    }
  }
}
