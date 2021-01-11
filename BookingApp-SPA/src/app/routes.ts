import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MemberListComponent } from './members/member-list/member-list.component';
import { MessagesComponent } from './messages/messages.component';
import { AuthGuard } from './_guards/auth.guard';
import { MemberDetailComponent } from './members/member-detail/member-detail.component';
import { MemberDetailResolver } from './_resolvers/member-detail-resolver';
import { MemberListResolver } from './_resolvers/member-list-resolver';
import { MemberEditComponent } from './members/member-edit/member-edit.component';
import { MemberEditResolver } from './_resolvers/member-edit-resolver';
import { PreventUnsavedChanges } from './_guards/prevent-unsaved-changes.guard';
import { BookingListComponent } from './booking/booking-list/booking-list.component';
import { BookingListResolver } from './_resolvers/booking-list-resolver';
import { BookingListForUserComponent } from './booking/booking-list-for-user/booking-list-for-user.component';
import { BookingListForUserResolver } from './_resolvers/booking-list-for-user-resolver';
import { BookingEditComponent } from './booking/booking-edit/booking-edit.component';
import { BookingEditResolver } from './_resolvers/booking-edit-resolver';
import { PreventEditBookingFormUnsavedChanges } from './_guards/prevent-editbookingform-unsaved-changes.guard';
import { BookingEditStatusResolver } from './_resolvers/booking-edit-status-resolver';
import { BookingEditStatusComponent } from './booking/booking-edit-status/booking-edit-status.component';
import { MessagesResolver } from './_resolvers/messages-resolver';
import { AdminPanelComponent } from './admin/admin-panel/admin-panel.component';
import { AdminCalendarComponent } from './calendar/admin-calendar/admin-calendar.component';
import { BookingCalendarComponent } from './booking/booking-calendar/booking-calendar.component';
import { BookingReviewComponent } from './booking/booking-review/booking-review.component';
import { BookingReviewResolver } from './_resolvers/booking-review-resolver';
import { ReviewHomeResolver } from './_resolvers/review-home-resolver';
import { ReviewListResolver } from './_resolvers/review-list-resolver';
import { ReviewAdminListResolver } from './_resolvers/review-admin-list-resolver';
import { ReviewListComponent } from './reviews/review-list/review-list.component';
import { ReviewCardComponent } from './reviews/review-card/review-card.component';

export const appRoutes: Routes = [
    { path: '', component: HomeComponent, resolve: {reviews: ReviewHomeResolver}},
    { path: 'reviews', component: ReviewListComponent, resolve: {reviews: ReviewListResolver}},
    {
        path: '',
        runGuardsAndResolvers: 'always',
        canActivate: [AuthGuard],
        children: [
            { path: 'members', component: MemberListComponent, resolve: {users: MemberListResolver}, data: {roles: ['Admin', 'Moderator']}},
            { path: 'members/:id', component: MemberDetailComponent, resolve: {user: MemberDetailResolver}},
            { path: 'member/edit', component: MemberEditComponent, resolve: {user: MemberEditResolver},
                canDeactivate: [PreventUnsavedChanges]},
            { path: 'messages', component: MessagesComponent, resolve: {messages: MessagesResolver}},
            { path: 'bookings', component: BookingListComponent, resolve: {bookings: BookingListResolver},
                data: {roles: ['Admin', 'Moderator']}},
            { path: 'bookingsforuser', component: BookingListForUserComponent, resolve: {bookings: BookingListForUserResolver}},
            { path: 'booking/edit/status/:id', component: BookingEditStatusComponent, resolve: {booking: BookingEditStatusResolver},
                data: {roles: ['Admin', 'Moderator']}},
            { path: 'admin', component: AdminPanelComponent, data: {roles: ['Admin', 'Moderator']}},
            { path: 'calendar', component: AdminCalendarComponent, data: {roles: ['Admin', 'Moderator']}},
            { path: 'bookingcalendar', component: BookingCalendarComponent, data: {roles: ['Admin', 'Moderator', 'Member', 'VIP']}},
            { path: 'booking/review/:id', component: BookingReviewComponent, resolve: {booking: BookingReviewResolver},
                data: {roles: ['Admin', 'Moderator', 'Member', 'VIP']}},
            { path: 'reviews/admin/:id', component: ReviewCardComponent, resolve: {reviews: ReviewAdminListResolver},
                data: {roles: ['Admin', 'Moderator']}},
        ]
    },
    { path: '**', redirectTo: '', pathMatch: 'full'}
];
