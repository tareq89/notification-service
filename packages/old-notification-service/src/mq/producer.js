// producer.js
import { connectRabbitMQ } from "./rabbitmq.js";

const QUEUE = "jobs";

async function publishMessage() {
  const channel = await connectRabbitMQ();

  await channel.assertQueue(QUEUE, { durable: true });

  const message = {
    task: "send-email",
    userId: 123,
  };

  channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(message)), { persistent: true });

  console.log("Message sent:", message);
}

publishMessage().catch(console.error);
