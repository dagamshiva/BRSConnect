import { Router } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma";
import { hashPassword, comparePassword } from "../utils/password";
import { generateToken } from "../utils/jwt";
import { authMiddleware, AuthenticatedRequest } from "../middlewares/authMiddleware";
import { otpService } from "../services/otpService";

const router = Router();

const loginSchema = z.object({
  identifier: z.string(),
  password: z.string(),
});

router.post("/login", async (req, res) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ message: "Invalid login payload" });
  }

  const { identifier, password } = result.data;

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier.toLowerCase() },
        { mobile: identifier },
      ],
    },
  });

  if (!user || !user.passwordHash) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isValid = await comparePassword(password, user.passwordHash);

  if (!isValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = generateToken(user.id);
  res.json({ token, user });
});

const registerSchema = z.object({
  name: z.string(),
  email: z.string().email().optional(),
  mobile: z.string().optional(),
  password: z.string().min(6),
  assemblySegment: z.string(),
  village: z.string().optional(),
  ward: z.string().optional(),
  booth: z.string().optional(),
});

router.post("/register", async (req, res) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ message: "Invalid registration payload" });
  }

  const payload = result.data;

  if (!payload.email && !payload.mobile) {
    return res
      .status(400)
      .json({ message: "Either email or mobile must be provided" });
  }

  const passwordHash = await hashPassword(payload.password);

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email?.toLowerCase(),
      mobile: payload.mobile,
      passwordHash,
      role: "Pending",
      status: "Pending",
      assemblySegment: payload.assemblySegment,
      village: payload.village,
      ward: payload.ward,
      booth: payload.booth,
    },
  });

  const token = generateToken(user.id);

  res.status(201).json({ token, user });
});

router.post("/otp/send", async (req, res) => {
  const mobile = req.body?.mobile;

  if (!mobile) {
    return res.status(400).json({ message: "Mobile number required" });
  }

  await otpService.sendOTP(mobile);

  res.json({ message: "OTP sent" });
});

router.post("/otp/verify", async (req, res) => {
  const { mobile, otp } = req.body ?? {};

  if (!mobile || !otp) {
    return res.status(400).json({ message: "Mobile and OTP required" });
  }

  await otpService.verifyOTP(mobile, otp);

  res.json({ message: "OTP verified" });
});

router.get("/me", authMiddleware, async (req: AuthenticatedRequest, res) => {
  res.json(req.user);
});

export default router;

