// import { ICommandHandler } from "@notification/shared-kernel";
import { NotificationCommandPayload } from "./NotificationCommandPayload";
import { SendNotificationAggregate } from "./domain/send_notification";
import { SendNotificationDto } from "./domain/send_notification/dto/SendNotificationDto";
import { INotificationService } from "./service/repo/services/notification.service";

interface ICommandHandler<T = any> {
  handle(command: T, notificationRepo: INotificationService): Promise<void>;
}

export class RegisterNotificationCommandHandler implements ICommandHandler<NotificationCommandPayload> {
  async handle(command: NotificationCommandPayload, notificationRepo: INotificationService): Promise<void> {
    try {
      console.log("=========================================");
      console.log("Processing Notification Command:");
      console.log(`Recipient ID: ${command.recipientId}`);
      console.log(`Message: ${command.message}`);
      console.log(`Timestamp: ${command.timestamp}`);
      console.log("=========================================");

      // Map command payload to DTO
      const dto: SendNotificationDto = {
        recipientId: command.recipientId,
        message: command.message,
        timestamp: command.timestamp,
      };

      notificationRepo.createNotification({
        recipientId: command.recipientId,
        message: command.message,
        status: "pending",
      });

      // Create aggregate root and execute business logic
      const aggregate = new SendNotificationAggregate(dto);
      await aggregate.send();

      console.log(`✓ Notification successfully processed for ${command.recipientId}`);
    } catch (error) {
      console.error(`✗ Failed to process notification for ${command.recipientId}:`, error);
      throw error;
    }
  }
}
