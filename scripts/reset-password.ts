import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = process.argv[2] ?? process.env.RESET_USERNAME;
  const password = process.argv[3] ?? process.env.RESET_PASSWORD;

  if (!username || !password) {
    console.error(
      "用法: RESET_USERNAME=xxx RESET_PASSWORD=xxx pnpm db:reset-password"
    );
    console.error("  或: pnpm db:reset-password <用户名> <新密码>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    console.error(`❌ 用户不存在: ${username}`);
    process.exit(1);
  }

  const hashedPassword = await hash(password, 12);
  await prisma.user.update({
    where: { username },
    data: { password: hashedPassword },
  });

  console.log(`✅ 已重置密码: ${username}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
