import {KeyboardHelper} from "../helpers/keyboard.helper";
import {Component, ElementRef, OnInit, AfterViewInit, ViewChild} from "@angular/core";
import {BaseListItem, BaseListItemType} from "../models/list-item.model";
import {
  aboutViewConfig,
  albumsViewConfig,
  artistsViewConfig,
  homeViewConfig,
  ListConfig,
  playlistViewConfig,
  queueTracksViewConfig,
  settingsViewConfig,
  themesViewConfig,
  tracksViewConfig
} from "./list-configurations";
import {SharedService} from "../services/shared.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AudioService} from "../services/audio.service";
import {JellyfinService} from "../services/jellyfin.service";
import {Location} from "@angular/common";

@Component({
  template: '',
})
export abstract class ItemComponent extends KeyboardHelper implements OnInit, AfterViewInit  {

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
    this.index = this.sharedService.getCurrentIndex();

    this.populateLoadingItems();
    this.route.data.subscribe((data) => {
      this.config = this.getConfig(data['type']);
      this.sharedService.setTitle(this.config.title);
    });
    this.route.queryParams.subscribe(params => {
      this.showThumbnails = params["showThumbnails"] === "true"; // Get the boolean value
    });
  }

  private populateLoadingItems() {
    let loadingItem = new BaseListItem(BaseListItemType.GENERIC, "-1", '', '', 0 == this.sharedService.getCurrentIndex(), false, '');
    this.itemList.push(loadingItem);
    for (var i = 1; i < this.sharedService.getCurrentTotalItems(); i++) {
      loadingItem = new BaseListItem(BaseListItemType.GENERIC, "-1", '', '', i == this.sharedService.getCurrentIndex(), false, '');
      this.itemList.push(loadingItem);
    }
  }
  ngAfterViewInit() {
    this.container.nativeElement.scrollTop = this.sharedService.getCurrenScroll();
  }

  ngOnInit(): void {
    const parentId = this.route.snapshot.paramMap.get('id');
    this.config.fetchList(parentId ? parentId : undefined ).then((fetchedList) => {
      fetchedList.map((fetchedItem: BaseListItem, index: number) => {
        if(index < this.itemList.length) {
          fetchedItem.selected = this.itemList[index].selected;
          this.itemList[index] = fetchedItem;
        } else this.itemList.push(fetchedItem);
      });
      this.loading = false;
      if(this.sharedService.getCurrenScroll() == 0)
      {
        this.scrollToSelected();
      }
    });
  }
  protected getConfig(type: string): ListConfig {
    switch (type) {
      case 'home':
        //dirty hack to reset the view index when going back to home
        this.sharedService.resetViewIndex();
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
      case 'playlistTracks':
        return tracksViewConfig(this.router, this.audioService, this.jellyfinService, true);
      case 'albumTracks':
        return tracksViewConfig(this.router, this.audioService, this.jellyfinService, true);
      case 'artistTracks':
        return tracksViewConfig(this.router, this.audioService, this.jellyfinService, false);
      case 'queueTracks':
        return queueTracksViewConfig(this.location, this.audioService, this.sharedService);
      default:
        throw new Error('Invalid configuration type');
    }
  }
  protected selectItem(selectedItem?: BaseListItem | undefined) {
    if(this.loading) return;
    const item = selectedItem ?  selectedItem : this.itemList[this.index];
    this.sharedService.updateViewIndexHistory({index: this.index, totalItems : this.itemList.length, scrollTop : this.container.nativeElement.scrollTop}, (item.hasChild ? {index: 0, totalItems: 0, scrollTop: 0} : undefined));
    this.config.onSelectItem(item, this.itemList);
  };
  protected nextItem() {
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

  protected mouseEnter(item: BaseListItem) {
    this.itemList[this.index].selected = false;
    item.selected = true;
    this.index = this.itemList.indexOf(item);
  }
}
