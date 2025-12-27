export interface IEvent {
  eventType: "notification";
  message: string;
  recipientId: string;
  timestamp: string;
}
