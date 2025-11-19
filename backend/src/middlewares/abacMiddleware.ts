import { NextFunction, Response } from "express";

import { AuthenticatedRequest } from "./authMiddleware";

export const abacMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (user.role === "SuperAdmin") {
    return next();
  }

  req.areaFilter = {
    assemblyScope: user.assemblySegment,
    ...(user.village ? { villageScope: user.village } : {}),
    ...(user.ward ? { wardScope: user.ward } : {}),
    ...(user.booth ? { boothScope: user.booth } : {}),
  };

  next();
};

