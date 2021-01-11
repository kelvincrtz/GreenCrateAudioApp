import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  model: any = {};
  isCollapsed = true;

  constructor(public authService: AuthService, private alertify: AlertifyService, private router: Router) { }

  ngOnInit() {
  }

  login() {
    this.authService.login(this.model).subscribe(next => {
      this.alertify.success('Logged in successfuly');
    }, error => {
      this.alertify.error(error);
    }, () => {
      if (this.authService.roleMatch(['Admin', 'Moderator'])) {
        this.router.navigate(['/members']);
      }
      if (this.authService.roleMatch(['Member'])) {
        this.router.navigate(['/members', this.authService.decodedToken.nameid]);
      }
    });
  }

  loggedIn() {
    return this.authService.loggedIn(); // being checked for JWT validity date
  }

  logout() {
    localStorage.removeItem('token');
    this.alertify.message('Logged out');
    this.router.navigate(['/home']);
  }

  scrollToElement($element): void {
    console.log($element);
    // tslint:disable-next-line: quotemark
    $element.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
  }

}
