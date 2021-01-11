import { Component, EventEmitter, OnInit, Output, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Review } from 'src/app/_models/review';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { AuthService } from 'src/app/_services/auth.service';
import { BookingService } from 'src/app/_services/booking.service';

@Component({
  selector: 'app-review-edit',
  templateUrl: './review-edit.component.html',
  styleUrls: ['./review-edit.component.css']
})
export class ReviewEditComponent implements OnInit {
  @Output() reviewBackToReviewsUser = new EventEmitter();
  review: Review;
  reviewToUpdate: Review;
  reviewForm: FormGroup;
  reviewFromRepoId: any;

  modalRefConfirm: BsModalRef;

  constructor(public bsModalRef: BsModalRef, private modalService: BsModalService, private bookingService: BookingService,
              private alertify: AlertifyService, private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.reviewFromRepoId = this.review.id;

    this.reviewForm = new FormGroup({
      isApproved: new FormControl(this.review.isApproved, Validators.requiredTrue),
    });
  }

  updateReviewRequest(template: TemplateRef<any>) {
    this.modalRefConfirm = this.modalService.show(template, {class: 'modal-md'});
  }

  confirm(): void {
    if (this.reviewForm.valid) {
      this.reviewToUpdate = Object.assign({}, this.reviewForm.value);
      this.bookingService.updateReviewStatus(this.authService.decodedToken.nameid, this.reviewFromRepoId, this.reviewToUpdate)
      .subscribe(next => {
        this.alertify.success('Review request has been updated');
        this.review.isApproved = this.reviewToUpdate.isApproved;
        this.reviewBackToReviewsUser.emit(this.review);
      }, error => {
        this.alertify.error('Error sending the request');
      }, () => {
        this.router.navigate(['/reviews/admin/' + this.authService.decodedToken.nameid]);
      });
    }
    this.modalRefConfirm.hide();
    this.bsModalRef.hide();
  }

  cancel() {
    this.bsModalRef.hide();
  }

  decline(): void {
    this.modalRefConfirm.hide();
    this.bsModalRef.hide();
    // this.router.navigate(['/bookingsforuser/']);
  }

}
