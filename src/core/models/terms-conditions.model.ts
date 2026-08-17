export interface TermsConditionsResponse {
  id: number | null;

  termsText: string;

  active: boolean;

  createdAt: string | null;

  updatedAt: string | null;

  message: string;
}


export interface TermsConditionsRequest {
  termsText: string;
}