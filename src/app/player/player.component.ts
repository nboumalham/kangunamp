import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common'

import { JellyfinService } from '../services/jellyfin.service';
import { AudioService } from '../services/audio.service';
import { SharedService } from '../services/shared.service';


import {BaseListItem, TrackItem} from '../models/list-item.model';
import {KeyboardHelper} from '../helpers/keyboard.helper'
import {combineLatest, Observable} from "rxjs";

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent extends KeyboardHelper implements OnInit {

  currentTrack! : Observable<TrackItem>;

  public controlsList : BaseListItem[] = [];
  public controlsIndex = 1;


  constructor(
    private jellyfinService: JellyfinService,
    protected audioService: AudioService,
    protected sharedService : SharedService,
    protected location: Location,
    ) {
    super();
    this.currentTrack = this.audioService.getCurrentTrackObservable();
  }

  ngOnInit(): void {
    this.sharedService.setTitle("Now Playing");
    this.controlsList.push(new BaseListItem("0", "⏮", "", false, true));
    this.controlsList.push(new BaseListItem("1", "⏳︎", "", true, true));
    this.controlsList.push(new BaseListItem("2", "⏭", "", false, true));

    this.audioService.getPlaylistIndex().subscribe(playlistIndex => {
      if (playlistIndex === "1 of 1") {
        this.controlsList.splice(2, 1);
        this.controlsList.splice(0, 1);
      }
    });

    const playButton = this.controlsList.find(obj => obj.id === "1");
    if (playButton) {
      this.audioService.getPlayerStatus().subscribe(status => {
        let title = '';
        switch (status) {
          case "playing":
            title = "⏸";
            this.jellyfinService.startSessionPlayback(this.getCurrentTrackId());
            break;
          case "paused":
            title = "⏵";
            this.jellyfinService.startSessionPlayback(this.getCurrentTrackId(), true);
            break;
          case "stopped":
            title = "⏹";
            this.jellyfinService.stopSessionPlayback(this.getCurrentTrackId());
            break;
          case "loading":
            title = "⏳︎";
            break;
          default:
            title = status;
            break;
        }
        playButton.title = title;
      });
    }
  }

  // Add this method to get the current track's ID
  private getCurrentTrackId(): string {
    let currentTrackId: string = '';
    const subscription = this.audioService.getCurrentTrackObservable().subscribe(track => {
      if (track) {
        currentTrackId = track.id;
      }
    });

    return currentTrackId;
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
