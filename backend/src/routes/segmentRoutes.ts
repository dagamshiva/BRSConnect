import { Router } from "express";

import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/highlighted", async (_req, res) => {
  const segment = await prisma.highlightedSegment.findMany({
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  res.json(segment);
});

export default router;

