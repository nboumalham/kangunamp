import { Component, OnInit } from '@angular/core';

import { AudioService } from '../services/audio.service';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
   
  statusLogo : string = "";
  title: string = '';

  constructor(private audioService: AudioService, private sharedService : SharedService) {}

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

    this.sharedService.getTitle().subscribe(title => {
      this.title = title;
    });
  }

}
