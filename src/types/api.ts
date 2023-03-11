/**signUp body data */
export interface SignUp {
  companyName?: string;
  companyNumber?: string;
  email: string;
  password: string;
  name: string;
  phone: string;
}

/**user signUp  */
export interface UserSignUp {
  email: string;
  password: string;
  name: string;
  phone: string;
  auth: Auth;
  companyId: number;
}

type Auth = 'OWNER' | 'ADMIN' | 'STAFF' | 'USER';
