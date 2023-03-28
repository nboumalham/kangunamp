import { Component, OnInit } from '@angular/core';

import { AudioService } from '../services/audio.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
   
  statusLogo : string = "";
  now : string = new Date().toLocaleTimeString();

  constructor(private audioService: AudioService) {
       setInterval(() => {
          this.now = new Date().toLocaleTimeString();
        }, 60000);
  }

  ngOnInit(): void {
    this.audioService.getPlayerStatus().subscribe(status => {
    switch (status) {
      case 'playing':
        this.statusLogo = "⏵︎";
        return;
      case 'paused':
        this.statusLogo = "⏸︎";
        return;
      case 'stopped':
        this.statusLogo = "";
        return;
      case 'loading':
        this.statusLogo = "⏳︎";
        return;
      case 'ended':
        this.statusLogo = "⏹︎";
        return;
      default:
        this.statusLogo = status;
    }
    });
  }

}
