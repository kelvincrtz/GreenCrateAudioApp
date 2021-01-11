import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Booking } from 'src/app/_models/booking';
import { PaginatedResult, Pagination } from 'src/app/_models/pagination';
import { Review } from 'src/app/_models/review';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { AuthService } from 'src/app/_services/auth.service';
import { BookingService } from 'src/app/_services/booking.service';
import { ReviewEditComponent } from '../review-edit/review-edit.component';

@Component({
  selector: 'app-review-card',
  templateUrl: './review-card.component.html',
  styleUrls: ['./review-card.component.css']
})
export class ReviewCardComponent implements OnInit {
  reviews: Review[];
  bsModalRef: any;
  booking: Booking;
  pagination: Pagination;

  constructor(private alertify: AlertifyService, private modalService: BsModalService, private route: ActivatedRoute,
              private bookingService: BookingService, private authService: AuthService) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.reviews = data.reviews.result;
      this.pagination = data.reviews.pagination;
    });
  }

  openEditModal(review: Review): void {
    const initialState = {
        review
    };

    this.bsModalRef = this.modalService.show(ReviewEditComponent, {initialState});
    this.bsModalRef.content.closeBtnName = 'Close';

    this.bsModalRef.content.reviewBackToReviewsUser.subscribe((value: Review) => {
      this.reviews.splice(this.reviews.findIndex(b => b.id === review.id), 1, value);
    }, error => {
        this.alertify.error('Failed to update review' + error);
    });
  }

  pageChanged(event: any): void {
    this.pagination.currentPage = event.page;
    this.loadReviews();
  }

  loadReviews() {
    this.bookingService.getReviewsForAdmin(this.authService.decodedToken.nameid, this.pagination.currentPage, this.pagination.itemsPerPage)
      .subscribe((res: PaginatedResult<Review[]>) => {
        this.reviews = res.result;
        this.pagination = res.pagination;
      }, error => {
        this.alertify.error(error);
      });
  }


  openViewBookingModal(bookingId: number): void {

    console.log(bookingId);

    this.bookingService.getBooking(this.authService.decodedToken.nameid, bookingId).subscribe((booking: Booking) => {
        this.booking = booking;
    }, error => {
        this.alertify.error('Failed to retrieve booking' + error);
    });

    console.log(this.booking);
    /*
    const initialState = {
        booking
    };

    this.bsModalRef = this.modalService.show(ReviewEditComponent, {initialState});
    this.bsModalRef.content.closeBtnName = 'Close';

    this.bsModalRef.content.reviewBackToReviewsUser.subscribe((value: Review) => {
      this.reviews.splice(this.reviews.findIndex(b => b.id === review.id), 1, value);
    }, error => {
        this.alertify.error('Failed to update review' + error);
    });
    */
  }


}
