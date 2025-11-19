import { Router } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma";
import { authMiddleware, AuthenticatedRequest } from "../middlewares/authMiddleware";
import { abacMiddleware } from "../middlewares/abacMiddleware";

const router = Router();

router.use(authMiddleware);
router.use(abacMiddleware);

router.get("/", async (req: AuthenticatedRequest, res) => {
  const filter = req.areaFilter;

  const polls = await prisma.poll.findMany({
    where: filter
      ? {
          OR: [
            { assemblyScope: filter.assemblyScope },
            filter.villageScope ? { villageScope: filter.villageScope } : undefined,
            filter.wardScope ? { wardScope: filter.wardScope } : undefined,
            filter.boothScope ? { boothScope: filter.boothScope } : undefined,
          ].filter(Boolean) as any,
        }
      : undefined,
    include: {
      options: { include: { votes: true, _count: { select: { votes: true } } } },
      createdBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(
    polls.map((poll) => ({
      ...poll,
      options: poll.options.map((option) => ({
        ...option,
        votes: option._count?.votes ?? option.votes.length,
      })),
    })),
  );
});

const createSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  type: z.enum(["YES_NO", "SINGLE", "MULTI", "RATING"]),
  visibility: z.enum(["WARD", "VILLAGE", "ASSEMBLY"]),
  startsAt: z.string(),
  endsAt: z.string(),
  options: z.array(z.object({ label: z.string() })).min(2),
  areaScope: z.object({
    assemblySegment: z.string(),
    village: z.string().optional(),
    ward: z.string().optional(),
    booth: z.string().optional(),
  }),
});

router.post("/", async (req: AuthenticatedRequest, res) => {
  const user = req.user!;

  if (user.role === "Member" || user.role === "Pending") {
    return res.status(403).json({ message: "Only admins can create polls" });
  }

  const result = createSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: "Invalid poll payload" });
  }

  const payload = result.data;

  const poll = await prisma.poll.create({
    data: {
      title: payload.title,
      description: payload.description,
      type: payload.type,
      visibility: payload.visibility,
      assemblyScope: payload.areaScope.assemblySegment,
      villageScope: payload.areaScope.village,
      wardScope: payload.areaScope.ward,
      boothScope: payload.areaScope.booth,
      startsAt: new Date(payload.startsAt),
      endsAt: new Date(payload.endsAt),
      createdById: user.id,
      options: {
        create: payload.options.map((option) => ({
          label: option.label,
        })),
      },
    },
    include: {
      options: { include: { votes: true, _count: { select: { votes: true } } } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  res.status(201).json({
    ...poll,
    options: poll.options.map((option) => ({
      ...option,
      votes: option._count?.votes ?? option.votes.length,
    })),
  });
});

const voteSchema = z.object({
  optionId: z.string(),
});

router.post("/:id/vote", async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { id } = req.params;

  const result = voteSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: "Invalid vote payload" });
  }

  const { optionId } = result.data;

  try {
    await prisma.pollVote.create({
      data: {
        pollId: id,
        optionId,
        userId: user.id,
      },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(400).json({ message: "You have already voted on this poll" });
    }
    throw error;
  }

  await prisma.poll.update({
    where: { id },
    data: { totalResponses: { increment: 1 } },
  });

  res.json({ success: true });
});

export default router;

