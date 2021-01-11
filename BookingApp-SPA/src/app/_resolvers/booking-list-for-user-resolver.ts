import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AlertifyService } from '../_services/alertify.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Booking } from '../_models/booking';
import { BookingService } from '../_services/booking.service';
import { AuthService } from '../_services/auth.service';

@Injectable()
export class BookingListForUserResolver implements Resolve<Booking[]> {
    pageNumber = 1;
    pageSize = 8;

    constructor(private bookingService: BookingService, private router: Router, private alertify: AlertifyService,
                private authService: AuthService) {}

    resolve(route: ActivatedRouteSnapshot): Observable<Booking[]> {
        return this.bookingService.getBookingsForUser(this.authService.decodedToken.nameid, this.pageNumber, this.pageSize, null).pipe(
            catchError(error => {
                this.alertify.error('Problem retrieving your bookings. ' + error);
                this.router.navigate(['/home']);
                return of(null);
            })
        );
    }
}
