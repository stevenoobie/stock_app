export type Product = {
  id: number;
  name: string;
  code: string;
  gold: ProductSpecs;
  silver: ProductSpecs;
  copper: ProductSpecs;
  createdAt: string;
  updatedAt: string;
};
export type ProductSpecs = {
  weight: number;
  price: number;
  quantity: number;
};
