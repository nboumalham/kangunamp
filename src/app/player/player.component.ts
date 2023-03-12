import { Component, OnInit } from '@angular/core';
import { JellyfinService } from '../services/jellyfin.service';
import { StoreService } from '../services/store.service';
import {TrackItem} from '../trackList/track-item.model';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit{
	
	playingTrack : TrackItem = new TrackItem("0", "No Track Playing", "You Dick", false);

  constructor(private jellyfinService: JellyfinService, private storeService: StoreService) {
  }

  ngOnInit(): void {
    this.playingTrack = this.storeService.playingTrack;
  }
}
