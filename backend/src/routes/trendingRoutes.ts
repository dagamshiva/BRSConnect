import { Router } from "express";

import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/", (_req, res) => {
  res.json([
    {
      id: "trending-1",
      title: "Pink Car Mega Rally draws historic crowds in Hyderabad",
      description:
        "Thousands of supporters joined the Pink Car movement rally showcasing unity and momentum towards the upcoming elections.",
      mediaType: "image",
      url: "https://pinkcarmovement.in/media/rally",
      thumbnail: null,
      likes: 4200,
      dislikes: 245,
      platform: "Twitter",
    },
    {
      id: "trending-2",
      title: "Community initiatives transforming villages",
      description:
        "Pink Car volunteers lead cleanup drives, health camps, and education outreach across Telangana villages.",
      mediaType: "video",
      url: "https://pinkcarmovement.in/media/community",
      thumbnail: null,
      likes: 3120,
      dislikes: 98,
      platform: "Instagram",
    },
    {
      id: "trending-3",
      title: "Pink Car manifesto explained",
      description:
        "Watch the manifesto breakdown covering economic, education, and health reforms planned by the movement.",
      mediaType: "video",
      url: "https://youtube.com/pinkcar/manifesto",
      thumbnail: null,
      likes: 5870,
      dislikes: 420,
      platform: "YouTube",
    },
  ]);
});

export default router;

