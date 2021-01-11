import { User } from './user';

export interface Booking {
    id: number;
    status: string;
    when: Date;
    fromTime: Date;
    toTime: Date;
    location: string;
    dateAdded: Date;
    userId: number;
    isEdited?: boolean;
    isSeenByAdmin?: boolean;
    isSeenNotification?: boolean;
    approveOrDeclineDate?: Date;
    isReviewed?: boolean;
    user?: User;
}
