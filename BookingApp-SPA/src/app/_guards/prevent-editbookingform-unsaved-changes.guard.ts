import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { BookingEditComponent } from '../booking/booking-edit/booking-edit.component';

@Injectable()
export class PreventEditBookingFormUnsavedChanges implements CanDeactivate<BookingEditComponent> {
    canDeactivate(component: BookingEditComponent) {
        if (component.bookingForm.dirty) {
            return confirm('Are you sure you want to continue? Any unsaved changes will be lost');
        }
        return true;
    }
}
