import { Auth } from './data';

/**signUp body data */
export interface ISignUpData {
  companyName: string;
  companyNumber: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  auth: Auth;
}

/**member signUp body data */
export interface IMemberSignUpData {
  email: string;
  password: string;
  name: string;
  phone: string;
  auth: Auth;
}

export interface ISignInData {
  email: string;
  password: string;
}

export interface IEditUserData {
  id: number;
  email: string;
  name: string;
  phone: string;
  auth: string;
  status: string;
}
