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
  token: string;
}
export type Auth = 'OWNER' | 'ADMIN' | 'STAFF' | 'USER';
export type Status = 0 | 1 | 2;

/**user 추가  */
export interface IUserSignUp {
  email: string;
  password: string;
  name: string;
  phone: string;
  auth: Auth;
  companyId: number | undefined;
}
