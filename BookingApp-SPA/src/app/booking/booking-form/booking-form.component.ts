import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { Booking } from 'src/app/_models/booking';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { BookingService } from 'src/app/_services/booking.service';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/_services/auth.service';
import { setTime } from 'ngx-bootstrap/chronos/utils/date-setters';
import { setDate } from 'date-fns';

@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.css']
})
export class BookingFormComponent implements OnInit {
  booking: Booking;
  bookingForm: FormGroup;
  bsConfig: Partial<BsDatepickerConfig>;

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.bookingForm.dirty) {
      $event.returnValue = true;
    }
  }

  constructor(private bookingService: BookingService, private authService: AuthService, private alertify: AlertifyService,
              private router: Router) { }

  ngOnInit() {
    this.bsConfig = {
      containerClass: 'theme-red'
    };

    this.bookingForm = new FormGroup({
      when: new FormControl(null, Validators.required), // add validator here
      location: new FormControl('', Validators.required),
      fromTime: new FormControl(null, Validators.required),
      toTime: new FormControl(null, Validators.required),
    }, this.dateValidator);
  }

  dateValidator(g: FormGroup) {
    return g.get('when').value >= Date.now() ? null : {errordate: true } ;
  }

  registerBooking() {
    if (this.bookingForm.valid) {
      this.booking = Object.assign({}, this.bookingForm.value);
      console.log(this.booking);
      this.bookingService.createBooking(this.authService.decodedToken.nameid, this.booking).subscribe(next => {
        this.alertify.success('Booking request has been submitted');
        console.log(this.booking);
      }, error => {
        this.alertify.error('Error sending the request');
      }, () => {
        this.router.navigate(['/bookingsforuser/']);
      });
    }
  }

  cancel() {
    this.router.navigate(['/members/', this.authService.decodedToken.nameid]);
  }
}
