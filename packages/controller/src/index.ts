import express, { Request, Response } from "express";
import { RabbitMq } from "./IRabbitMq";
import { NotificationCommand } from "./notification-cmd";

const app = express();
const PORT = 3000;

app.use(express.json());
console.log('test');
app.get("/", async (_req: Request, res: Response) => {
  const notificationCmd = new NotificationCommand("spiderman_send_notification_cmd_queue", "Hello, this is a test notification.");
  const rabbitMq = new RabbitMq();
  await rabbitMq.sendMessage(notificationCmd);
  res.json({ message: "Express + TypeScript works" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
