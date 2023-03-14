export interface IUser {
  id: number;
  email: string;
  password: string;
  name: string;
  phone: string;
  company_id: number;
  created_at: Date;
  updated_at: Date;
  auth: Auth;
  status: Status;
}

export type Auth = 'OWNER' | 'ADMIN' | 'STAFF' | 'USER';
export type Status = 0 | 1 | 2;

export interface IRefreshTokenCompare {
  id: number;
  token: string;
}