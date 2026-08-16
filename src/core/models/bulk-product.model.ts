import {
  Product
} from './product.model';


export interface BulkProductResponse {
  message: string;
  totalProducts: number;
  createdProducts: number;
  updatedProducts: number;
  products: Product[];
}