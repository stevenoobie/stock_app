export class PaginationDto {
  skip: number;
  take: number;
  search: string;
  threshold?: number;
  gold?: string;
  silver?: string;
  copper?: string;
}
