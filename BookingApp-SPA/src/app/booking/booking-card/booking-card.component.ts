import { Component, OnInit, Input } from '@angular/core';
import { Booking } from 'src/app/_models/booking';
import { UserService } from 'src/app/_services/user.service';
import { User } from 'src/app/_models/user';

@Component({
  selector: 'app-booking-card',
  templateUrl: './booking-card.component.html',
  styleUrls: ['./booking-card.component.css']
})
export class BookingCardComponent implements OnInit {
  @Input() booking: Booking;

  constructor(private userService: UserService) { }

  ngOnInit() {
  }

}
