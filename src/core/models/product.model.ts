export type PricingUnit =
  | 'PER_PIECE'
  | 'PER_KG';


export interface ProductVariantResponse {
  id: string;
  name: string;
}


export interface ProductServiceResponse {
  serviceId: string;
  name: string;
  price: number;
}


export interface ProductRequirementResponse {
  requirementId: string;
  name: string;
  price: number;
}


export interface ProductResponse {
  id: string;

  name: string;

  category: string;

  icon: string;

  pricingUnit?: PricingUnit;

  active?: boolean;

  variants?: ProductVariantResponse[];

  services: ProductServiceResponse[];

  requirements?: ProductRequirementResponse[];
}


/* =========================================
   CREATE PRODUCT
========================================= */

export interface ProductServiceRequest {
  name: string;
  price: number;
}


export interface ProductRequirementRequest {
  name: string;
  price: number;
}


export interface ProductRequest {
  name: string;

  category: string;

  icon: string;

  pricingUnit: PricingUnit;

  variants: string[];

  services: ProductServiceRequest[];

  requirements?: ProductRequirementRequest[];
}