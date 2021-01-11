import { Component, EventEmitter, OnInit, Output, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CalendarEvent } from 'angular-calendar';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Booking } from 'src/app/_models/booking';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { AuthService } from 'src/app/_services/auth.service';
import { BookingService } from 'src/app/_services/booking.service';

@Component({
  selector: 'app-booking-edit-admin',
  templateUrl: './booking-edit-admin.component.html',
  styleUrls: ['./booking-edit-admin.component.css']
})
export class BookingEditAdminComponent implements OnInit {
  @Output() bookingBackToBookingsUser = new EventEmitter();
  event: CalendarEvent<any>;
  bookingToUpdate: Booking;
  bookingForm: FormGroup;
  bookingFromRepoId: any;

  modalRefConfirm: BsModalRef;

  constructor(private bookingService: BookingService, private authService: AuthService, private alertify: AlertifyService,
              private router: Router, private route: ActivatedRoute, public bsModalRef: BsModalRef,
              private modalService: BsModalService) { }

  ngOnInit() {

    this.bookingFromRepoId = this.event.id;

    const fromTimeDate = new Date(this.event.start);
    const toTimeDate = new Date(this.event.end);

    this.bookingForm = new FormGroup({
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
      this.bookingService.updateBookingAdmin(this.authService.decodedToken.nameid, this.bookingFromRepoId, this.bookingToUpdate)
      .subscribe(next => {
        this.alertify.success('Booking request via Admin has been updated');
      }, error => {
        this.alertify.error('Error sending the request');
      }, () => {
        this.router.navigate(['/calendar']);
      });
    }
    this.modalRefConfirm.hide();
    this.bsModalRef.hide();

    this.updateTimeAndLocation(this.bookingToUpdate);

    this.bookingBackToBookingsUser.emit(this.event);
  }

  updateTimeAndLocation(bookingUpdate: Booking) {

    const fromTimeSet = new Date();
    fromTimeSet.setMonth(bookingUpdate.fromTime.getUTCMonth());
    fromTimeSet.setDate(bookingUpdate.fromTime.getUTCDate());
    fromTimeSet.setFullYear(bookingUpdate.fromTime.getUTCFullYear());
    fromTimeSet.setHours(bookingUpdate.fromTime.getUTCHours(), bookingUpdate.fromTime.getUTCMinutes());

    const toTimeSet = new Date();
    toTimeSet.setMonth(bookingUpdate.toTime.getUTCMonth());
    toTimeSet.setDate(bookingUpdate.toTime.getUTCDate());
    toTimeSet.setFullYear(bookingUpdate.toTime.getUTCFullYear());
    toTimeSet.setHours(bookingUpdate.toTime.getUTCHours(), bookingUpdate.toTime.getUTCMinutes());

    this.event.start = fromTimeSet;
    this.event.end = toTimeSet;
  }

  decline(): void {
    this.modalRefConfirm.hide();
    this.bsModalRef.hide();
    this.router.navigate(['/calendar/']);
  }
}
