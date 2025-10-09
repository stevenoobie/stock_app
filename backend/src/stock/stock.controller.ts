import {
  Controller,
  Get,
  HttpCode,
  Query,
  HttpStatus,
  Put,
  Body,
  Param,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { PaginationDto } from '../dto/paginationDto';
import { CreateStockDto } from '../dto/stockDto';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @HttpCode(HttpStatus.OK)
  @Get('all')
  async getAllStockPaginated(@Query() query: PaginationDto) {
    return await this.stockService.getAllStockPaginated(query);
  }

  @HttpCode(HttpStatus.CREATED)
  @Put('/:id')
  async createStock(@Body() dto: CreateStockDto) {
    return await this.stockService.updateStock(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/:id')
  async getStockForProduct(@Param('id', ParseIntPipe) id: number) {
    return await this.stockService.getStockForProduct(id);
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async deleteStockForProduct(@Param('id', ParseIntPipe) id: number) {
    return await this.stockService.updateStock({
      productId: id,
      quantity_gold: 0,
      quantity_copper: 0,
      quantity_silver: 0,
    });
  }
}
