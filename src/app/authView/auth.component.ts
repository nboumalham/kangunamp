import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { JellyfinService } from '../services/jellyfin.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  username: string = "";
  password: string = "";
  errorMessage: string = "";

  constructor(private http: HttpClient, private router: Router, private jellyfinService: JellyfinService) {}

  ngOnInit() {
  }

  onSubmit() {
    this.jellyfinService.authenticate(this.username, this.password).subscribe(
      (response: any) => {
        localStorage.setItem('jellyfin_access_token', response.AccessToken);
        localStorage.setItem('jellyfin_user_id', response.User.Id);
        this.errorMessage = '';
        this.router.navigate(['/home']);
      },
      (error: any) => {
        this.errorMessage = 'Invalid username or password';
      }
    );
  }
}
