import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { Message } from 'src/app/_models/message';
import { MessageService } from 'src/app/_services/message.service';
import { AuthService } from 'src/app/_services/auth.service';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-member-messages',
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.css']
})
export class MemberMessagesComponent implements OnInit {
  @ViewChild('scroller', {static: false}) private feedContainer: ElementRef;
  @Input() recipientId: number;
  messages: Message[];
  newMessage: any  = {};

  constructor(private messageService: MessageService, private authService: AuthService,
              private alertify: AlertifyService) { }

  ngOnInit() {
    this.loadMessages();
  }

  loadMessages() {
    const currentUserId = +this.authService.decodedToken.nameid;
    this.messageService.getMessageThread(this.authService.decodedToken.nameid, this.recipientId)
      .pipe(
        tap(messages => {
          // tslint:disable-next-line: prefer-for-of
          for (let i = 0; i < messages.length; i++) {
            if (messages[i].isRead === false && messages[i].recipientId === currentUserId) {
                this.messageService.markAsRead(currentUserId, messages[i].id);
              }
          }
        })
      )
      .subscribe(messages => {
        this.messages = messages;
      }, error => {
        this.alertify.error = error;
      });
  }

  sendMessage() {
    this.newMessage.recipientId = this.recipientId;
    this.messageService.sendMessage(this.authService.decodedToken.nameid, this.newMessage)
      .subscribe((message: Message) => {
        this.messages.push(message);
        this.newMessage.content = '';
        this.feedContainer.nativeElement.scrollTop = this.feedContainer.nativeElement.scrollHeight;
      }, error => {
        this.alertify.error(error);
      });
  }

  scrollToBottom(): void {
    this.feedContainer.nativeElement.scrollTop = this.feedContainer.nativeElement.scrollHeight;
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngAfterViewChecked() {
    this.scrollToBottom();
  }
}
