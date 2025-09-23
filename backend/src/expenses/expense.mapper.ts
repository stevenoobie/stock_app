import { Expense, Stock } from '@prisma/client';
import { ExpenseDto } from 'src/dto/expenseDto';

export class ExpenseMapper {
  static toDto(expense: Expense): ExpenseDto {
    return {
      id: expense.id,
      title: expense.title,
      description: expense.description ?? undefined,
      amount: expense.amount,
      date: expense.date,

      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    };
  }
  static toDtos(expenses: Expense[]): ExpenseDto[] {
    return expenses.map((expense) => this.toDto(expense));
  }
}
