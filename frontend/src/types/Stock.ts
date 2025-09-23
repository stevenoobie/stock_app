export type Stock = {
  id: number;
  productName: string;
  productCode: string;
  gold: number;
  silver: number;
  copper: number;
  createdAt: string;
  updatedAt: string;
};

export type StockEntry = {
  id: number;
  name: string;
  code: string;
  stock?: {
    quantity_gold: number;
    quantity_silver: number;
    quantity_copper: number;
  };
};
