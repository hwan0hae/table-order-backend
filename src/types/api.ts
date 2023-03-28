import { Auth } from './data';

/** signUp body data */
export interface ISignUpData {
  companyName: string;
  companyNumber: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  auth: Auth;
}

/** member signUp body data */
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

export interface IProductData {
  id: number;
  name: string;
  price?: number;
  description?: string;
  image_url?: string;
}

export interface IProductAddData {
  name: string;
  price?: number;
  description?: string;
}

export interface IProductEditData {
  id: number;
  name: string;
  price?: number;
  description?: string;
}

/** App */
export interface IAppSignInData {
  email: string;
  password: string;
  tableNo: number;
}
export interface IBasketData {
  id: number;
  name: string;
  price: string;
  description: string;
  imageUrl: string;
  count: number;
}

export interface IOrderData {
  productId: number;
  count: number;
}

export interface ITableAddData {
  tableNo: number;
  name?: string;
  locX?: number;
  locY?: number;
}
