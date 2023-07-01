import { object, string, number, date, InferType } from 'yup';

export const ProductDataSchema = object({
  title: string().required().trim().min(1),
  description: string().required().trim().min(1),
  count: number().required().positive().integer(),
  price: number().required().positive().integer(),
});

export type CreateProductDto = InferType<typeof ProductDataSchema>;
