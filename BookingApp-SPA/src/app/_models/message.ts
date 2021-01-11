export interface Message {
    id: number;
    senderId: number;
    senderFullName: string;
    recipientId: number;
    recipientFullName: string;
    content: string;
    isRead: boolean;
    dateRead: Date;
    messageSent: Date;
    isSeenNotification?: boolean;
}
