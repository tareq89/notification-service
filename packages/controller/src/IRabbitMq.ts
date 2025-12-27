import { channel } from "diagnostics_channel";
import { INotificationCommand } from "./notification-cmd";
import { connectRabbitMQ } from "./service/mq";
import amqp from "amqplib";

export interface IRabbitMq {
  publish(notificationCmd: INotificationCommand): Promise<void>;
}

const QUEUE = "jobs";
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";
export class RabbitMq implements IRabbitMq {
  constructor() {}

  async sendMessage(notificationCmd: INotificationCommand) {
    console.log("Connecting to RabbitMQ at", RABBITMQ_URL);
    const conn = await amqp.connect(RABBITMQ_URL);
    const channel = await conn.createChannel();

    const exchangeName = "my_exchange";
    await channel.assertExchange(exchangeName, "direct", { durable: true });

    const message = notificationCmd.getMessage();
    channel.publish(exchangeName, "my_routing_key", Buffer.from(JSON.stringify(message)));

    console.log("Message sent:", message);
    await channel.close();
    await conn.close();
  }

  async publish(notificationCmd: INotificationCommand): Promise<void> {
    try {
      // Get connection and create channel
      const channel = await connectRabbitMQ();

      // Ensure the queue exists
      await channel.assertQueue(QUEUE, { durable: true });

      // Send message to the queue
      const messageBuffer = Buffer.from(JSON.stringify(notificationCmd.getMessage()));
      channel.sendToQueue(QUEUE, messageBuffer, { persistent: true });

      console.log(`Message sent to queue "${QUEUE}":`, notificationCmd.getMessage());
    } catch (err) {
      console.error("Failed to publish message to RabbitMQ:", err);
      throw err;
    }
  }
}
