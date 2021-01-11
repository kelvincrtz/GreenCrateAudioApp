import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { BookingFormComponent } from '../booking/booking-form/booking-form.component';

@Injectable()
export class PreventBookingFormUnsavedChanges implements CanDeactivate<BookingFormComponent> {
    canDeactivate(component: BookingFormComponent) {
        if (component.bookingForm.dirty) {
            return confirm('Are you sure you want to continue? Any unsaved changes will be lost');
        }
        return true;
    }
}
