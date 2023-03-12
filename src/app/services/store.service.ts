import { Injectable } from '@angular/core';
import {TrackItem} from '../trackList/track-item.model';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

	playing : boolean = false
	playingTrack : TrackItem = new TrackItem("0", "??", "??", false)
	
	playingTrackChange: Subject<TrackItem> = new Subject<TrackItem>();
	
	constructor() {
		this.playingTrackChange.subscribe((value) => {
            this.playingTrack = value
        });
	}

	setPlayingTrack(track : TrackItem) {
		this.playingTrackChange.next(track);
		this.playing = true;
		console.log('new track selected');
		console.log(this.playingTrack.title)
	}
}
