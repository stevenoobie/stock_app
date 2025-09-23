import {
  Body,
  Controller,
  HttpStatus,
  Post,
  HttpCode,
  Put,
  Param,
  Get,
  Delete,
  Query,
  ParseIntPipe,
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ProductDto } from '../dto/productDto';
import { ProductsService } from './products.service';
import { PaginationDto } from '../dto/paginationDto';
import * as XLSX from 'xlsx';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  // Create product
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createProduct(@Body() dto: ProductDto) {
    return await this.productService.createProduct(dto);
  }

  // Import products
  @Post('import')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async importProducts(@UploadedFile() file: Express.Multer.File) {
    return this.productService.importProducts(file);
  }

  // Download template
  @Get('template')
  async downloadTemplate(@Res() res: Response) {
    const workbook = XLSX.utils.book_new();
    const sheetData = [
      [
        'productName',
        'productCode',
        'price_gold',
        'weight_gold',
        'qty_gold',
        'price_silver',
        'weight_silver',
        'qty_silver',
        'price_copper',
        'weight_copper',
        'qty_copper',
      ],
    ];
    const sheet = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, sheet, 'Products');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader(
      'Content-Disposition',
      'attachment; filename="products_template.xlsx"',
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    return res.end(buffer);
  }

  // Get all products paginated
  @HttpCode(HttpStatus.OK)
  @Get('all')
  async getAllProductsPaginated(@Query() query: PaginationDto) {
    return await this.productService.getAllProductsPaginated(query);
  }

  // Get all products with stock
  @HttpCode(HttpStatus.OK)
  @Get('all/stock')
  async getAllProductsWithStock() {
    return await this.productService.getAllProductsWithStock();
  }

  // Search products by name
  @HttpCode(HttpStatus.OK)
  @Get()
  async getAllProductsNamesBySearch(@Query('search') search: string) {
    return await this.productService.getAllProductsNamesBySearch(search);
  }

  // Get product by ID (⚠️ keep last to avoid overlap)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async getProductById(@Param('id', ParseIntPipe) id: number) {
    return await this.productService.getProductById(id);
  }

  // Update product by ID
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() productDto: ProductDto,
  ) {
    return await this.productService.updateProductById(id, productDto);
  }

  // Delete product by ID
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async destroyProduct(@Param('id', ParseIntPipe) id: number) {
    return await this.productService.deleteProductById(id);
  }
}
