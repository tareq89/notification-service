import { RabbitMQConsumer } from "./service/RabbitMQConsumer";

const QUEUE_NAME = process.env.QUEUE_NAME || "spiderman_send_notification_cmd_queue";

async function main() {
  const consumer = new RabbitMQConsumer();

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\nShutting down gracefully...");
    await consumer.close();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("\nShutting down gracefully...");
    await consumer.close();
    process.exit(0);
  });

  try {
    await consumer.connect();
    await consumer.consumeQueue(QUEUE_NAME);
  } catch (err) {
    console.error("Fatal error:", err);
    await consumer.close();
    process.exit(1);
  }
}

main().catch(console.error);

