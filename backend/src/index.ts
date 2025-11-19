import { app } from "./app";
import { env } from "./config/env";

const start = async () => {
  const port = env.PORT;

  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
};

start();

