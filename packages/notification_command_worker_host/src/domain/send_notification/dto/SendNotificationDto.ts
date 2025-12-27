export interface SendNotificationDto {
  recipientId: string;
  message: string;
  timestamp: string;
  notificationType?: NotificationType;
  metadata?: Record<string, any>;
}

export enum NotificationType {
  EMAIL = "email",
  SMS = "sms",
  PUSH = "push",
  IN_APP = "in_app",
}

