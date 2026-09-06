import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.error(
      "❌ ADMIN_USERNAME 和 ADMIN_PASSWORD 环境变量必须设置"
    );
    process.exit(1);
  }

  const hashedPassword = await hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { username },
    update: {},
    create: {
      username,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log(`✅ 管理员账号已就绪: ${admin.username} (${admin.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
