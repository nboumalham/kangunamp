import { Component, OnInit, ViewChild } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Location } from '@angular/common'

import { JellyfinService } from '../services/jellyfin.service';
import { AudioService } from '../services/audio.service';
import { SharedService } from '../services/shared.service';


import { TrackItem } from '../listView/list-item.model';
import {KeyboardHelper} from '../helpers/keyboard.helper'

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('in', style({ transform: 'translateY(0)' })),
      state('out', style({ transform: 'translateY(100%)' })),
      transition('out => in', animate('400ms ease-in-out')),
      transition('in => out', animate('400ms ease-in-out'))
    ])
    ]
})
export class PlayerComponent extends KeyboardHelper implements OnInit {
  playingTrack: TrackItem = new TrackItem("0", "Unknown", "Unknown", false);
  
  timeElapsed : string = "--";
  timeRemaining : string = "--";
  progressBarWidth : string = "0%";
  trackName : string = "";
  artistName : string = "";
  imageUrl : string = "";
  drawerState = 'out';

  constructor(
    private jellyfinService: JellyfinService,
    protected audioService: AudioService,
    protected sharedService : SharedService,
    protected location: Location
  ) {
    super();
  }


  formatTime(time: number): string {
  const minutes: number = Math.floor(time / 60);
  const seconds: number = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  }

  toggleDrawer(): void {
    this.drawerState = this.drawerState === 'out' ? 'in' : 'out';
  }

  ngOnInit(): void {

    this.audioService.getTimeRemaining().subscribe(timeRemaining => {
      // update the time remaining of the audio in the view
      this.timeRemaining = timeRemaining;
    });

    this.audioService.getTimeElapsed().subscribe(timeElapsed => {
      // update the time remaining of the audio in the view
      this.timeElapsed = timeElapsed;
    });
    this.audioService.getPercentElapsed().subscribe(percentElapsed => {
      // update the time remaining of the audio in the view
      this.progressBarWidth = `${percentElapsed}%`;
    });
    this.audioService.getTrackName().subscribe(trackName => {
      // update the time remaining of the audio in the view
      this.trackName = trackName;
    });
    this.audioService.getArtistName().subscribe(artistName => {
      // update the time remaining of the audio in the view
      this.artistName = artistName;
    });
    this.audioService.getAlbumImageUrl().subscribe(imageUrl => {
      // update the time remaining of the audio in the view
      this.imageUrl = imageUrl;
    });
    this.audioService.getPlayerStatus().subscribe(status => {
      // update the time remaining of the audio in the view
      if(status === "playing") {
        this.middle_button_label = "Pause";  
      } else if (status === "paused") {
        this.middle_button_label = "Play";  
      } else {
        this.middle_button_label = status;
      }
      
    });
  }

  handleSoftLeftButton() {}
  handleSoftRightButton() {}
  handleCenterButton() {
    this.audioService.toggleAudio();
  }
  handleUpButton() {}
  handleDownButton() {}
  handleBackButton() {
    this.location.back();
  }
}
