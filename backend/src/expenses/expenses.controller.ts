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
} from '@nestjs/common';
import { PaginationDto } from '../dto/paginationDto';
import { ExpenseDto } from '../dto/expenseDto';
import { ExpenseService } from './expenses.service';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expenseService: ExpenseService) {}

  // Create expense
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createExpense(@Body() dto: ExpenseDto) {
    return this.expenseService.createExpense(dto);
  }

  // Get all expenses (paginated + optional search)
  @HttpCode(HttpStatus.OK)
  @Get('all')
  async getAllExpensesPaginated(@Query() query: PaginationDto) {
    return this.expenseService.getAllExpensesPaginated(query);
  }
  // Stats endpoint
  @HttpCode(HttpStatus.OK)
  @Get('stats')
  async getStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const now = new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate
      ? new Date(endDate)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    return this.expenseService.getStats(start, end);
  }

  // Get expense by ID
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async getExpenseById(@Param('id', ParseIntPipe) id: number) {
    return this.expenseService.getExpenseById(id);
  }

  // Update expense
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async updateExpense(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ExpenseDto,
  ) {
    return this.expenseService.updateExpense(id, dto);
  }

  // Delete expense
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async deleteExpense(@Param('id', ParseIntPipe) id: number) {
    return this.expenseService.deleteExpense(id);
  }
}
