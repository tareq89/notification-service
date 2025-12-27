// rabbitmq.js
import amqp from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

let connection;
let channel;

export async function connectRabbitMQ() {
  if (channel) return channel;

  connection = await amqp.connect(RABBITMQ_URL);

  connection.on("error", (err) => {
    console.error("RabbitMQ connection error", err);
  });

  connection.on("close", () => {
    console.error("RabbitMQ connection closed");
    process.exit(1);
  });

  channel = await connection.createChannel();
  return channel;
}
