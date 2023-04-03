import { types, Pool } from 'pg';
import dotenv from 'dotenv';

const pool = new Pool();

dotenv.config();

// data parsing
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};
types.setTypeParser(20, BigInt);

const client = new Pool({
  user: process.env.DATABASE_ID,
  host: process.env.DATABASE_URL,
  database: process.env.DATABASE_DB,
  password: process.env.DATABASE_PASSWORD,
  port: Number(process.env.DATABASE_PORT),
});

client.connect((err) => {
  if (err) {
    console.error('DB connection error', err.stack);
  } else {
    console.log('DB connect...');
  }
});

export default client;
