import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common'

import { JellyfinService } from '../services/jellyfin.service';
import { AudioService } from '../services/audio.service';
import { SharedService } from '../services/shared.service';


import { TrackItem } from '../listView/list-item.model';
import {KeyboardHelper} from '../helpers/keyboard.helper'
import {combineLatest} from "rxjs";

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent extends KeyboardHelper implements OnInit {
  timeElapsed : string = "--";
  timeRemaining : string = "--";
  progressBarWidth : string = "0%";
  trackId : string = "0";
  trackName : string = "";
  artistName : string = "";
  albumImageUrl : string = "";
  backDropImageUrl : string = "";
  defaultImageUrl : string = "../../assets/images/album.png";
  playlistIndex = "";


  constructor(
    private jellyfinService: JellyfinService,
    protected audioService: AudioService,
    protected sharedService : SharedService,
    protected location: Location,
    ) {
    super();
  }

  ngOnInit(): void {
    this.sharedService.setTitle("Now Playing");

    combineLatest([
      this.audioService.getTimeRemaining(),
      this.audioService.getTimeElapsed(),
      this.audioService.getPercentElapsed(),
      this.audioService.getTrackName(),
      this.audioService.getTrackId(),
      this.audioService.getArtistName(),
      this.audioService.getAlbumImageUrl()
    ]).subscribe(
      ([timeRemaining, timeElapsed, percentElapsed, trackName, trackId, artistName, imageUrl]) => {
        this.timeRemaining = timeRemaining;
        this.timeElapsed = timeElapsed;
        this.progressBarWidth = `${percentElapsed}%`;
        this.trackName = trackName;
        this.trackId = trackId;
        this.artistName = artistName;
        this.albumImageUrl = imageUrl;
      }
    );


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
        this.jellyfinService.startSessionPlayback(this.trackId);
      } else if (status === "paused") {
        this.middle_button_label = "Play";
        this.jellyfinService.startSessionPlayback(this.trackId, true);
      } else {
        this.middle_button_label = status;
        this.jellyfinService.stopSessionPlayback(this.trackId);
      }

    });
  }

  getImage(id : string, hd : boolean = false, type: string = "Primary") : string {
    return this.jellyfinService.getItemImageURL(id,hd,type);
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

  onImageError() {
    this.albumImageUrl = this.defaultImageUrl;
  }

  handleLeftButton(): void {
  }

  handleRightButton(): void {
  }


}
