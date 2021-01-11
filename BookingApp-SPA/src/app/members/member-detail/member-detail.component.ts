import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/_models/user';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/_services/auth.service';
import { Booking } from 'src/app/_models/booking';
import { BookingService } from 'src/app/_services/booking.service';
import { MessageService } from 'src/app/_services/message.service';
import { Message } from 'src/app/_models/message';


@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit {
  user: User;
  bookings: Booking[];
  messages: Message[];
  authDecodeToken: any;
  authDecodeName: any;

  dismissible = true;
  alerts: any;

  constructor(private route: ActivatedRoute, private authService: AuthService, private alertify: AlertifyService,
              private bookingService: BookingService, private messageService: MessageService) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.user = data.user;
    });

    this.authDecodeToken = this.authService.decodedToken.nameid;
    this.authDecodeName = this.authService.decodedToken.unique_name;

    this.loadNofifyBookings();
    this.loadNofifyMessages();
  }

  onClosed(bookingId: any) {
    this.markBookingNotified(bookingId);
    this.bookings.splice(this.bookings.findIndex(m => m.id === bookingId), 1);
  }

  onClosedMessage(messageId: any, recipientId: any) {
    this.messageService.markNotified(recipientId, messageId);
    this.messages.splice(this.messages.findIndex(m => m.id === messageId), 1);
  }

  loadNofifyBookings() {
    this.bookingService.getNotifyBookings(this.authService.decodedToken.nameid)
      .subscribe((booking: any) => {
      this.bookings = booking;
      if (this.bookings.length && this.user.id === +this.authService.decodedToken.nameid) {
          if (this.bookings.length === 1) {
            this.alertify.success('You have a booking notification');
          } else {
            this.alertify.success('You have ' + this.bookings.length + ' booking notification');
          }
      }
    }, error => {
      console.log(error);
    });
  }

  loadNofifyMessages() {
    this.messageService.getNotifyMessages(this.authService.decodedToken.nameid)
      .subscribe((message: any) => {
      this.messages = message;
      if (this.messages.length && this.user.id === +this.authService.decodedToken.nameid) {
        if (this.messages.length === 1) {
          this.alertify.success('You have a new message');
        } else {
          this.alertify.success('You have ' + this.messages.length + ' new messages');
        }
      }
    }, error => {
      console.log(error);
    });
  }

  markMessageNotified(recipientId: any) {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.messages.length; i++) {
        this.messageService.markNotified(recipientId, this.messages[i].id);
        this.messages.splice(this.messages.findIndex(m => m.id === this.messages[i].id), 1);
    }
  }

  markBookingNotified(bookingId: number) {
    this.bookingService.markSeenNotify(this.authService.decodedToken.nameid, bookingId);
  }
}
