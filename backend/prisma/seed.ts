import { PrismaClient, Role, ApprovalStatus } from "@prisma/client";
import { hashPassword } from "../src/utils/password";

const prisma = new PrismaClient();

const superAdminId = "seed-superadmin";
const localAdminId = "seed-localadmin";

const run = async () => {
  await prisma.pollVote.deleteMany();
  await prisma.pollOption.deleteMany();
  await prisma.poll.deleteMany();
  await prisma.post.deleteMany();
  await prisma.report.deleteMany();
  await prisma.highlightedSegment.deleteMany();
  await prisma.userApprovalLog.deleteMany();
  await prisma.user.deleteMany();

  const password = await hashPassword("password123");

  const superAdmin = await prisma.user.create({
    data: {
      id: superAdminId,
      name: "Pink Car SuperAdmin",
      email: "superadmin@demo.com",
      mobile: "+91 90000 90000",
      passwordHash: password,
      role: Role.SuperAdmin,
      status: ApprovalStatus.Approved,
      assemblySegment: "Hyderabad Central",
      createdAt: new Date(),
    },
  });

  const localAdmin = await prisma.user.create({
    data: {
      id: localAdminId,
      name: "Pink Car LocalAdmin",
      email: "localadmin@demo.com",
      mobile: "+91 90000 90001",
      passwordHash: password,
      role: Role.LocalAdmin,
      status: ApprovalStatus.Approved,
      assemblySegment: "Hyderabad Central",
      village: "Banjara Hills",
      ward: "Ward 12",
      booth: "Booth 42",
      approvedById: superAdmin.id,
      approvedAt: new Date(),
    },
  });

  await prisma.user.create({
    data: {
      name: "Pink Car Member",
      email: "member@demo.com",
      mobile: "+91 90000 90002",
      passwordHash: password,
      role: Role.Member,
      status: ApprovalStatus.Approved,
      assemblySegment: "Hyderabad Central",
      village: "Banjara Hills",
      ward: "Ward 12",
      booth: "Booth 42",
      approvedById: localAdmin.id,
      approvedAt: new Date(),
    },
  });

  await prisma.highlightedSegment.create({
    data: {
      segmentId: "segment-1",
      segmentName: "Hyderabad Central",
      candidate: "Pink Car Candidate",
      winCount: 68,
      loseCount: 22,
      cantSayCount: 10,
      sampleSize: 1540,
      source: "Ground Worker Survey",
      lastUpdated: new Date(),
      createdById: superAdmin.id,
    },
  });

  const poll = await prisma.poll.create({
    data: {
      title: "Which development priority matters most?",
      description: "Select the top priority for your ward.",
      type: "SINGLE",
      visibility: "WARD",
      assemblyScope: "Hyderabad Central",
      villageScope: "Banjara Hills",
      wardScope: "Ward 12",
      startsAt: new Date(Date.now() - 2 * 86400000),
      endsAt: new Date(Date.now() + 5 * 86400000),
      totalResponses: 0,
      createdById: localAdmin.id,
      options: {
        create: [
          { label: "Women Safety" },
          { label: "Youth Employment" },
          { label: "Public Transport" },
        ],
      },
    },
    include: { options: true },
  });

  await prisma.post.createMany({
    data: [
      {
        authorId: localAdmin.id,
        content:
          "Pink Car volunteers organized a medical camp serving 320 villagers today.",
        assemblyScope: "Hyderabad Central",
        villageScope: "Banjara Hills",
        wardScope: "Ward 12",
        trendingScore: 92,
        createdAt: new Date(Date.now() - 3 * 3600000),
      },
      {
        authorId: superAdmin.id,
        content:
          "Community engagement session on micro-financing for women entrepreneurs this Saturday.",
        assemblyScope: "Hyderabad Central",
        trendingScore: 78,
        createdAt: new Date(Date.now() - 9 * 3600000),
      },
    ],
  });

  await prisma.report.create({
    data: {
      reporterId: localAdmin.id,
      title: "Street light outage near community hall",
      description:
        "Street lights have been non-functional for 3 days affecting residents' safety.",
      attachments: [],
      status: "Under Review",
      assemblyScope: "Hyderabad Central",
      wardScope: "Ward 12",
      boothScope: "Booth 42",
      assigneeId: superAdmin.id,
    },
  });

  await prisma.report.create({
    data: {
      reporterId: superAdmin.id,
      title: "Water supply disruption in Basti Colony",
      description: "No water supply since yesterday night. Need tanker support.",
      attachments: [],
      status: "New",
      assemblyScope: "Hyderabad Central",
      villageScope: "Banjara Hills",
    },
  });

  await prisma.pollVote.create({
    data: {
      pollId: poll.id,
      optionId: poll.options[0].id,
      userId: localAdmin.id,
    },
  });

  console.log("🌱 Database seeded successfully.");
};

run()
  .catch((error) => {
    console.error("Seed error", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

