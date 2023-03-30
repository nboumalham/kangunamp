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
  
  quickConnectCode: string | null = null;
  quickConnectInterval: any;

  constructor(private http: HttpClient, private router: Router, private jellyfinService: JellyfinService) {}

ngOnInit() {
  this.jellyfinService.initiateQuickConnect().subscribe(
    (response: any) => {
      if (response && response.Secret && response.Code) {
        this.quickConnectCode = response.Code;
        this.startQuickConnectPolling(response.Secret);
      } else {
        this.errorMessage = 'Error initiating Quick Connect';
      }
    },
    (error: any) => {
      this.errorMessage = 'Error initiating Quick Connect';
    }
  );
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


startQuickConnectPolling(secret: string) {
  this.quickConnectInterval = setInterval(() => {
    this.jellyfinService.checkQuickConnectStatus(secret).subscribe(
      (response: any) => {
        if (response && response.Authenticated) {
          this.jellyfinService.authenticateWithQuickConnect(secret).subscribe(
            (authResponse: any) => {
              localStorage.setItem('jellyfin_access_token', authResponse.AccessToken);
              localStorage.setItem('jellyfin_user_id', authResponse.User.Id);
              this.errorMessage = '';
              this.router.navigate(['/home']);
            },
            (authError: any) => {
              this.errorMessage = 'Error authenticating with Quick Connect';
            }
          );
        }
      },
      (error: any) => {
        this.errorMessage = 'Error checking Quick Connect status';
      }
    );
  }, 5000); // Poll every 5 seconds
}



  ngOnDestroy() {
    if (this.quickConnectInterval) {
      clearInterval(this.quickConnectInterval);
    }
  }
}
