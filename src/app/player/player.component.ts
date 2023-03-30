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
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent extends KeyboardHelper implements OnInit {
  playingTrack: TrackItem = new TrackItem("0", "Unknown", "Unknown", false);
  
  timeElapsed : string = "--";
  timeRemaining : string = "--";
  progressBarWidth : string = "0%";
  trackName : string = "";
  artistName : string = "";
  imageUrl : string = "";
  playlistIndex = "";

  constructor(
    private jellyfinService: JellyfinService,
    protected audioService: AudioService,
    protected sharedService : SharedService,
    protected location: Location
    ) {
    super();
  }

  ngOnInit(): void {
    this.sharedService.setTitle("Now Playing");

    this.audioService.getTimeRemaining().subscribe(timeRemaining => {
      this.timeRemaining = timeRemaining;
    });

    this.audioService.getTimeElapsed().subscribe(timeElapsed => {
      this.timeElapsed = timeElapsed;
    });
    this.audioService.getPercentElapsed().subscribe(percentElapsed => {
      this.progressBarWidth = `${percentElapsed}%`;
    });
    this.audioService.getTrackName().subscribe(trackName => {
      this.trackName = trackName;
    });
    this.audioService.getArtistName().subscribe(artistName => {
      this.artistName = artistName;
    });
    this.audioService.getAlbumImageUrl().subscribe(imageUrl => {
      this.imageUrl = imageUrl;
    });

    this.audioService.getPlaylistIndex().subscribe(playlistIndex => {
      this.playlistIndex = playlistIndex;
      if (this.playlistIndex != "1 of 1") {
        this.left_button_label = "Prev";
        this.right_button_label = "Next";
      }
    });

    this.audioService.getPlayerStatus().subscribe(status => {
      if(status === "playing") {
        this.middle_button_label = "Pause";  
      } else if (status === "paused") {
        this.middle_button_label = "Play";  
      } else {
        this.middle_button_label = status;
      }
      
    });
  }

  handleSoftLeftButton() {
    this.audioService.playPreviousAudio();
  }
  handleSoftRightButton() {
    this.audioService.playNextAudio();

  }
  handleCenterButton() {
    this.audioService.toggleAudio();
  }
  handleUpButton() {}
  handleDownButton() {}
  handleBackButton() {
    this.location.back();
  }
}
