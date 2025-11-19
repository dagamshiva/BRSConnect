import { Router, Response } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma";
import { authMiddleware, AuthenticatedRequest } from "../middlewares/authMiddleware";
import { notificationService } from "../services/notificationService";

const router = Router();

router.use(authMiddleware);

const ensureAdmin = (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  if (user.role === "Member" || user.role === "Pending") {
    res.status(403).json({ message: "Admin privileges required" });
    return false;
  }
  return true;
};

router.get("/approvals/pending", async (req: AuthenticatedRequest, res) => {
  if (!ensureAdmin(req, res)) return;

  const user = req.user!;
  const where: Record<string, unknown> = { status: "Pending" };

  if (user.role === "LocalAdmin") {
    where.assemblySegment = user.assemblySegment;
  }

  const pendingUsers = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  res.json(pendingUsers);
});

const decisionSchema = z.object({
  reason: z.string().optional(),
});

router.post("/approvals/:id/approve", async (req: AuthenticatedRequest, res) => {
  if (!ensureAdmin(req, res)) return;

  const admin = req.user!;
  const { id } = req.params;

  const user = await prisma.user.update({
    where: { id },
    data: {
      status: "Approved",
      role: "Member",
      approvedById: admin.id,
      approvedAt: new Date(),
      rejectionReason: null,
    },
  });

  await prisma.userApprovalLog.create({
    data: {
      action: "APPROVED",
      actorId: admin.id,
      userId: id,
    },
  });

  await notificationService.sendApprovalNotification(id);

  res.json(user);
});

router.post("/approvals/:id/reject", async (req: AuthenticatedRequest, res) => {
  if (!ensureAdmin(req, res)) return;

  const admin = req.user!;
  const { id } = req.params;

  const result = decisionSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const { reason } = result.data;

  const user = await prisma.user.update({
    where: { id },
    data: {
      status: "Rejected",
      rejectionReason: reason ?? "Not specified",
    },
  });

  await prisma.userApprovalLog.create({
    data: {
      action: "REJECTED",
      reason,
      actorId: admin.id,
      userId: id,
    },
  });

  await notificationService.sendRejectionNotification(id, reason);

  res.json(user);
});

export default router;

