import { PrismaClient } from "@prisma/client";

const prismaClientSingleTon = () => {
  return new PrismaClient();
};

const prismaGlobal = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = prismaGlobal.prisma ?? prismaClientSingleTon()

export default prisma

if(process.env.NODE_ENV !== 'production') prismaGlobal.prisma = prisma