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
    try {
      const conn = await amqp.connect(RABBITMQ_URL);
      const channel = await conn.createConfirmChannel();

      const queueName = notificationCmd.recipientId;
      const exchangeName = "notification_exchange";

      await channel.assertExchange(exchangeName, "direct", { durable: true });

      // Ensure the queue exists
      const queueInfo = await channel.assertQueue(queueName, { durable: true });
      console.log(`✓ Queue "${queueName}" asserted. Messages in queue: ${queueInfo.messageCount}, Consumers: ${queueInfo.consumerCount}`);

      // Bind the queue to the exchange with routing key = queue name
      await channel.bindQueue(queueName, exchangeName, queueName);
      console.log(`✓ Queue bound to exchange with routing key "${queueName}"`);

      // Create message payload
      const messagePayload = {
        recipientId: notificationCmd.recipientId,
        message: notificationCmd.message,
        timestamp: notificationCmd.timestamp.toISOString(),
      };

      // Publish to the exchange with routing key
      channel.publish(
        exchangeName,
        queueName, // routing key = queue name
        Buffer.from(JSON.stringify(messagePayload)),
        { persistent: true }
      );

      // Wait for RabbitMQ to confirm receipt before closing
      await channel.waitForConfirms();
      console.log(`\n✅ SUCCESS: Message sent to queue "${queueName}":`, messagePayload);

      await channel.close();
      await conn.close();
    } 
    catch (error) {
      console.error("❌ ERROR sending message to RabbitMQ:", error);
      throw error;
    }
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
