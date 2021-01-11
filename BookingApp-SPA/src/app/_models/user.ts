import { Booking } from './booking';
import { Message } from './message';
import { Review } from './review';

export interface User {
    id: number;
    userName: string;
    age: number;
    gender: string;
    created: Date;
    lastActive: Date;
    city: string;
    country: string;
    fullName: string;
    contactNumber: string;
    bookings?: Booking[];
    messages?: Message[];
    roles?: string[];
    reviews?: Review[];
}
