import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FileItem, FileUploader } from 'ng2-file-upload';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Booking } from 'src/app/_models/booking';
import { Review } from 'src/app/_models/review';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { AuthService } from 'src/app/_services/auth.service';
import { BookingService } from 'src/app/_services/booking.service';
import { UserService } from 'src/app/_services/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-booking-review',
  templateUrl: './booking-review.component.html',
  styleUrls: ['./booking-review.component.css']
})
export class BookingReviewComponent implements OnInit {
  booking: Booking;

  reviewForm: FormGroup;
  uploader: FileUploader;

  baseUrl = environment.apiUrl;

  rating = 0;

  review: Review;

  modalRef: BsModalRef;
  modalRef2: BsModalRef;

  modalRefRating: BsModalRef;

  constructor(private route: ActivatedRoute, private alertify: AlertifyService, private router: Router,
              private bookingService: BookingService, private authService: AuthService, private modalService: BsModalService) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.booking = data.booking;
    });

    this.initializeUploader();

    this.reviewForm = new FormGroup({
      description: new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(300)]),
      rating: new FormControl(this.rating, Validators.required)
    });

  }

  initializeUploader() {
    this.uploader = new FileUploader({
      url: this.baseUrl + 'reviews/users/' + this.authService.decodedToken.nameid,
      authToken: 'Bearer ' + localStorage.getItem('token'),
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 10 * 1024 * 1024
    });

    this.uploader.onAfterAddingFile = (file) => {file.withCredentials = false; };

  }

  confimRatingToUser(template: TemplateRef<any>, template2: TemplateRef<any>) {
    if (this.rating <= 3) {
      // Open modal to confim rating to the user
      this.modalRef2 = this.modalService.show(template2, {class: 'modal-md'});
    } else {
      this.uploadSection(template);
    }
  }

  uploadSection(template: TemplateRef<any>) {

    if (this.rating <= 3 ) {
      this.modalRef2.hide();
    }

    if (this.reviewForm.valid) {
      this.review = Object.assign({}, this.reviewForm.value);

      this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
        form.append('description', this.review.description); // note comma separating key and value
        form.append('rating', this.rating);
        form.append('bookingId', this.booking.id);
        form.append('userId', this.authService.decodedToken.nameid);
        form.append('booking', this.booking);
       };

      if (this.uploader.getNotUploadedItems().length) {
        this.uploader.uploadAll();

        this.uploader.onSuccessItem = (item, response, status, headers) => {
        this.bookingService.updateBookingIsReviewed(this.authService.decodedToken.nameid, this.booking.id, this.booking).subscribe(next => {
            this.alertify.success('Review has been created');
          }, error => {
            this.alertify.error('Error sending the request');
          }, () => {
            this.modalRef = this.modalService.show(template, {class: 'modal-md'});
            this.router.navigate(['/bookingsforuser/']);
          });
        };
      } else {
        // Populate Review
        this.review.bookingId = this.booking.id;
        this.review.rating = this.rating;

        // Call booking service for review upload no photo
        this.bookingService.createReviewNoPhoto(this.authService.decodedToken.nameid, this.review).subscribe(next => {
          this.alertify.success('Review with no photo has been created');
        }, error => {
          this.alertify.error('Error sending the review without photo');
        }, () => {
        this.bookingService.updateBookingIsReviewed(this.authService.decodedToken.nameid, this.booking.id, this.booking).subscribe(next => {
            this.alertify.success('Mark booking is reviewed succesful');
          }, error => {
            this.alertify.error('Error marking reviewed for the booking');
          }, () => {
            this.modalRef = this.modalService.show(template, {class: 'modal-md'});
            this.router.navigate(['/bookingsforuser/']);
          });
        });
      }
    }
  }

  backToBookings() {
    this.modalRef.hide();
  }

  cancel() {
    this.router.navigate(['/bookingsforuser/']);
  }
}
