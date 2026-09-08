export interface TaxSetting {

  id: string;

  gstNumber: string | null;

  cgstPercentage: number;

  sgstPercentage: number;

  taxIncluded: boolean;
}


export interface TaxSettingRequest {

  gstNumber: string | null;

  cgstPercentage: number;

  sgstPercentage: number;

  taxIncluded: boolean;
}