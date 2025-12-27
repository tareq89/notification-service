import express, { Request, Response } from "express";
import { RabbitMq } from "./IRabbitMq";
import { NotificationCommand } from "./notification-cmd";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", async (_req: Request, res: Response) => {
  const notificationCmd = new NotificationCommand("spiderman_send_notification_cmd_queue", "Hello, this is a test notification.");
  const rabbitMq = new RabbitMq();
  await rabbitMq.sendMessage(notificationCmd);
  res.json({ message: "Express + TypeScript works" });
});

app.get("/test", async (_req: Request, res: Response) => {
  const notificationCmd = new NotificationCommand("spiderman_send_notification_cmd_queue_test", "Hello, this is a test notification from test queue.");
  const rabbitMq = new RabbitMq();
  await rabbitMq.sendMessage(notificationCmd);
  res.json({ message: "Test notification sent to spiderman_send_notification_cmd_queue_test" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
