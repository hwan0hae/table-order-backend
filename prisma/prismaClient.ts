import { PrismaClient } from "@prisma/client";
export * from "@prisma/client";

const prisma = new PrismaClient({
  log: [process.env.LOGLEVEL === "trace" ? "query" : "info"],
});

export default prisma;
