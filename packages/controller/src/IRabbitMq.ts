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

    // Use recipientId as the queue name
    const queueName = notificationCmd.recipientId;
    
    // Ensure the queue exists
    await channel.assertQueue(queueName, { durable: true });

    // Create message payload
    const messagePayload = {
      recipientId: notificationCmd.recipientId,
      message: notificationCmd.message,
      timestamp: notificationCmd.timestamp.toISOString(),
    };

    // Send message directly to the queue
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(messagePayload)), { persistent: true });

    console.log(`Message sent to queue "${queueName}":`, messagePayload);
    await channel.close();
    await conn.close();
  }

  async publish(notificationCmd: INotificationCommand): Promise<void> {
    try {
      // Get connection and create channel
      const channel = await connectRabbitMQ();

      // Ensure the queue exists
      await channel.assertQueue(QUEUE, { durable: true });

      // Create message payload with structured data
      const messagePayload = {
        recipientId: notificationCmd.recipientId,
        message: notificationCmd.message,
        timestamp: notificationCmd.timestamp.toISOString(),
      };

      // Send message to the queue
      const messageBuffer = Buffer.from(JSON.stringify(messagePayload));
      channel.sendToQueue(QUEUE, messageBuffer, { persistent: true });

      console.log(`Message sent to queue "${QUEUE}":`, messagePayload);
    } catch (err) {
      console.error("Failed to publish message to RabbitMQ:", err);
      throw err;
    }
  }
}
