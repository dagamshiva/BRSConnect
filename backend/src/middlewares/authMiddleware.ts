import { NextFunction, Request, Response } from "express";
import { User } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { verifyToken } from "../utils/jwt";

export interface AuthenticatedRequest extends Request {
  user?: User;
  areaFilter?: {
    assemblyScope: string;
    villageScope?: string;
    wardScope?: string;
    boothScope?: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const header = req.headers.authorization;
    const token = header?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

