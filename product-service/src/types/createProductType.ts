export type CreateProduct = (CreateProductDto: any) => Promise<{
  message: string;
  productId: string;
}>