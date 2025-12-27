// consumer.js
import { connectRabbitMQ } from "./rabbitmq.js";

const QUEUE = "jobs";

async function consumeMessages() {
  const channel = await connectRabbitMQ();

  await channel.assertQueue(QUEUE, { durable: true });
  channel.prefetch(1); // important for fair dispatch

  console.log("Waiting for messages...");

  channel.consume(QUEUE, (msg) => {
    if (!msg) return;

    const data = JSON.parse(msg.content.toString());
    console.log("Received:", data);

    // do work here
    channel.ack(msg);
  });
}

consumeMessages().catch(console.error);
