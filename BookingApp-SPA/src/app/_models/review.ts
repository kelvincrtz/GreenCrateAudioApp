import { FileItem } from 'ng2-file-upload';
import { Booking } from './booking';
import { User } from './user';

export interface Review {
    id?: number;
    url?: string;
    description: string;
    dateAdded?: Date;
    isApproved?: boolean;
    publicId?: string;
    rating: number;
    user?: User;
    userId?: number;
}
