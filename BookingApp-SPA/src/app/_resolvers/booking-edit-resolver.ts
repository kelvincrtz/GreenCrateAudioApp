import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot, ActivatedRoute } from '@angular/router';
import { AlertifyService } from '../_services/alertify.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Booking } from '../_models/booking';
import { BookingService } from '../_services/booking.service';
import { AuthService } from '../_services/auth.service';

@Injectable()
export class BookingEditResolver implements Resolve<Booking> {

    constructor(private bookingService: BookingService, private router: Router, private route: ActivatedRoute,
                private alertify: AlertifyService, private authService: AuthService) {}

    resolve(route: ActivatedRouteSnapshot): Observable<Booking> {
        return this.bookingService.getBooking(this.authService.decodedToken.nameid, route.params.id).pipe(
            catchError(error => {
                this.alertify.error('Problem editing this booking request. ' + error);
                this.router.navigate(['/home']);
                return of(null);
            })
        );
    }
}
