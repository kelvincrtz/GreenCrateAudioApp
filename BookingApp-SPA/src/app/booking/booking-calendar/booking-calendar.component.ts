import { Component, OnInit } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import {
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
  addMinutes,
} from 'date-fns';
import { Subject } from 'rxjs';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView,
  CalendarWeekViewBeforeRenderEvent,
  CalendarMonthViewDay,
} from 'angular-calendar';

import { BookingService } from 'src/app/_services/booking.service';
import { AuthService } from 'src/app/_services/auth.service';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Booking } from 'src/app/_models/booking';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';


const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
};

@Component({
  selector: 'app-booking-calendar',
  templateUrl: './booking-calendar.component.html',
  styleUrls: ['./booking-calendar.component.css']
})
export class BookingCalendarComponent implements OnInit {
  activeDayIsOpen = true;

  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  events: CalendarEvent[] = [];
  refresh: Subject<any> = new Subject();

  dayEvents: CalendarEvent[] = [];
  dayRefresh: Subject<any> = new Subject();

  todaysDate: Date;
  clickedDate: Date;
  clickedColumn: number;
  clickMessage = '';

  bookingForm: FormGroup;
  booking: Booking;

  clickBooking = false;

  modalRef: BsModalRef;
  isCollapsed = true;

  constructor(private authService: AuthService, private bookingService: BookingService, private alertify: AlertifyService,
              private router: Router, private modalService: BsModalService) { }

  ngOnInit() {
    this.getCalendarEvents((this.viewDate.getFullYear()), (this.viewDate.getMonth() + 1));
    this.todaysDate = new Date();
  }

  notValidClick(day: any) {
    const obj: Array<any> = [];
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < day.events.length; i++) {
            // tslint:disable-next-line: ban-types
            const dayEvent: Object = {
              id: day.events[i].id,
              title: day.events[i].title,
              start: day.events[i].start,
              end: day.events[i].end,
              meta: day.events[i].meta,
            };

            obj.push(dayEvent);
    }
    this.dayEvents = obj.sort((n1, n2) => {
      if (n1.start.getHours() > n2.start.getHours()) {
          return 1;
      }

      if (n1.start.getHours() < n2.start.getHours()) {
          return -1;
      }
      return 0;
    });

    this.dayRefresh.next();

    this.clickMessage = 'This day is already fully booked. Please choose a different date.';
    this.clickedDate  = null;
  }

  validClick(day: any) {
    this.clickBooking = true;
    const obj: Array<any> = [];
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < day.events.length; i++) {
            // tslint:disable-next-line: ban-types
            const dayEvent: Object = {
              id: day.events[i].id,
              title: day.events[i].title,
              start: day.events[i].start,
              end: day.events[i].end,
              meta: day.events[i].meta,
            };
            obj.push(dayEvent);
    }
    this.dayEvents = obj.sort((n1, n2) => {
      if (n1.start.getHours() > n2.start.getHours()) {
          return 1;
      }

      if (n1.start.getHours() < n2.start.getHours()) {
          return -1;
      }
      return 0;
    });

    this.dayRefresh.next();

    this.clickedDate  = day.date;
    this.clickMessage = null;

    this.bookingForm = new FormGroup({
      when: new FormControl(day.date, Validators.required), // add validator here
      location: new FormControl('', Validators.required),
      fromTime: new FormControl(day.date, Validators.required),
      toTime: new FormControl(day.date, Validators.required),
    }, this.dateValidator);

  }

  dateValidator(g: FormGroup) {
    return g.get('when').value >= Date.now() ? null : {errordate: true } ;
  }

  registerBooking(template: TemplateRef<any>) {
    if (this.bookingForm.valid) {
      this.fixDate(this.bookingForm.get('when').value);
      this.fixDate(this.bookingForm.get('fromTime').value);
      this.fixDate(this.bookingForm.get('toTime').value);
      this.booking = Object.assign({}, this.bookingForm.value);
      this.bookingService.createBooking(this.authService.decodedToken.nameid, this.booking).subscribe(next => {
        this.alertify.success('Booking request has been submitted');
      }, error => {
        this.alertify.error('Error sending the request');
      }, () => {
        this.modalRef = this.modalService.show(template, {class: 'modal-md'});
        this.router.navigate(['/bookingsforuser/']);
      });
    }
  }

  fixDate(d: Date): Date {
    d.setHours(d.getHours() - d.getTimezoneOffset() / 60);
    return d;
  }

  cancel() {
    this.clickBooking = false;
  }

  expiredCell(day: any) {
    const dayTime = new Date(day.date);
    this.clickMessage = 'Sorry but ' + dayTime.toDateString() + ' is expired. Please select a valid date.';
    this.clickedDate = null;
    this.dayEvents = null;
  }

  loopThroughEvents(res: any) {
    const obj: Array<any> = [];
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < res.length; i++) {
      if (res[i].status === 'Approved') {
        const dayTime = new Date(res[i].when);
        const startTime = new Date(res[i].fromTime);
        const endTime = new Date(res[i].toTime);
        // tslint:disable-next-line: ban-types
        const event: Object = {
          id: res[i].id,
          title: res[i].location,
          start: new Date(dayTime.getFullYear(), dayTime.getMonth(), dayTime.getDate(), startTime.getHours(), startTime.getMinutes()),
          end: new Date(dayTime.getFullYear(), dayTime.getMonth(), dayTime.getDate(), endTime.getHours(), endTime.getMinutes()),
          meta: res[i].status,
        };
        obj.push(event);
      }
    }
    this.events = obj;
    this.refresh.next();
  }

  getCalendarEvents(year: number, month: number) {
    this.bookingService.getCalendarBookings(this.authService.decodedToken.nameid, year, month)
     .subscribe(bookings => {
      this.loopThroughEvents(bookings);
    }, error => {
      this.alertify.error(error);
    });
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-md'});
  }

  closeModal(): void {
    this.modalRef.hide();
    this.alertify.success('Terms and conditions have been read.');
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
    this.getCalendarEvents((this.viewDate.getFullYear()), (this.viewDate.getMonth() + 1));
  }
}
