import {Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import {KeyboardHelper} from '../helpers/keyboard.helper'
import {ListItem} from './list-item.model';
import { Location } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router';

import { ListConfig, homeViewConfig, settingsViewConfig, artistsViewConfig, albumsViewConfig, tracksViewConfig, themesViewConfig, aboutViewConfig } from './list-configurations';

import { SharedService } from '../services/shared.service';
import { AudioService } from '../services/audio.service';
import { JellyfinService } from '../services/jellyfin.service';

@Component({
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss', '../../assets/themes/default.scss'],
  providers: [{ provide: KeyboardHelper, useExisting: ListComponent }]
})
export class ListComponent extends KeyboardHelper implements OnInit {

  @ViewChild('container') container!: ElementRef;
  public itemList : ListItem[] = [];
  public index = 0;
  public config! : ListConfig;

  //handling UI sounds
  clickSoundPath = "../../assets/sounds/click.mp3";
  debounceTimeout : any;

  constructor(protected router: Router,
    protected sharedService: SharedService,
    protected audioService: AudioService,
    protected jellyfinService : JellyfinService,
    protected route: ActivatedRoute,
    protected location: Location) {
    super();
    this.left_button_label = "Player";
    this.route.data.subscribe((data) => {
      this.config = this.getConfig(data['type']);
      // ... other actions based on config
    });
  }

  getConfig(type: string): ListConfig {
    switch (type) {
      case 'home':
      return homeViewConfig(this.router, this.audioService);
      case 'settings':
      return settingsViewConfig(this.router);
      case 'about':
      return aboutViewConfig();
      case 'themes':
      return themesViewConfig();
      case 'artists':
      return artistsViewConfig(this.router, this.audioService, this.jellyfinService);
      case 'albums':
      return albumsViewConfig(this.router, this.audioService, this.jellyfinService);
      case 'tracks':
      return tracksViewConfig(this.router, this.audioService, this.jellyfinService);
      default:
      throw new Error('Invalid configuration type');
    }
  }

  
  ngOnInit(): void {
    const parentId = this.route.snapshot.paramMap.get('id');
    this.index = this.sharedService.getCurrentIndex();
    this.itemList.push(new ListItem("0", "Loading...","", true));
    this.config.fetchList(this.index, parentId ? parentId : undefined ).then((fetchedList) => {
      this.itemList = fetchedList;
      this.scrollToSelected();
    });
    this.sharedService.setTitle(this.config.title);
  }
  
  selectItem(item : ListItem) {
    this.config.onSelectItem(item, this.itemList);
  };

  handleDownButton() {
    this.playClickSound();
    // Your row selection code
    this.itemList[this.index].selected = false;
    if (this.index+1 < this.itemList.length) {
      this.index++
    } else {
      this.index = 0;
    }
    this.itemList[this.index].selected = true;
    this.scrollToSelected();
  }

  lastPlayTime = 0;

  playClickSound() {
    const currentTime = new Date().getTime();
    const timeSinceLastPlay = currentTime - this.lastPlayTime;
  
    const audio = new Audio(this.clickSoundPath);
  
    if (timeSinceLastPlay < 100) { // 200 milliseconds threshold, adjust as needed
      audio.volume = 0.2; // Lower volume (adjust as needed)
    } else {
      audio.volume = 0.4; // Full volume
    }
  
    this.lastPlayTime = currentTime;
    audio.play();
  }
  
  

  handleUpButton() {
    this.playClickSound();
    // Your row selection code
    this.itemList[this.index].selected = false;

    if (this.index == 0) {
      this.index = this.itemList.length-1
    } else {
      this.index--;
    }
    this.itemList[this.index].selected = true;
    this.scrollToSelected();
  }

  handleCenterButton() {
    const item = this.itemList[this.index];
    this.sharedService.updateViewIndex(this.index, item.hasChild);
    this.selectItem(this.itemList[this.index]);
  }

  handleSoftRightButton() {
  }

  handleSoftLeftButton() {
    this.router.navigate(['player']);
  }

  handleBackButton() {
    if (this.sharedService.getStackSize() > 1) {
      this.sharedService.popViewIndex();
      this.location.back();
    }
  }

  scrollToSelected(attempts = 5, delay = 50): void {
    if (attempts <= 0) {
      console.warn('Failed to scroll to selected item after maximum attempts');
      return;
    }

    const containerElement = this.container.nativeElement;
    const itemElements = containerElement.querySelectorAll('.list-item');
    const selectedItemElement = itemElements[this.index];

    if (!selectedItemElement) {
      setTimeout(() => {
        this.scrollToSelected(attempts - 1, delay);
      }, delay);
      return;
    }

    const itemHeight = selectedItemElement.offsetHeight;
    const containerHeight = containerElement.offsetHeight;
    const containerScrollTop = containerElement.scrollTop;
    const containerScrollBottom = containerScrollTop + containerHeight;
    const selectedItemTop = selectedItemElement.offsetTop - itemHeight; //- itemHeight is supposed to subtract the height of the header. So always make sure the header is equal in height to the item
    const selectedItemBottom = selectedItemTop + itemHeight;

    if (selectedItemTop < containerScrollTop) {
      containerElement.scrollTop = selectedItemTop;
    } else if (selectedItemBottom > containerScrollBottom) {
      containerElement.scrollTop = selectedItemBottom - containerHeight;
    }
  }

}