import {KeyboardHelper} from "../helpers/keyboard.helper";
import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {BaseListItem} from "../models/list-item.model";
import {
  aboutViewConfig, albumsViewConfig,
  artistsViewConfig,
  homeViewConfig,
  ListConfig, playlistViewConfig,
  settingsViewConfig,
  themesViewConfig, tracksViewConfig
} from "./list-configurations";
import {SharedService} from "../services/shared.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AudioService} from "../services/audio.service";
import {JellyfinService} from "../services/jellyfin.service";
import {Location} from "@angular/common";

@Component({
  template: '',
})
export abstract class ItemComponent extends KeyboardHelper implements OnInit {

  @ViewChild('container') container!: ElementRef;
  public itemList : BaseListItem[] = [];
  public index = 0;
  public config! : ListConfig;
  public showThumbnails : boolean = false;
  public loading : boolean = true;

  constructor(protected router: Router,
              protected sharedService: SharedService,
              protected audioService: AudioService,
              protected jellyfinService : JellyfinService,
              protected route: ActivatedRoute,
              protected location: Location) {
    super();
    this.route.data.subscribe((data) => {
      this.config = this.getConfig(data['type']);
    });
    this.route.queryParams.subscribe(params => {
      this.showThumbnails = params["showThumbnails"] === "true"; // Get the boolean value
    });
  }
  ngOnInit(): void {
    const parentId = this.route.snapshot.paramMap.get('id');
    this.index = this.sharedService.getCurrentIndex();
    this.config.fetchList(this.index, parentId ? parentId : undefined ).then((fetchedList) => {
      this.itemList = fetchedList;
      this.scrollToSelected();
      this.loading = false;
    });
    this.sharedService.setTitle(this.config.title);
  }

  public onImageLoad(event: Event) {
    const target = event.target as HTMLImageElement;
    target.classList.add('loaded');
  }

  protected getConfig(type: string): ListConfig {
    switch (type) {
      case 'home':
        return homeViewConfig(this.router, this.audioService);
      case 'settings':
        return settingsViewConfig(this.router, this.jellyfinService);
      case 'about':
        return aboutViewConfig();
      case 'themes':
        return themesViewConfig();
      case 'artists':
        return artistsViewConfig(this.router, this.audioService, this.jellyfinService);
      case 'playlists':
        return playlistViewConfig(this.router, this.audioService, this.jellyfinService);
      case 'albums':
        return albumsViewConfig(this.router, this.audioService, this.jellyfinService);
      case 'tracks':
        return tracksViewConfig(this.router, this.audioService, this.jellyfinService);
      default:
        throw new Error('Invalid configuration type');
    }
  }
  protected selectItem() {
    const item = this.itemList[this.index];
    this.sharedService.updateViewIndex(this.index, item.hasChild);
    this.config.onSelectItem(item, this.itemList);
  };
  protected nextItem() {
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
  protected previousItem() {
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
  protected navigateBack() {
      if (this.sharedService.getStackSize() > 1) {
        this.sharedService.popViewIndex();
        this.location.back();
      }
    }



  /** abstract methods */
  abstract scrollToSelected(): void;
}
