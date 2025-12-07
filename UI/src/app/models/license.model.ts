export interface LicenseStatus {
  isActivated: boolean;
  facilityName?: string;
  phone?: string;
  email?: string;
  location?: string;
  contactPerson?: string;
  registrationNumber?: string;
  licenseNumber?: string;
  activatedOn?: Date;
  expiresOn?: Date;
  daysUntilExpiration?: number;
  message?: string;
}

export interface ActivationRequest {
  activationKey: string;
}

export interface ActivationResponse {
  success: boolean;
  message: string;
  facilityData?: {
    name: string;
    phone: string;
    email: string;
    location: string;
    contactPerson?: string;
    registrationNumber?: string;
    licenseNumber?: string;
    expiresOn?: Date;
  };
}

// API response from druglanepms.calgadsoftwares.com
export interface DruglanePMSResponse {
  success: boolean;
  data?: {
    branch_name: string;
    phone: string;
    email: string;
    location: string;
    contact_person?: string;
    registration_number?: string;
    license_number?: string;
  };
  message?: string;
}
