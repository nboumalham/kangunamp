import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { JellyfinService } from './services/jellyfin.service';
import {KeyboardHelper} from './helpers/keyboard.helper'
import { StoreService } from './services/store.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [{ provide: KeyboardHelper, useExisting: AppComponent }]
})
export class AppComponent extends KeyboardHelper implements AfterViewInit {
  title = 'kangunamp';
  trackSource : string = "";
  trackName : string = "";
  audio : any;
  @ViewChild('player') player: any;


  constructor(private location: Location, private jellyfinService: JellyfinService, private storeService: StoreService, private router: Router) {
    	super();
      this.storeService.playingTrackChange.subscribe( trackItem => {
    		this.trackName = trackItem.title;
    		this.trackSource = this.jellyfinService.getTrackStream(trackItem.id);
    		
    		if(this.audio !=  null)
    			{
    				this.audio.load();
    				this.audio.play();}
    	});
    }

   handleDownButton() {
  }

  handleUpButton() {
  }

  handleCenterButton() {
  }

  handleSoftRightButton() {

  }

  handleSoftLeftButton() {
    this.router.navigate(['player'])
  }

  handleBackButton() {
    this.location.back();

  }

 ngAfterViewInit() {
    this.audio = this.player.nativeElement;
  }
}