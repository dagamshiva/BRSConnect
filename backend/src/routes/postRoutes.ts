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

  const posts = await prisma.post.findMany({
    where: filter
      ? {
          assemblyScope: filter.assemblyScope,
          ...(filter.villageScope && { villageScope: filter.villageScope }),
          ...(filter.wardScope && { wardScope: filter.wardScope }),
          ...(filter.boothScope && { boothScope: filter.boothScope }),
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { id: true, name: true },
      },
    },
  });

  res.json(
    posts.map((post) => ({
      id: post.id,
      authorId: post.authorId,
      authorName: post.author.name,
      content: post.content,
      mediaType: post.mediaType,
      mediaUrl: post.mediaUrl,
      assemblyScope: post.assemblyScope,
      villageScope: post.villageScope,
      wardScope: post.wardScope,
      boothScope: post.boothScope,
      trendingScore: post.trendingScore,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    })),
  );
});

const createSchema = z.object({
  content: z.string(),
  mediaType: z.string().optional(),
  mediaUrl: z.string().url().optional(),
  areaScope: z.object({
    assemblySegment: z.string(),
    village: z.string().optional(),
    ward: z.string().optional(),
    booth: z.string().optional(),
  }),
});

router.post("/", async (req: AuthenticatedRequest, res) => {
  const user = req.user!;

  const result = createSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: "Invalid post payload" });
  }

  const payload = result.data;

  const post = await prisma.post.create({
    data: {
      authorId: user.id,
      content: payload.content,
      mediaType: payload.mediaType,
      mediaUrl: payload.mediaUrl,
      assemblyScope: payload.areaScope.assemblySegment,
      villageScope: payload.areaScope.village,
      wardScope: payload.areaScope.ward,
      boothScope: payload.areaScope.booth,
    },
  });

  res.status(201).json({
    id: post.id,
    authorId: user.id,
    authorName: user.name,
    content: post.content,
    mediaType: post.mediaType,
    mediaUrl: post.mediaUrl,
    assemblyScope: post.assemblyScope,
    villageScope: post.villageScope,
    wardScope: post.wardScope,
    boothScope: post.boothScope,
    trendingScore: post.trendingScore,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  });
});

router.post("/:id/like", async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  await prisma.post.update({
    where: { id },
    data: { trendingScore: { increment: 1 } },
  });

  res.json({ success: true });
});

export default router;

