export interface BusinessSettings {
  id: number;
  businessName: string;
  whatsappDisplayName: string;
  headerSubtitle: string;
  adminName: string;
  adminSubtitle: string;
  logoUrl: string | null;
  cgstPercentage: number;
  sgstPercentage: number;
  taxEnabled: boolean;
  taxIncluded: boolean;
  customFeatures: CustomFeatures;
}

export interface CustomFeatures {
  secureRetagEnabled: boolean;
  retagPinConfigured: boolean;
  retagWhatsappEnabled: boolean;
}

export interface BusinessSettingsRequest {
  businessName: string;
  whatsappDisplayName: string;
  headerSubtitle: string;
  adminName: string;
  adminSubtitle: string;
  logoUrl: string | null;
}