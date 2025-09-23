import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PaginationDto } from '../dto/paginationDto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ExpenseDto } from '../dto/expenseDto';
import { GetStatsDto } from 'src/dto/statDto';

@Injectable()
export class ExpenseService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllExpensesPaginated(paginationDto: PaginationDto) {
    const skip = +(paginationDto.skip ?? 0);
    const take = +(paginationDto.take ?? 0);
    const search = paginationDto.search?.trim();

    const filters: Prisma.ExpenseWhereInput[] = [];

    if (search) {
      filters.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.ExpenseWhereInput =
      filters.length > 0 ? { AND: filters } : {};

    const [expenses, total] = await this.prisma.$transaction([
      this.prisma.expense.findMany({
        skip,
        take,
        where,
        orderBy: { date: 'desc' },
      }),
      this.prisma.expense.count({ where }),
    ]);

    return {
      data: expenses,
      total,
    };
  }

  async createExpense(dto: ExpenseDto) {
    try {
      const expense = await this.prisma.expense.create({
        data: {
          title: dto.title,
          description: dto.description,
          amount: dto.amount,
          date: dto.date,
        },
      });
      return expense;
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateExpense(id: number, dto: ExpenseDto) {
    try {
      return await this.prisma.expense.update({
        where: { id },
        data: {
          title: dto.title,
          description: dto.description,
          amount: dto.amount,
          date: dto.date,
        },
      });
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getExpenseById(id: number) {
    try {
      const expense = await this.prisma.expense.findUnique({
        where: { id },
      });
      if (!expense) {
        throw new HttpException('Expense not found.', HttpStatus.NOT_FOUND);
      }
      return expense;
    } catch (e) {
      throw new HttpException(e, HttpStatus.NOT_FOUND);
    }
  }

  async deleteExpense(id: number) {
    try {
      return await this.prisma.expense.delete({
        where: { id },
      });
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getStats(startDate: Date, endDate: Date) {
    // --- Daily sales and expenses ---
    const salesByDay = await this.prisma.sale.groupBy({
      by: ['createdAt'],
      _sum: { totalAfterDiscount: true },
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
    });

    const expensesByDay = await this.prisma.expense.groupBy({
      by: ['date'],
      _sum: { amount: true },
      where: {
        date: { gte: startDate, lte: endDate },
      },
    });

    // --- Build daily map ---
    const dailyMap: Record<
      string,
      { sales: number; expenses: number; profit: number }
    > = {};

    for (const s of salesByDay) {
      const day = s.createdAt.toISOString().slice(0, 10);
      if (!dailyMap[day]) dailyMap[day] = { sales: 0, expenses: 0, profit: 0 };
      dailyMap[day].sales += s._sum.totalAfterDiscount || 0;
    }

    for (const e of expensesByDay) {
      const day = e.date.toISOString().slice(0, 10);
      if (!dailyMap[day]) dailyMap[day] = { sales: 0, expenses: 0, profit: 0 };
      dailyMap[day].expenses += e._sum.amount || 0;
    }

    // compute profit per day
    for (const day in dailyMap) {
      const { sales, expenses } = dailyMap[day];
      dailyMap[day].profit = sales - expenses;
    }

    const dailyData = Object.entries(dailyMap).map(([date, vals]) => ({
      date,
      sales: vals.sales,
      expenses: vals.expenses,
      profit: vals.profit,
    }));

    // --- Totals from dailyData ---
    const totalSales = dailyData.reduce((sum, d) => sum + d.sales, 0);
    const totalExpenses = dailyData.reduce((sum, d) => sum + d.expenses, 0);

    // --- Weights (requires saleItems) ---
    const saleItems = await this.prisma.saleItem.findMany({
      where: {
        sale: {
          createdAt: { gte: startDate, lte: endDate },
        },
      },
      include: { product: true },
    });

    const weights = { gold: 0, silver: 0, copper: 0 };
    for (const item of saleItems) {
      if (item.material === 'gold') {
        weights.gold += item.quantity * item.product.weight_gold;
      } else if (item.material === 'silver') {
        weights.silver += item.quantity * item.product.weight_silver;
      } else if (item.material === 'copper') {
        weights.copper += item.quantity * item.product.weight_copper;
      }
    }

    return {
      totalSales,
      totalExpenses,
      profit: totalSales - totalExpenses,
      weights,
      dailyData,
    };
  }
}
