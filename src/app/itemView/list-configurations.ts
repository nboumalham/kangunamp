import {NavigationExtras, Router} from '@angular/router';
import {BaseListItem, BaseListItemType, TrackItem} from '../models/list-item.model';

import {AudioService} from '../services/audio.service';
import {JellyfinService} from '../services/jellyfin.service';
import {lastValueFrom} from "rxjs";
import {Location} from "@angular/common";
import {SharedService} from "../services/shared.service";

export interface ListConfig {
  title : string;
  fetchList: (parentId?: string) => Promise<BaseListItem[]>;
  onSelectItem: (item: BaseListItem, items? : BaseListItem[]) => void;
}

export const homeViewConfig = (router: Router, audioService: AudioService): ListConfig => ({
  title: "Kangunamp 0.2b",

  fetchList: async (): Promise<BaseListItem[]> => {
    const items: BaseListItem[] = [
      new BaseListItem(BaseListItemType.GENERIC, "0", "Artists", "",false,true),
      new BaseListItem(BaseListItemType.GENERIC, "1", "Albums", "",false,true),
      new BaseListItem(BaseListItemType.GENERIC, "2", "Playlists", "",false, true),
      new BaseListItem(BaseListItemType.GENERIC, "3", "Settings", "",false, true),
    ];

    audioService.getPlayerStatus().subscribe((status) => {
      if ((status !== "stopped") && (items.findIndex(item => item.title === "Now Playing") === -1)) {
          items.push(new BaseListItem(BaseListItemType.ACTION, "4", "Now Playing", "", false, true));
      }
    });
    return items;
  },

  onSelectItem: (item: BaseListItem): void => {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        showThumbnails: (item.title !== 'Settings'),
      }
    };
    if (item.title === "Artists") {
      router.navigate(['artists'], navigationExtras);
    } else if (item.title === "Albums") {
      router.navigate(['albums'], navigationExtras);
    } else if (item.title === "Playlists") {
      router.navigate(['playlists'], navigationExtras);
    } else if (item.title === "Settings") {
      router.navigate(['settings'], navigationExtras);
    } else if (item.title === "Now Playing") {
      router.navigate(['player'], navigationExtras);
    }
  },
});

export const settingsViewConfig = (router: Router, jellyfinService: JellyfinService): ListConfig => ({
  title: "Settings",
  fetchList: async (): Promise<BaseListItem[]> => {
    const items: BaseListItem[] = [];
    items.push(new BaseListItem(BaseListItemType.GENERIC, "0", "About", "", false, true));
    //items.push(new BaseListItem(BaseListItemType.GENERIC, "1", "Themes", "Light", 1 === selectedIndex, true));
    items.push(new BaseListItem(BaseListItemType.ACTION, "2", "Build cache", "", false, false));
    return items;
  },

  onSelectItem: (item: BaseListItem): void => {
    if (item.title === "About") {
      router.navigate(['about']);
    } else if (item.title === "Themes") {
      router.navigate(['themes']);
    } else if (item.title === "Build cache") {
      jellyfinService.loadDataCascade().subscribe();
      jellyfinService.dataLoadProgressSubject.subscribe((progress) => {
        item.subtitle = progress + '%';
      });
    }
  },
});

export const aboutViewConfig = (): ListConfig => ({
  title: "About",
  fetchList: async (): Promise<BaseListItem[]> => {
    const items: BaseListItem[] = [];
    items.push(new BaseListItem(BaseListItemType.ACTION, "0", "Device", "Kangunamp", false));
    items.push(new BaseListItem(BaseListItemType.ACTION, "1", "Copyright", "© 2023 NBM", false));
    items.push(new BaseListItem(BaseListItemType.ACTION, "2", "OS version", "0.0.0.1", false));
    items.push(new BaseListItem(BaseListItemType.ACTION, "3", "User id", `${localStorage.getItem('jellyfin_user_id')}`, false));
    items.push(new BaseListItem(BaseListItemType.ACTION, "4", "Access token", `${localStorage.getItem('jellyfin_access_token')}`, false));
    return items;
  },

  onSelectItem: (item: BaseListItem): void => {
  },

});
export const themesViewConfig = (): ListConfig => ({
  title: "Themes",
  fetchList: async (): Promise<BaseListItem[]> => {
    const items: BaseListItem[] = [];
    items.push(new BaseListItem(BaseListItemType.ACTION, "0", "Light", "",true));
    items.push(new BaseListItem(BaseListItemType.ACTION, "1", "Dark","", false));
    items.push(new BaseListItem(BaseListItemType.ACTION, "2", "Matrix", "", false));
    return items;
  },
  onSelectItem: (item: BaseListItem): void => {
  },
});


export const artistsViewConfig = (router: Router, audioService: AudioService, jellyfinService : JellyfinService): ListConfig => ({
  title: "Artists",
  fetchList: async (): Promise<BaseListItem[]> => {
    try {
      return await lastValueFrom(jellyfinService.listArtists());
    } catch (error) {
      console.log(error);
      return []; // Return an empty array in case of an error
    }
  },


  onSelectItem: (item: BaseListItem): void => {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        showThumbnails: (item.type != BaseListItemType.ALBUM), // Pass your boolean value here
      }
    };
    router.navigate(['artists', item.id, 'albums'], navigationExtras);
  },
});
export const albumsViewConfig = (router: Router, audioService: AudioService, jellyfinService : JellyfinService): ListConfig => ({
  title: "Albums",
  fetchList: async (parentId?: string): Promise<BaseListItem[]> => {
    try {
      return await lastValueFrom(jellyfinService.listAlbums(parentId));
    } catch (error) {
      console.log(error);
      return []; // Return an empty array in case of an error
    }
  },

  onSelectItem: (item: BaseListItem): void => {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        showThumbnails: (item.type != BaseListItemType.ALBUM), // Pass your boolean value here
      }
    };
    router.navigate([(item.type == BaseListItemType.ALBUM ? 'albums' : 'artists'), item.id, 'tracks'], navigationExtras);
  },
});
export const playlistViewConfig = (router: Router, audioService: AudioService, jellyfinService : JellyfinService): ListConfig => ({
  title: "Playlists",
  fetchList: async (parentId?: string): Promise<BaseListItem[]> => {
    try {
      const playlists =  await lastValueFrom(jellyfinService.listPlaylists());

      return playlists.map((playlist: BaseListItem, index: number) => {
        playlist.hasChild = true;
        return playlist;
      });
    } catch (error) {
      console.log(error);
      return []; // Return an empty array in case of an error
    }
  },

  onSelectItem: (item: BaseListItem): void => {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        showThumbnails: true, // Pass your boolean value here
      }
    };
    router.navigate(['playlists', item.id, 'tracks'], navigationExtras);
  },
});
export const tracksViewConfig = (router: Router, audioService: AudioService, jellyfinService : JellyfinService, albumOrArtistTracks : boolean = true): ListConfig => ({
  title: "Songs",
  fetchList: async (parentId?: string): Promise<BaseListItem[]> => {
    try {
      const items: TrackItem[] = [];

      if (typeof parentId === 'string') {
        const tracks = await lastValueFrom((albumOrArtistTracks ? jellyfinService.listAlbumTracks(parentId) : jellyfinService.listArtistTracks(parentId)));
        tracks.forEach((track: TrackItem, index: number) => {
          track.hasChild = true;
          items.push(track);
        });
      }

      return items;
    } catch (error) {
      console.error(error);
      return []; // Return an empty array in case of an error
    }
  },

  onSelectItem(item: BaseListItem, items?: BaseListItem[]): void {
      const trackItem = item as TrackItem;
      if (items) {
        const startIndex = items.indexOf(item);
        if (startIndex !== -1) {
          const tracksToPlay = items as TrackItem[];
          audioService.setAudioQueue(tracksToPlay, startIndex);
        }
      }
      router.navigate(['player']);
  }
});

export const queueTracksViewConfig = (location: Location, audioService: AudioService, sharedService : SharedService): ListConfig => ({
  title: "Queue",
  fetchList: async (): Promise<BaseListItem[]> => {
    try {
      const items: TrackItem[] = audioService.getAudioQueue();
      items.forEach((track: TrackItem, index: number) => {
        //Workaround so that the track doens't add a new navigation stack when selected.
        track.hasChild = false;
        track.type = BaseListItemType.QUEUE_TRACK;
        track.selected = (index === audioService.currentAudioIndex);
      });
      return items;
    } catch (error) {
      console.log(error);
      return []; // Return an empty array in case of an error
    }
  },

  onSelectItem(item: BaseListItem, items?: BaseListItem[]): void {
    const trackItem = item as TrackItem;
    if (items) {
      sharedService.popViewIndex();
      const index = items.indexOf(item);
      audioService.currentAudioIndex = index-1;
      audioService.playNextAudio();
      location.back();
    }
  }
});


