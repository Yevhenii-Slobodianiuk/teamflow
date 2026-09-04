import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  MemberRole,
  ChannelType,
  UserStatus,
} from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log(
    "🌱 Початок наповнення бази даних (Seeding via Driver Adapter)...",
  );

  await prisma.reaction.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.message.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  const userJohn = await prisma.user.create({
    data: {
      email: "john@teamflow.dev",
      username: "john_doe",
      displayName: "John Doe",
      passwordHash: "dummy_argon2_hash_for_testing",
      status: UserStatus.ONLINE,
      bio: "Fullstack TypeScript Developer",
    },
  });

  const userAlice = await prisma.user.create({
    data: {
      email: "alice@teamflow.dev",
      username: "alice_smith",
      displayName: "Alice Smith",
      passwordHash: "dummy_argon2_hash_for_testing",
      status: UserStatus.ONLINE,
      bio: "UI/UX Designer & Frontend enthusiast",
    },
  });

  console.log(
    `✅ Створено користувачів: ${userJohn.username}, ${userAlice.username}`,
  );
  const workspace = await prisma.workspace.create({
    data: {
      name: "Engineering Hub",
      slug: "engineering-hub",
      description: "Main developer community workspace",
      ownerId: userJohn.id,
      members: {
        create: [
          { userId: userJohn.id, role: MemberRole.OWNER },
          { userId: userAlice.id, role: MemberRole.ADMIN },
        ],
      },
      channels: {
        create: [
          {
            name: "general",
            topic: "General discussion",
            type: ChannelType.TEXT,
          },
          {
            name: "nestjs-backend",
            topic: "Architecture and API topics",
            type: ChannelType.TEXT,
          },
        ],
      },
    },
    include: {
      channels: true,
      members: true,
    },
  });

  console.log(
    `✅ Створено воркспейс: ${workspace.name} (${workspace.channels.length} канали)`,
  );

  const generalChannel = workspace.channels.find((c) => c.name === "general");
  if (generalChannel) {
    const message = await prisma.message.create({
      data: {
        content: "Привіт усім! Ласкаво просимо до TeamFlow 🚀",
        channelId: generalChannel.id,
        authorId: userJohn.id,
        reactions: {
          create: [
            { emoji: "🔥", userId: userAlice.id },
            { emoji: "👍", userId: userJohn.id },
          ],
        },
      },
    });

    console.log(`✅ Створено повідомлення: "${message.content}"`);
  }

  console.log("🎉 Seeding успішно завершено!");
}

main()
  .catch((e) => {
    console.error("❌ Помилка під час seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
