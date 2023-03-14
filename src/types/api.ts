import { Auth } from './data';

/**signUp body data */
export interface ISignUp {
  companyName?: string;
  companyNumber?: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  auth: Auth;
}

/**user signUp  */
export interface IUserSignUp {
  email: string;
  password: string;
  name: string;
  phone: string;
  auth: Auth;
  companyId: number;
}

export interface ISignIn {
  email: string;
  password: string;
}
