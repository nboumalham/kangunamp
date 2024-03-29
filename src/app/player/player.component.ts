import {Component, OnInit} from '@angular/core';
import {Location} from '@angular/common'

import {JellyfinService} from '../services/jellyfin.service';
import {AudioService} from '../services/audio.service';
import {DeviceType, SharedService} from '../services/shared.service';

import {BaseListItem, BaseListItemType, TrackItem} from '../models/list-item.model';
import {KeyboardHelper} from '../helpers/keyboard.helper'
import {Observable} from "rxjs";
import {Router} from "@angular/router";

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
})
export class PlayerComponent extends KeyboardHelper implements OnInit {

  currentTrack! : Observable<TrackItem>;

  public focusedElement: 'controls' | 'progress' = 'controls';
  public controlsList : BaseListItem[] = [];
  public controlsIndex = 2;


  constructor(
    private jellyfinService: JellyfinService,
    protected audioService: AudioService,
    protected sharedService : SharedService,
    protected location: Location,
    protected router: Router
    ) {
    super();
    this.currentTrack = this.audioService.getCurrentTrackObservable();
  }
  ngOnInit(): void {
    this.sharedService.setTitle("Now Playing");
    this.controlsList.push(new BaseListItem(BaseListItemType.GENERIC, "0", "queue", "icon-list", 0 == this.controlsIndex, true));
    this.controlsList.push(new BaseListItem(BaseListItemType.GENERIC, "1", "previous", "icon-previous", 1 == this.controlsIndex, true));
    this.controlsList.push(new BaseListItem(BaseListItemType.GENERIC,"2", "play-pause", "icon-spinner staggered-spin", 2 == this.controlsIndex, true));
    this.controlsList.push(new BaseListItem(BaseListItemType.GENERIC,"3", "next", "icon-next", 3 == this.controlsIndex, true));
    this.controlsList.push(new BaseListItem(BaseListItemType.GENERIC,"4", "shuffle", "icon-shuffle" + (this.audioService.shuffle ? " toggled" : ""), 4 == this.controlsIndex, true));


    this.audioService.getPlaylistIndex().subscribe(playlistIndex => {
      if (playlistIndex === "1 of 1") {
        this.controlsList.splice(0, 2);
        this.controlsList.splice(1, 2);
      }
    });

    const playButton = this.controlsList.find(obj => obj.id === "2");
    if (playButton) {
      this.audioService.getPlayerStatus().subscribe(status => {
        let subtitle = '';
        switch (status) {
          case "playing":
            subtitle = "icon-pause";
            this.jellyfinService.startSessionPlayback(this.getCurrentTrackId());
            break;
          case "paused":
            subtitle = "icon-play";
            this.jellyfinService.startSessionPlayback(this.getCurrentTrackId(), true);
            break;
          case "stopped":
            subtitle = "icon-stop";
            this.jellyfinService.stopSessionPlayback(this.getCurrentTrackId());
            break;
          case "loading":
            subtitle = "icon-spinner staggered-spin";
            break;
          default:
            subtitle = "icon-spinner";
            break;
        }
        playButton.subtitle = subtitle;
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
    if(this.focusedElement === 'controls') {
      switch (this.controlsIndex) {
        case 0 :
          this.sharedService.updateViewIndexHistory({index: this.controlsIndex, totalItems : this.controlsList.length, scrollTop : 0}, {index: this.audioService.currentAudioIndex, totalItems: this.audioService.audioQueue.length, scrollTop: 0} )
          this.router.navigate(['/queue']);
          return;
        case 1 :
          this.audioService.playPreviousAudio();
          return;
        case 2 :
          this.audioService.toggleAudio();
          return;
        case 3 :
          this.audioService.playNextAudio();
          return;
        case 4 :
          this.audioService.toggleShuffle()
          this.controlsList[this.controlsIndex].subtitle = "icon-shuffle " + (this.audioService.shuffle ? "toggled" : "");
        }
      }
  }
  handleUpButton() {
    this.toggleFocus();
  }
  handleDownButton() {
    this.toggleFocus();
  }
  handleBackButton() {
    if (this.sharedService.getStackSize() > 1) {
      this.sharedService.popViewIndex();
      this.location.back();
    }
  }
  handleRightButton() {
    if(this.focusedElement === 'progress') {
      this.audioService.seekAudioForward();
    } else {
    // Your row selection code
    this.controlsList[this.controlsIndex].selected = false;
    if (this.controlsIndex+1 < this.controlsList.length) {
      this.controlsIndex++
    } else {
      this.controlsIndex = 0;
    }
    this.controlsList[this.controlsIndex].selected = true;
    }
  }
  handleLeftButton() {
    if(this.focusedElement === 'progress') {
      this.audioService.seekAudioBackwards();
    } else {
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

  clickItem(item: BaseListItem) {
    this.controlsList[this.controlsIndex].selected = false;
    this.controlsIndex = this.controlsList.indexOf(item);
    this.controlsList[this.controlsIndex].selected = true;
    this.handleCenterButton();
  }

  onDragEnd(event: any) {
    const percentageDragged = event.detail.percentage;
    // Call your method with the percentage dragged from X = 0
    this.audioService.seekAudioPercent(percentageDragged);
  }

  onProgressClick(event: MouseEvent) {
    // Check if the circle-handle is currently being dragged
      // Calculate the percentage based on the click position relative to the progress-container
      const progressContainer = document.querySelector('.progress-container');
      if (progressContainer) {
        const clickX = event.clientX - progressContainer.getBoundingClientRect().left;
        const containerWidth = progressContainer.clientWidth;
        const percentage = (clickX / containerWidth) * 100;

        // Call your seek method with the calculated percentage
        this.audioService.seekAudioPercent(percentage);
      }

  }

  protected toggleFocus(option? : "controls" | "progress") {
    if(option) this.focusedElement = option;
    else this.focusedElement = this.focusedElement === 'controls' ? 'progress' : 'controls';
  }


  protected readonly DeviceType = DeviceType;
}
