import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const client = new Client({
  user: process.env.DATABASE_ID,
  host: process.env.DATABASE_URL,
  password: process.env.DATABASE_PASSWORD,
  port: Number(process.env.DATABASE_PORT),
});

client.connect((err) => {
  if (err) {
    console.error("DB connection error", err.stack);
  } else {
    console.log("DB connect...");
  }
});
