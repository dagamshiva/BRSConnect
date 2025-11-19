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

  const reports = await prisma.report.findMany({
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
      reporter: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true } },
    },
  });

  res.json(reports);
});

const createSchema = z.object({
  title: z.string(),
  description: z.string(),
  attachments: z.array(z.string()).optional(),
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
    return res.status(400).json({ message: "Invalid report payload" });
  }

  const payload = result.data;

  const report = await prisma.report.create({
    data: {
      reporterId: user.id,
      title: payload.title,
      description: payload.description,
      attachments: payload.attachments ?? [],
      assemblyScope: payload.areaScope.assemblySegment,
      villageScope: payload.areaScope.village,
      wardScope: payload.areaScope.ward,
      boothScope: payload.areaScope.booth,
    },
  });

  res.status(201).json(report);
});

const updateSchema = z.object({
  status: z.enum(["New", "Under Review", "Resolved", "Dismissed"]),
  assignedAdminId: z.string().nullable().optional(),
});

router.patch("/:id", async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  if (user.role === "Member" || user.role === "Pending") {
    return res.status(403).json({ message: "Only admins can update reports" });
  }

  const { id } = req.params;
  const result = updateSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ message: "Invalid status payload" });
  }

  const payload = result.data;

  const report = await prisma.report.update({
    where: { id },
    data: {
      status: payload.status,
      assigneeId: payload.assignedAdminId ?? undefined,
      updatedAt: new Date(),
    },
  });

  res.json(report);
});

export default router;

