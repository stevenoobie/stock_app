import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { SaleDto } from '../dto/saleDto';
import { PaginationDto } from '../dto/paginationDto';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('')
  async createSale(@Body() createSaleDto: SaleDto, @Req() req: any) {
    const user = req.user;
    return this.salesService.createSale(createSaleDto, user);
  }

  @HttpCode(HttpStatus.OK)
  @Get('all')
  async getAllSalesPaginated(@Query() paginationDto: PaginationDto) {
    return this.salesService.getAllSalesPaginated(paginationDto);
  }
  @HttpCode(HttpStatus.OK)
  @Get('/:id')
  async getSaleById(@Param('id', ParseIntPipe) id: number) {
    return this.salesService.getSaleById(id);
  }

  @HttpCode(HttpStatus.OK)
  @Put('/:id')
  async updateSale(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSaleDto: SaleDto,
    @Req() req: any,
  ) {
    const user = req.user;
    return this.salesService.updateSale(id, updateSaleDto, user);
  }
  @HttpCode(HttpStatus.OK)
  @Delete('/:id')
  async deleteSale(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const user = req.user;
    return this.salesService.deleteSale(id, user);
  }
}
