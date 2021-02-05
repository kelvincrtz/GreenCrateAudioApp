import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Booking } from 'src/app/_models/booking';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { BookingService } from 'src/app/_services/booking.service';
import { AuthService } from 'src/app/_services/auth.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { User } from 'src/app/_models/user';
import { UserService } from 'src/app/_services/user.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-booking-edit-status',
  templateUrl: './booking-edit-status.component.html',
  styleUrls: ['./booking-edit-status.component.css']
})
export class BookingEditStatusComponent implements OnInit {
  booking: Booking;
  bookingStatus: Booking;
  bookingForm: FormGroup;
  messageForAdmin: any;
  authDecodeName: any;
  user: User;

  @ViewChild('template', {static: true}) template: TemplateRef<any>;
  modalRef: BsModalRef;

  constructor(private route: ActivatedRoute, private alertify: AlertifyService, private router: Router,
              private bookingService: BookingService, private authService: AuthService, private modalService: BsModalService,
              private userService: UserService) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
        this.booking = data.booking;
      });

    this.bookingForm = new FormGroup({
      status: new FormControl('', Validators.required),
    });

    this.authDecodeName = this.authService.decodedToken.unique_name;

    this.loadUser();

    this.bookingService.markSeenByAdmin(this.authService.decodedToken.nameid, this.booking.id);
  }

  updateBookingStatusRequest() {

    if (this.bookingForm.get('status').value === this.booking.status) {
        this.messageForAdmin = 'This request has already been ' + this.bookingForm.get('status').value.toLowerCase() + ' by you!';
        this.modalRef = this.modalService.show(this.template, {class: 'modal-sm'});
        return this.modalRef;
    }

    if (this.bookingForm.valid) {
      this.bookingStatus = Object.assign({}, this.bookingForm.value);
      this.bookingService.updateBookingStatus(this.authService.decodedToken.nameid, this.booking.id, this.bookingStatus).subscribe(next => {
        this.alertify.success('Booking status has been updated');
        this.bookingForm.reset(this.booking);
      }, error => {
        this.alertify.error('Error sending the request');
      }, () => {
        this.router.navigate(['bookings']);
      });
    }
  }

  cancel() {
    this.router.navigate(['/bookings/']);
  }

  loadUser() {
    this.userService.getUser(this.booking.userId).subscribe((user: User) => {
      this.user = user;
    }, error => {
      console.log(error);
    });
  }
}
