export class ProductDto {
  id?: number;
  name: string;
  code: string;
  gold: ProductSpecs;
  silver: ProductSpecs;
  copper: ProductSpecs;
  createdAt?: Date;
  updatedAt?: Date;
}
export class ProductSpecs {
  weight: number;
  price: number;
  quantity: number;
}
