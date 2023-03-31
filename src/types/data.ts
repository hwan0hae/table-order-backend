export type Auth = 'OWNER' | 'ADMIN' | 'STAFF' | 'USER';
export type Status = '0' | '1' | '2';
export type four_status = '0' | '1' | '2' | '3';
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

/** user 추가  */
export interface IUserSignUp {
  email: string;
  password: string;
  name: string;
  phone: string;
  auth: Auth;
  companyId: number | undefined;
}

/** App */
export interface ITable {
  table_id: number;
  name?: string;
  table_no: number;
  loc_x: number;
  loc_y: number;
  type?: number;
  status: four_status;
  company_id: number;
  created_at: Date;
  updated_at: Date;
}
