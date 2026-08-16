export interface BusinessSettings {
  id: number;

  businessName: string;

  headerSubtitle: string;

  adminName: string;

  adminSubtitle: string;

  logoUrl: string | null;
}


export interface BusinessSettingsRequest {
  businessName: string;

  headerSubtitle: string;

  adminName: string;

  adminSubtitle: string;

  logoUrl: string | null;
}