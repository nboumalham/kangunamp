import {Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import {KeyboardHelper} from '../helpers/keyboard.helper'
import {ListItem} from '../listView/list-item.model';
import { Location } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router';

import { ListConfig, homeViewConfig, settingsViewConfig, artistsViewConfig, albumsViewConfig, tracksViewConfig, themesViewConfig, aboutViewConfig } from '../listView/list-configurations';

import { SharedService } from '../services/shared.service';
import { AudioService } from '../services/audio.service';
import { JellyfinService } from '../services/jellyfin.service';

@Component({
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss', '../../assets/themes/default.scss'],
  providers: [{ provide: KeyboardHelper, useExisting: GridComponent }]
})
export class GridComponent extends KeyboardHelper implements OnInit {

  @ViewChild('container') container!: ElementRef;
  public itemList : ListItem[] = [];
  public index = 0;
  public config! : ListConfig;

  //Grid variables to set how many items are on a line and how wide they are
  public breakpoint : number = 0;

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
    this.calculateGrid();
    this.sharedService.setTitle(this.config.title);
  }

  onResize(event: Event) {
    this.calculateGrid();
  }

  calculateGrid() {
    let size = 0;
    const width = window.innerWidth + 1;
    const height = window.innerHeight + 1;
    const ratio = width/height;
    this.breakpoint = Math.ceil(3*ratio) - 1;
    this.sharedService.setTitle("" + ratio);
  }
  selectItem(item : ListItem) {
    this.config.onSelectItem(item, this.itemList);
  };


  handleLeftButton(): void {
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

  handleRightButton(): void {

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
  handleDownButton() {
    this.playClickSound();
    // Your row selection code
    this.itemList[this.index].selected = false;
    if (this.index + this.breakpoint < this.itemList.length) {
      this.index = this.index + this.breakpoint;
    } else if (this.index == this.breakpoint) {
      this.index = 0;
    } else this.index = this.itemList.length - 1
    this.itemList[this.index].selected = true;
    this.scrollToSelected();
  }

  handleUpButton() {
    this.playClickSound();
    // Your row selection code
    this.itemList[this.index].selected = false;

    if (this.index == 0) {
      this.index = this.itemList.length-1
    } else if (this.index - this.breakpoint < 0) {
      this.index = 0;
    }
    else {
      this.index = this.index - this.breakpoint;
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

  getArtistImage(id : string) : string {
    return this.jellyfinService.getItemImageURL(id);
  }
  scrollToSelected(attempts = 5, delay = 50): void {
    if (attempts <= 0) {
      console.warn('Failed to scroll to selected item after maximum attempts');
      return;
    }

    const containerElement = this.container.nativeElement;
    const itemElements = containerElement.querySelectorAll('.grid-item');
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
    const selectedItemTop = selectedItemElement.offsetTop;
    const selectedItemBottom = selectedItemTop + itemHeight;
    const centerOffset = containerHeight / 2 - itemHeight / 2;

    if (selectedItemTop < containerScrollTop + centerOffset) {
      // Scroll to the top of the selected item centered on the screen
      containerElement.scrollTop = selectedItemTop - centerOffset;
    } else if (selectedItemBottom > containerScrollBottom - centerOffset) {
      // Scroll to the bottom of the selected item centered on the screen
      containerElement.scrollTop = selectedItemBottom - containerHeight + centerOffset;
    }
  }




  getColumnTemplate(): string {
    // Calculate the column template based on the number of columns
    return `repeat(${this.breakpoint}, 1fr)`;
  }

  getColumnWidth(): string {
    // Calculate the column template based on the number of columns
    return `${window.innerWidth/this.breakpoint}px`;
  }

}
