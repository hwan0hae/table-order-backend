declare namespace Express {
  export interface Request {
    currentUser: {
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
    } | null;
    appCurrentUser: {
      id: number;
      tableNo: number;
    };
  }
}
