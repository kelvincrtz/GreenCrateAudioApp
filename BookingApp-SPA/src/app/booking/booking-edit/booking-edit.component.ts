import { Component, EventEmitter, OnInit, Output, TemplateRef } from '@angular/core';
import { Booking } from 'src/app/_models/booking';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { BookingService } from 'src/app/_services/booking.service';
import { AuthService } from 'src/app/_services/auth.service';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-booking-edit',
  templateUrl: './booking-edit.component.html',
  styleUrls: ['./booking-edit.component.css']
})
export class BookingEditComponent implements OnInit {
  @Output() bookingBackToBookingsUser = new EventEmitter();
  booking: Booking;
  bookingToUpdate: Booking;
  bookingForm: FormGroup;
  bookingFromRepoId: any;

  modalRefConfirm: BsModalRef;

  isCollapsed = true;

  constructor(private bookingService: BookingService, private authService: AuthService, private alertify: AlertifyService,
              private router: Router, private route: ActivatedRoute, public bsModalRef: BsModalRef,
              private modalService: BsModalService) { }

  ngOnInit() {
    this.bookingFromRepoId = this.booking.id;

    const fromTimeDate = new Date(this.booking.fromTime);
    const toTimeDate = new Date(this.booking.toTime);

    this.bookingForm = new FormGroup({
      when: new FormControl(this.booking.when, Validators.required),
      location: new FormControl(this.booking.location, Validators.required),
      fromTime: new FormControl(fromTimeDate, Validators.required),
      toTime: new FormControl(toTimeDate, Validators.required),
    });
  }

  updateBookingRequest(template: TemplateRef<any>) {
    this.modalRefConfirm = this.modalService.show(template, {class: 'modal-md'});
  }

  fixDate(d: Date): Date {
    d.setHours(d.getHours() - d.getTimezoneOffset() / 60);
    return d;
  }

  cancel() {
    this.bsModalRef.hide();
  }

  confirm(): void {
    if (this.bookingForm.valid) {
      this.fixDate(this.bookingForm.get('fromTime').value);
      this.fixDate(this.bookingForm.get('toTime').value);
      this.bookingToUpdate = Object.assign({}, this.bookingForm.value);
      this.bookingService.updateBooking(this.authService.decodedToken.nameid, this.bookingFromRepoId, this.bookingToUpdate)
      .subscribe(next => {
        this.alertify.success('Booking request has been updated');
      }, error => {
        this.alertify.error('Error sending the request');
      }, () => {
        this.router.navigate(['/bookingsforuser']);
      });
    }
    this.modalRefConfirm.hide();
    this.bsModalRef.hide();

    this.updateTimeAndLocation(this.bookingToUpdate);

    this.bookingBackToBookingsUser.emit(this.booking);
  }

  updateTimeAndLocation(bookingUpdate: Booking) {
    const today = new Date();

    this.booking.when = bookingUpdate.when;
    this.booking.location = bookingUpdate.location;

    const fromTimeSet = new Date();
    fromTimeSet.setHours(bookingUpdate.fromTime.getUTCHours(), bookingUpdate.fromTime.getUTCMinutes());

    const toTimeSet = new Date();
    toTimeSet.setHours(bookingUpdate.toTime.getUTCHours(), bookingUpdate.toTime.getUTCMinutes());

    this.booking.fromTime = fromTimeSet;
    this.booking.toTime = toTimeSet;
    this.booking.isEdited = true;
    this.booking.dateAdded = today;
  }

  decline(): void {
    this.modalRefConfirm.hide();
    this.bsModalRef.hide();
    this.router.navigate(['/bookingsforuser/']);
  }

}
