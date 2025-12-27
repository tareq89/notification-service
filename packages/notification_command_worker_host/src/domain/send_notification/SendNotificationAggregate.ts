import { SendNotificationDto, NotificationType } from "./dto/SendNotificationDto";
import { NotificationService } from "./services/NotificationService";

export class SendNotificationAggregate {
  private recipientId: string;
  private message: string;
  private timestamp: Date;
  private notificationType: NotificationType;
  private metadata: Record<string, any>;
  private notificationService: NotificationService;

  constructor(dto: SendNotificationDto) {
    this.validateDto(dto);

    this.recipientId = dto.recipientId;
    this.message = dto.message;
    this.timestamp = new Date(dto.timestamp);
    this.notificationType = dto.notificationType || NotificationType.IN_APP;
    this.metadata = dto.metadata || {};
    this.notificationService = new NotificationService();
  }

  private validateDto(dto: SendNotificationDto): void {
    if (!dto.recipientId || dto.recipientId.trim() === "") {
      throw new Error("Recipient ID is required");
    }

    if (!dto.message || dto.message.trim() === "") {
      throw new Error("Message is required");
    }

    if (!dto.timestamp) {
      throw new Error("Timestamp is required");
    }

    // Validate timestamp format
    const timestamp = new Date(dto.timestamp);
    if (isNaN(timestamp.getTime())) {
      throw new Error("Invalid timestamp format");
    }
  }

  async send(): Promise<void> {
    // Business logic: Validate notification can be sent
    this.validateNotificationCanBeSent();

    // Business logic: Process notification based on type
    await this.notificationService.sendNotification({
      recipientId: this.recipientId,
      message: this.message,
      notificationType: this.notificationType,
      metadata: this.metadata,
    });

    // Business logic: Log notification sent
    this.logNotificationSent();
  }

  private validateNotificationCanBeSent(): void {
    // Business rule: Cannot send notifications in the past (more than 1 minute ago)
    const now = new Date();
    const timeDiff = now.getTime() - this.timestamp.getTime();
    const oneMinuteInMs = 60 * 1000;

    if (timeDiff > oneMinuteInMs) {
      throw new Error("Cannot send notification: timestamp is too old");
    }

    // Business rule: Message length validation
    if (this.message.length > 1000) {
      throw new Error("Message exceeds maximum length of 1000 characters");
    }

    // Business rule: Recipient ID format validation
    if (!this.isValidRecipientId(this.recipientId)) {
      throw new Error("Invalid recipient ID format");
    }
  }

  private isValidRecipientId(recipientId: string): boolean {
    // Business rule: Recipient ID should be alphanumeric with underscores and hyphens
    const recipientIdPattern = /^[a-zA-Z0-9_-]+$/;
    return recipientIdPattern.test(recipientId);
  }

  private logNotificationSent(): void {
    console.log(`[SendNotificationAggregate] Notification sent successfully`);
    console.log(`  - Recipient: ${this.recipientId}`);
    console.log(`  - Type: ${this.notificationType}`);
    console.log(`  - Timestamp: ${this.timestamp.toISOString()}`);
  }

  // Getters for aggregate state
  getRecipientId(): string {
    return this.recipientId;
  }

  getMessage(): string {
    return this.message;
  }

  getTimestamp(): Date {
    return this.timestamp;
  }

  getNotificationType(): NotificationType {
    return this.notificationType;
  }

  getMetadata(): Record<string, any> {
    return { ...this.metadata };
  }
}
