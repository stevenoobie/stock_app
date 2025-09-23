import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductDto } from '../dto/productDto';
import { ProductMapper } from './product.mapper';
import { PaginationDto } from '../dto/paginationDto';
import * as XLSX from 'xlsx';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(dto: ProductDto) {
    const { name, code, gold, silver, copper } = dto;

    const product = await this.prisma.product.create({
      data: {
        name: name,
        code: code,
        price_gold: gold.price,
        price_silver: silver.price,
        price_copper: copper.price,
        weight_gold: gold.weight,
        weight_silver: silver.weight,
        weight_copper: copper.weight,
      },
    });
    if (product) {
      const stock = await this.prisma.stock.create({
        data: {
          productId: product.id,
          quantity_gold: gold.quantity,
          quantity_silver: silver.quantity,
          quantity_copper: copper.quantity,
        },
      });
    } else {
      throw new BadRequestException(
        "Couldn't create product",
        `Code: ${code} is already used.`,
      );
    }
    return product;
  }

  async getProductById(id: number) {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        stock: true,
      },
    });
    if (!product) {
      throw new NotFoundException();
    }

    return ProductMapper.toDto(product);
  }

  async updateProductById(id: number, productDto: ProductDto) {
    try {
      const product = await this.prisma.product.update({
        where: { id },
        include: { stock: true },
        data: {
          name: productDto.name,
          code: productDto.code,
          price_gold: productDto.gold.price,
          price_silver: productDto.silver.price,
          price_copper: productDto.copper.price,
          weight_gold: productDto.gold.weight,
          weight_silver: productDto.silver.weight,
          weight_copper: productDto.copper.weight,
          stock: {
            update: {
              quantity_gold: productDto.gold.quantity,
              quantity_silver: productDto.silver.quantity,
              quantity_copper: productDto.copper.quantity,
            },
          },
        },
      });

      return ProductMapper.toDto(product);
    } catch (error: any) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
  }

  async deleteProductById(id: number) {
    try {
      await this.prisma.product.delete({
        where: { id },
      });
    } catch (e: any) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return true;
  }

  async getAllProductsPaginated(paginationDto: PaginationDto) {
    const skip = +(paginationDto.skip ?? 0);
    const take = +(paginationDto.take ?? 0);
    const search = paginationDto.search?.trim();

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { code: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};
    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        include: { stock: true },
        skip,
        take,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: ProductMapper.toDtos(products),
      total,
    };
  }

  async getAllProductsNamesBySearch(search: string) {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { code: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const products = await this.prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        code: true,
        stock: {
          select: {
            quantity_gold: true,
            quantity_silver: true,
            quantity_copper: true,
          },
        },
      },
    });

    return products;
  }

  async getAllProductsWithStock() {
    const products = await this.prisma.product.findMany({
      include: { stock: true },
    });
    return ProductMapper.toDtos(products);
  }
  async importProducts(file: Express.Multer.File) {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<any>(sheet);

    for (const row of rows) {
      const dto = {
        name: row.productName,
        code: row.productCode,
        gold: {
          price: row.price_gold,
          weight: row.weight_gold,
          quantity: row.qty_gold,
        },
        silver: {
          price: row.price_silver,
          weight: row.weight_silver,
          quantity: row.qty_silver,
        },
        copper: {
          price: row.price_copper,
          weight: row.weight_copper,
          quantity: row.qty_copper,
        },
      };

      // Reuse your existing createProduct method
      await this.createProduct(dto);
    }

    return { message: 'Products imported successfully' };
  }
}
