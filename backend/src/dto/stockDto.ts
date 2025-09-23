export class StockDto {
  id: number;
  productName: string;
  productCode: string;
  gold: number;
  silver: number;
  copper: number;
  createdAt: Date;
  updatedAt: Date;
}

export class CreateStockDto {
  productId: number;
  quantity_gold: number;
  quantity_silver: number;
  quantity_copper: number;
}
