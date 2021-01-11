import { Component, Input, OnInit } from '@angular/core';
import { Review } from 'src/app/_models/review';

@Component({
  selector: 'app-review-list-card',
  templateUrl: './review-list-card.component.html',
  styleUrls: ['./review-list-card.component.css']
})
export class ReviewListCardComponent implements OnInit {
  @Input() review: Review;

  constructor() { }

  ngOnInit() {
  }

}
