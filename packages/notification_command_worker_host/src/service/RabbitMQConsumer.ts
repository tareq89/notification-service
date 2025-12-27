import amqp from "amqplib";
import { RegisterNotificationCommandHandler } from "../RegisterNotificationCommandHandler";
import { NotificationCommandPayload } from "../NotificationCommandPayload";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

export class RabbitMQConsumer {
  private connection: any = null;
  private channel: amqp.Channel | null = null;
  private handler: RegisterNotificationCommandHandler;

  constructor() {
    this.handler = new RegisterNotificationCommandHandler();
  }

  async connect(): Promise<void> {
    try {
      console.log("Connecting to RabbitMQ at", RABBITMQ_URL.replace(/:[^:@]+@/, ":****@"));
      this.connection = await amqp.connect(RABBITMQ_URL);
      
      this.connection.on("error", (err: Error) => {
        console.error("RabbitMQ connection error:", err);
      });

      this.connection.on("close", () => {
        console.error("RabbitMQ connection closed. Attempting to reconnect...");
        setTimeout(() => this.connect(), 5000);
      });

      this.channel = await this.connection.createChannel();
      console.log("✓ Connected to RabbitMQ");
    } catch (err) {
      console.error("Failed to connect to RabbitMQ:", err);
      throw err;
    }
  }

  async consumeQueue(queueName: string): Promise<void> {
    if (!this.channel) {
      throw new Error("Channel not initialized. Call connect() first.");
    }

    try {
      // Ensure the queue exists
      await this.channel.assertQueue(queueName, { durable: true });
      
      // Set prefetch to process one message at a time
      await this.channel.prefetch(1);

      console.log(`Waiting for messages in queue: "${queueName}"...`);
      console.log("Press CTRL+C to exit\n");

      // Log queue info
      const queueInfo = await this.channel.checkQueue(queueName);
      console.log(`Queue "${queueName}" info:`, {
        messageCount: queueInfo.messageCount,
        consumerCount: queueInfo.consumerCount
      });

      this.channel.consume(queueName, async (msg) => {
        if (!msg) {
          return;
        }

        try {
          const content = msg.content.toString();
          const payload: NotificationCommandPayload = JSON.parse(content);

          console.log(`\n[${new Date().toISOString()}] Received message from queue "${queueName}"`);

          // Handle the command
          await this.handler.handle(payload);

          // Acknowledge the message
          this.channel!.ack(msg);
        } catch (err) {
          console.error("Error processing message:", err);
          // Reject the message and don't requeue if it's a processing error
          // You might want to send it to a dead letter queue instead
          this.channel!.nack(msg, false, false);
        }
      }, {
        noAck: false // Manual acknowledgment
      });
    } catch (err) {
      console.error(`Failed to consume from queue "${queueName}":`, err);
      throw err;
    }
  }

  async close(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
    console.log("RabbitMQ connection closed");
  }
}

