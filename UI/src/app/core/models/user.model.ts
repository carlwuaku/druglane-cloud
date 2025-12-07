export interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: number;
  name: string;
  license_key: string;
  is_activated: boolean;
  activated_at: string | null;
  activated_by_machine_id: string | null;
  license_status: string;
  license_issued_at: string;
  license_expires_at: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserData {
  id: number;
  role_id: number;
  company_id: number | null;
  name: string;
  email: string;
  email_verified_at: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  role: Role;
  company: Company | null;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role_id: number;
  company_id?: number | null;
  is_active?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role_id?: number;
  company_id?: number | null;
  is_active?: boolean;
}

export interface ProfileResponse {
  user: UserData;
  role: string;
  company: Company | null;
}

export interface LoginResponse extends ProfileResponse {
  token: string;
}

export class User {
  id: number;
  role_id: number;
  company_id: number | null;
  name: string;
  email: string;
  email_verified_at: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  role: Role;
  company: Company | null;
  roleName: string;
  token?: string;

  constructor(data?: ProfileResponse | LoginResponse) {
    if (data) {
      this.id = data.user.id;
      this.role_id = data.user.role_id;
      this.company_id = data.user.company_id;
      this.name = data.user.name;
      this.email = data.user.email;
      this.email_verified_at = data.user.email_verified_at;
      this.is_active = data.user.is_active;
      this.last_login_at = data.user.last_login_at;
      this.created_at = data.user.created_at;
      this.updated_at = data.user.updated_at;
      this.role = data.user.role;
      this.company = data.company;
      this.roleName = data.role;
      this.token = 'token' in data ? data.token : undefined;
    } else {
      this.id = 0;
      this.role_id = 0;
      this.company_id = null;
      this.name = '';
      this.email = '';
      this.email_verified_at = null;
      this.is_active = false;
      this.last_login_at = null;
      this.created_at = '';
      this.updated_at = '';
      this.role = {
        id: 0,
        name: '',
        display_name: '',
        description: '',
        created_at: '',
        updated_at: ''
      };
      this.company = null;
      this.roleName = '';
    }
  }

  get isAdmin(): boolean {
    return this.role.name === 'admin';
  }

  get isCompanyUser(): boolean {
    return this.role.name === 'company_user';
  }

  get displayName(): string {
    return this.name;
  }

  get hasCompany(): boolean {
    return this.company !== null;
  }
}

// Legacy interface for backward compatibility
export interface IUser {
  id: string;
  display_name: string;
  email: string;
  token: string;
  type: string;
  region: string;
  username: string;
  picture: string;
  active: string;
  phone: string;
  permissions: string[];
  google_authenticator_setup: string;
  uuid: string;
}
