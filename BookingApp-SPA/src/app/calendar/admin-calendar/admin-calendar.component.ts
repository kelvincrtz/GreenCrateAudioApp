import { Component, OnInit } from '@angular/core';
import {
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours,
} from 'date-fns';
import { Subject } from 'rxjs';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView,
} from 'angular-calendar';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { BookingService } from 'src/app/_services/booking.service';
import { AuthService } from 'src/app/_services/auth.service';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { BookingEditAdminComponent } from 'src/app/booking/booking-edit-admin/booking-edit-admin.component';
import { Booking } from 'src/app/_models/booking';
import { BookingEditStatusModalComponent } from 'src/app/booking/booking-edit-status-modal/booking-edit-status-modal.component';
import { Router } from '@angular/router';
import { User } from 'src/app/_models/user';
import { UserService } from 'src/app/_services/user.service';

const colors: any = {
  red: {
    primary: '#e8b5b5',
    secondary: '#e8b5b5',
  },
  green: {
    primary: '#b0ebbc',
    secondary: '#b0ebbc',
  },
  dark: {
    primary: '#c3c9c5',
    secondary: '#c3c9c5',
  },
  orange: {
    primary: '#f2b655',
    secondary: '#f2b655',
  },
};

@Component({
  selector: 'app-admin-calendar',
  templateUrl: './admin-calendar.component.html',
  styleUrls: ['./admin-calendar.component.css']
})
export class AdminCalendarComponent implements OnInit {
  activeDayIsOpen = true;

  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  modalRef: BsModalRef;

  refresh: Subject<any> = new Subject();
  events: CalendarEvent[];

  bsModalRef: BsModalRef;
  bsModalRef2: BsModalRef;
  bsModalRef3: BsModalRef;

  closeBtnName: string;

  booking: any = {};

  eventToAdjust: CalendarEvent;

  bookingFromRepo: Booking;

  todaysDate: Date;

  constructor(private authService: AuthService, private bookingService: BookingService, private alertify: AlertifyService,
              private modalService: BsModalService, private router: Router, private userService: UserService) { }

  ngOnInit() {
    this.getCalendarEvents((this.viewDate.getFullYear()), (this.viewDate.getMonth() + 1));
    this.todaysDate = new Date();
  }

  loopThroughEvents(res: any) {
    const obj: Array<any> = [];
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < res.length; i++) {
      const dayTime = new Date(res[i].when);
      const startTime = new Date(res[i].fromTime);
      const endTime = new Date(res[i].toTime);
      // tslint:disable-next-line: ban-types
      const event: Object = {
        id: res[i].id,
        title: res[i].location,
        meta: res[i].status,
        start: new Date(dayTime.getFullYear(), dayTime.getMonth(), dayTime.getDate(), startTime.getHours(), startTime.getMinutes()),
        end: new Date(dayTime.getFullYear(), dayTime.getMonth(), dayTime.getDate(), endTime.getHours(), endTime.getMinutes()),
      };
      obj.push(event);
    }
    this.events = obj;
    this.refresh.next();

    this.colorEvents(this.events);

  }

  getCalendarEvents(year: number, month: number) {
    this.bookingService.getCalendarBookings(this.authService.decodedToken.nameid, year, month)
     .subscribe(bookings => {
      this.loopThroughEvents(bookings);
    }, error => {
      this.alertify.error(error);
    });
  }

  getBooking(bookingId: number) {
    this.bookingService.getBooking(this.authService.decodedToken.nameid, bookingId).subscribe(booking => {
     this.bookingFromRepo = booking;
   }, error => {
     this.alertify.error('Problem retrieving the booking');
   }, () => {
    this.router.navigate(['/members', this.bookingFromRepo.userId]);
   });
  }

  colorEvents(events: CalendarEvent[]) {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < events.length; i++) {
      if (events[i].meta === 'Approved') {
          events[i].color = colors.green;
      }
      if (events[i].meta === 'Declined') {
        events[i].color = colors.red;
      }
      if (events[i].meta === 'Pending') {
        events[i].color = colors.dark;
      }
      if (events[i].meta === 'Cancelled') {
        events[i].color = colors.orange;
      }
    }

    this.events = events;
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  handleEvent(action: string, event: CalendarEvent): void {
    console.log(event);
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
    this.getCalendarEvents((this.viewDate.getFullYear()), (this.viewDate.getMonth() + 1));
  }

  expiredCell(day: any) {
    const dayTime = new Date(day.date);
  }

  openModal(event: CalendarEvent, template: TemplateRef<any>): void {

    this.eventToAdjust = event;

    this.booking.id = event.id;
    this.booking.where = event.title;
    this.booking.when = event.start;
    this.booking.start = event.start;
    this.booking.end = event.end;
    this.booking.status = event.meta;

    this.bsModalRef = this.modalService.show(template);
  }

  openEditAdminModal(event: CalendarEvent): void {
    this.bsModalRef.hide();

    // Ensure Event ID is populated always or else error - Passed! Stress Test

    const initialState = {
        event
    };

    this.bsModalRef2 = this.modalService.show(BookingEditAdminComponent, {initialState});
    this.bsModalRef2.content.closeBtnName = 'Close';

    this.bsModalRef2.content.bookingBackToBookingsUser.subscribe((value: CalendarEvent) => {
      // console.log(value);
      this.events.splice(this.events.findIndex(b => b.id === event.id), 1);
      this.addEvent(value, this.eventToAdjust);
    }, error => {
        this.alertify.error('Failed to update booking' + error);
    });
  }

  openEditStatusModal(event: CalendarEvent, status: CalendarEvent, title: any): void {
    this.bsModalRef.hide();

    event.meta = status;
    event.title = title;

    const initialState = {
        event
    };

    this.bsModalRef3 = this.modalService.show(BookingEditStatusModalComponent, {initialState});
    this.bsModalRef3.content.closeBtnName = 'Close';

    this.bsModalRef3.content.bookingBackToBookingsUser.subscribe((value: CalendarEvent) => {
      this.events.splice(this.events.findIndex(b => b.id === event.id), 1);
      if (value.meta === 'Approved') {
        this.events = [
          ...this.events,
          {
            id: event.id,
            title: event.title,
            start: event.start,
            end: event.end,
            color: colors.green,
            meta: value.meta
          },
        ];
      }
      if (value.meta === 'Declined') {
        this.events = [
          ...this.events,
          {
            id: event.id,
            title: event.title,
            start: event.start,
            end: event.end,
            color: colors.red,
            meta: value.meta
          },
        ];
      }
    }, error => {
        this.alertify.error('Failed to update booking status' + error);
    });
  }

  addEvent(eventToAdd: CalendarEvent<any>, eventToAdjust: CalendarEvent): void {
    // console.log(eventToAdd);
    this.events = [
      ...this.events,
      {
        id: eventToAdjust.id,
        title: eventToAdjust.title,
        start: eventToAdd.start,
        end: eventToAdd.end,
        color: eventToAdjust.color,
        meta: eventToAdjust.meta
      },
    ];
  }

  deleteEvent(eventToDelete: CalendarEvent) {
    this.events = this.events.filter((event) => event !== eventToDelete);
  }

  messageUser(bookingId: any) {
    this.getBooking(bookingId);
    this.bsModalRef.hide();
  }
}
