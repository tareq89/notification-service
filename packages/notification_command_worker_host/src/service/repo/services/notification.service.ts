// services/notification.service.js
import { Notification } from "../models/notification";

export interface INotificationService {
  createNotification(data: any): Promise<any>;
  getNotificationById(id: string): Promise<any>;
  getNotifications(): Promise<any>;
  updateNotification(id: string, data: any): Promise<any>;
  deleteNotification(id: string): Promise<any>;
}

export class NotificationServiceImpl implements INotificationService {
  async createNotification(data: any): Promise<any> {
    return Notification.create(data);
  }

  async getNotificationById(id: string): Promise<any> {
    return Notification.findById(id);
  }

  async getNotifications(): Promise<any> {
    return Notification.find({});
  }

  async updateNotification(id: string, data: any): Promise<any> {
    return Notification.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async deleteNotification(id: string): Promise<any> {
    return Notification.findByIdAndDelete(id);
  }
}
