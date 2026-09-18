export interface CustomFeatureSettings {
  id: string | null;
  secureRetagEnabled: boolean;
  retagPinConfigured: boolean;
  retagWhatsappEnabled: boolean;
}

export interface RetagSecurityRequest {
  enabled: boolean;
}

export interface SetRetagPinRequest {
  pin: string;
  confirmPin: string;
}

export interface VerifyRetagPinRequest {
  pin: string;
}

export interface VerifyRetagPinResponse {
  valid: boolean;
}

export interface ChangeRetagPinRequest {
  currentPin: string;
  newPin: string;
  confirmNewPin: string;
}

export interface ResetRetagPinRequest {
  newPin: string;
  confirmNewPin: string;
}

export interface RetagWhatsappRequest {
  enabled: boolean;
}