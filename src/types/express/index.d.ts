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
      auth: 'OWNER' | 'ADMIN' | 'STAFF' | 'USER';
      status: '0' | '1' | '2';
      token: string;
    } | null;

    appCurrentTable: {
      id: number;
      name?: string;
      table_no: number;
      loc_x: number;
      loc_y: number;
      type?: number;
      status: '0' | '1' | '2' | '3';
      company_id: number;
      created_at: Date;
      updated_at: Date;
    };
  }
}
