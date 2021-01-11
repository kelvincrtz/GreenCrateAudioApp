import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertifyService } from '../_services/alertify.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from '../_models/user';
import { Review } from '../_models/review';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  registerMode = false;
  user: User;
  reviews: Review[];
  loginForm: FormGroup;

  constructor(public authService: AuthService, private alertify: AlertifyService, private router: Router,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.reviews = data.reviews;
    });

    this.loginForm = new FormGroup({
      userName: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });
  }

  loginClick() {
    if (this.loginForm.valid) {
      this.user = Object.assign({}, this.loginForm.value);
      this.authService.login(this.user).subscribe(next => {
        this.alertify.success('Logged in successfuly');
      }, error => {
        this.alertify.error('User does not exist');
      }, () => {
        if (this.authService.roleMatch(['Admin'])) {
          this.router.navigate(['/calendar']);
        }
        if (this.authService.roleMatch(['Member'])) {
          this.router.navigate(['/members', this.authService.decodedToken.nameid]);
        }
      });
    }
  }

  cancelLogin() {
    this.loginForm.reset(this.user);
  }

  loggedIn() {
    return this.authService.loggedIn(); // being checked for JWT validity date
  }

  registerToggle() {
    this.registerMode = true;
  }

  cancelRegisterMode(registerMode: boolean) {
    this.registerMode = registerMode;
  }

  scrollToElement($element): void {
    console.log($element);
    // tslint:disable-next-line: quotemark
    $element.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
  }

}
