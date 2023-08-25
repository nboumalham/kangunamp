import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common'

import { JellyfinService } from '../services/jellyfin.service';
import { AudioService } from '../services/audio.service';
import { SharedService } from '../services/shared.service';


import {ListItem, TrackItem} from '../listView/list-item.model';
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
  parentId : string = "";
  trackName : string = "";
  artistName : string = "";
  albumImageUrl : string = "";
  backDropImageUrl : string = "";
  defaultImageUrl : string = "../../assets/images/album.png";
  playlistIndex = "";


  public controlsList : ListItem[] = [];
  public controlsIndex = 1;


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
    this.controlsList.push(new ListItem("0", "⏮", "", false, true));
    this.controlsList.push(new ListItem("1", "⏳︎", "", true, true));
    this.controlsList.push(new ListItem("2", "⏭", "", false, true));

    combineLatest([
      this.audioService.getTimeRemaining(),
      this.audioService.getTimeElapsed(),
      this.audioService.getPercentElapsed(),
      this.audioService.getTrackName(),
      this.audioService.getTrackId(),
      this.audioService.getParentId(),
      this.audioService.getArtistName(),
      this.audioService.getAlbumImageUrl()
    ]).subscribe(
      ([timeRemaining, timeElapsed, percentElapsed, trackName, trackId, parentId, artistName, imageUrl]) => {
        this.timeRemaining = timeRemaining;
        this.timeElapsed = timeElapsed;
        this.progressBarWidth = `${percentElapsed}%`;
        this.trackName = trackName;
        this.trackId = trackId;
        this.artistName = artistName;
        this.albumImageUrl = imageUrl;
        this.parentId = parentId;
      }
    );


    this.audioService.getPlaylistIndex().subscribe(playlistIndex => {
      this.playlistIndex = playlistIndex;
      if (this.playlistIndex == "1 of 1") {
        this.controlsList.splice(2, 1);
        this.controlsList.splice(0, 1);
      }
    });

    this.audioService.getPlayerStatus().subscribe(status => {
      let playButton = this.controlsList.find(obj => obj.id === "1");
      if (playButton) {
      if(status === "playing") {
        playButton.title = "⏸";
        this.jellyfinService.startSessionPlayback(this.trackId);
      } else if (status === "paused") {
        playButton.title = "⏵";
        this.jellyfinService.startSessionPlayback(this.trackId, true);
      } else if (status === "stopped") {
        playButton.title = "⏹";
        this.jellyfinService.stopSessionPlayback(this.trackId);
      } else if (status === "loading") {
        playButton.title = "⏳︎";
        this.jellyfinService.stopSessionPlayback(this.trackId);
      } else {
        playButton.title = status;
        this.jellyfinService.stopSessionPlayback(this.trackId);
      }
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
    switch (this.controlsIndex) {
      case 0 :
        this.audioService.playPreviousAudio();
        return;
      case 1 :
        this.audioService.toggleAudio();
        return;
      case 2 :
        this.audioService.playNextAudio();
        return;
    }
  }
  handleUpButton() {}
  handleDownButton() {}
  handleBackButton() {
    this.location.back();
  }

  onImageError() {
    this.albumImageUrl = this.defaultImageUrl;
  }

  handleRightButton() {
    this.playClickSound();
    // Your row selection code
    this.controlsList[this.controlsIndex].selected = false;
    if (this.controlsIndex+1 < this.controlsList.length) {
      this.controlsIndex++
    } else {
      this.controlsIndex = 0;
    }
    this.controlsList[this.controlsIndex].selected = true;
  }

  handleLeftButton() {
    this.playClickSound();
    // Your row selection code
    this.controlsList[this.controlsIndex].selected = false;

    if (this.controlsIndex == 0) {
      this.controlsIndex = this.controlsList.length-1
    } else {
      this.controlsIndex--;
    }
    this.controlsList[this.controlsIndex].selected = true;
  }


}
