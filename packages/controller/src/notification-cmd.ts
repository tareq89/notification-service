export interface INotificationCommand {
  recipientId: string;
  message: string;
  timestamp: Date;
  getMessage(): string;
}

export class NotificationCommand implements INotificationCommand {
  constructor(public readonly recipientId: string, public readonly message: string, public readonly timestamp: Date = new Date()) {}
  getMessage() {
    // Logic to send notification
    return `Notification sent to ${this.recipientId} with message: "${this.message}" at ${this.timestamp}`;
  }
}
