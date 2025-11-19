import { Router } from "express";

import { prisma } from "../lib/prisma";
import { authMiddleware, AuthenticatedRequest } from "../middlewares/authMiddleware";
import { abacMiddleware } from "../middlewares/abacMiddleware";

const router = Router();

router.use(authMiddleware);
router.use(abacMiddleware);

router.get("/", async (req: AuthenticatedRequest, res) => {
  const filter = req.areaFilter;

  const users = await prisma.user.findMany({
    where: filter
      ? {
          assemblySegment: filter.assemblyScope,
          ...(filter.villageScope && { village: filter.villageScope }),
          ...(filter.wardScope && { ward: filter.wardScope }),
          ...(filter.boothScope && { booth: filter.boothScope }),
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      role: true,
      status: true,
      assemblySegment: true,
      village: true,
      ward: true,
      booth: true,
      createdAt: true,
    },
  });

  res.json(users);
});

router.get("/:id", async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      role: true,
      status: true,
      assemblySegment: true,
      village: true,
      ward: true,
      booth: true,
      createdAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
});

export default router;

