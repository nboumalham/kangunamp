import { Component, OnInit } from '@angular/core';
import { JellyfinService } from '../services/jellyfin.service';
import { StoreService } from '../services/store.service';
import { TrackItem } from '../trackList/track-item.model';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {
  playingTrack: TrackItem = new TrackItem("0", "Unknown", "Unknown", false);

  constructor(
    private jellyfinService: JellyfinService,
    private storeService: StoreService
  ) {}

  formatTime(time: number): string {
  const minutes: number = Math.floor(time / 60);
  const seconds: number = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}


  ngOnInit(): void {
    this.playingTrack = this.storeService.playingTrack;
  }
}
