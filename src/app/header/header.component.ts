import { Component, OnInit } from '@angular/core';

import { AudioService } from '../services/audio.service';
import {DeviceType, SharedService} from '../services/shared.service';
import {Location} from "@angular/common";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  statusLogo : string = "";
  title: string = '';

  constructor(private audioService: AudioService, public sharedService : SharedService, public location : Location) {}

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

  protected navigateBack() {
    if (this.sharedService.getStackSize() > 1) {
      this.sharedService.popViewIndex();
      this.location.back();
    }
  }

  protected readonly DeviceType = DeviceType;
}
