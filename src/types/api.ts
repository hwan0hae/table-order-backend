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

/**user 추가  */
export interface IUserSignUp {
  email: string;
  password: string;
  name: string;
  phone: string;
  auth: Auth;
  companyId: number | undefined;
}

export interface ISignIn {
  email: string;
  password: string;
}
