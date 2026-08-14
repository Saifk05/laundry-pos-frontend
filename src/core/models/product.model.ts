export type PricingUnit =
  | 'PC'
  | 'KG';

export interface ProductService {
  id: string;
  name: string;
  price: number;
}

export interface ProductType {
  id: string;
  name: string;
  services: ProductService[];
}

export interface Product {
  id: string;
  name: string;
  unit: PricingUnit;
  active: boolean;
  types: ProductType[];
}

export interface ProductServiceRequest {
  name: string;
  price: number;
}

export interface ProductTypeRequest {
  name: string;
  services: ProductServiceRequest[];
}

export interface ProductRequest {
  name: string;
  unit: PricingUnit;
  active: boolean;
  types: ProductTypeRequest[];
}

export interface ProductListResponse {
  message: string;
  products: Product[];
}