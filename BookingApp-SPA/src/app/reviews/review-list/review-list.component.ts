import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PaginatedResult, Pagination } from 'src/app/_models/pagination';
import { Review } from 'src/app/_models/review';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { BookingService } from 'src/app/_services/booking.service';

@Component({
  selector: 'app-review-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.css']
})
export class ReviewListComponent implements OnInit {
  reviews: Review[];
  pagination: Pagination;

  constructor(private route: ActivatedRoute, private bookingService: BookingService, private alertify: AlertifyService) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.reviews = data.reviews.result;
      this.pagination = data.reviews.pagination;
    });
  }

  loadReviews() {
    this.bookingService.getMoreReviews(this.pagination.currentPage, this.pagination.itemsPerPage)
      .subscribe((res: PaginatedResult<Review[]>) => {
        this.reviews = res.result;
        this.pagination = res.pagination;
      }, error => {
        this.alertify.error(error);
      });
  }

  pageChanged(event: any): void {
    this.pagination.currentPage = event.page;
    this.loadReviews();
  }
}
