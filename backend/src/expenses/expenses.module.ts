import { Module } from '@nestjs/common';
import { ExpensesController } from './expenses.controller';
import { ExpenseService } from './expenses.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ExpensesController],
  providers: [ExpenseService, PrismaService],
})
export class ExpensesModule {}
