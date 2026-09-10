export interface TaxSetting {

  id: string;

  gstNumber: string | null;

  cgstPercentage: number;

  sgstPercentage: number;

  taxEnabled: boolean;

  taxIncluded: boolean;

}


export interface TaxSettingRequest {

  gstNumber: string | null;

  cgstPercentage: number;

  sgstPercentage: number;

  taxEnabled: boolean;

  taxIncluded: boolean;

}