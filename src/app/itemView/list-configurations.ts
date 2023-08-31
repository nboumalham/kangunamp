import {NavigationExtras, Router} from '@angular/router';
import {BaseListItem, BaseListItemType, TrackItem} from '../models/list-item.model';

import {AudioService} from '../services/audio.service';
import {JellyfinService} from '../services/jellyfin.service';
import {lastValueFrom} from "rxjs";
import {Location} from "@angular/common";
import {SharedService} from "../services/shared.service";

export interface ListConfig {
  title : string;
  fetchList: (selectedIndex?: number, parentId?: string) => Promise<BaseListItem[]>;
  onSelectItem: (item: BaseListItem, items? : BaseListItem[]) => void;
}

export const homeViewConfig = (router: Router, audioService: AudioService): ListConfig => ({
  title: "Kangunamp",

  fetchList: async (selectedIndex?: number): Promise<BaseListItem[]> => {
    const items: BaseListItem[] = [
      new BaseListItem(BaseListItemType.GENERIC, "0", "Artists", "", 0 === selectedIndex, true),
      new BaseListItem(BaseListItemType.GENERIC, "1", "Albums", "", 1 === selectedIndex, true),
      new BaseListItem(BaseListItemType.GENERIC, "2", "Playlists", "", 2 === selectedIndex, true),
      new BaseListItem(BaseListItemType.GENERIC, "3", "Settings", "", 3 === selectedIndex, true),
    ];

    audioService.getPlayerStatus().subscribe((status) => {
      if ((status !== "stopped") && (items.findIndex(item => item.title === "Now Playing") === -1)) {
          items.push(new BaseListItem(BaseListItemType.GENERIC, "4", "Now Playing", "", 4 === selectedIndex,));
      }
    });
    return items;
  },

  onSelectItem: (item: BaseListItem): void => {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        showThumbnails: (item.type != BaseListItemType.ALBUM), // Pass your boolean value here
      }
    };
    if (item.title === "Artists") {
      router.navigate(['artists'], navigationExtras);
    } else if (item.title === "Albums") {
      router.navigate(['albums'], navigationExtras);
    } else if (item.title === "Playlists") {
      router.navigate(['playlists'], navigationExtras);
    } else if (item.title === "Settings") {
      router.navigate(['settings']);
    } else if (item.title === "Now Playing") {
      router.navigate(['player']);
    }
  },
});

export const settingsViewConfig = (router: Router, jellyfinService: JellyfinService): ListConfig => ({
  title: "Settings",
  fetchList: async (selectedIndex?: number): Promise<BaseListItem[]> => {
    const items: BaseListItem[] = [];
    items.push(new BaseListItem(BaseListItemType.GENERIC, "0", "About", "", 0 === selectedIndex, true));
    //items.push(new BaseListItem(BaseListItemType.GENERIC, "1", "Themes", "Light", 1 === selectedIndex, true));
    //items.push(new BaseListItem(BaseListItemType.GENERIC, "2", "Purge local cache", "", 2 === selectedIndex, false));
    return items;
  },

  onSelectItem: (item: BaseListItem): void => {
    if (item.title === "About") {
      router.navigate(['about']);
    } else if (item.title === "Themes") {
      router.navigate(['themes']);
    } else if (item.title === "Purge local cache") {
      item.subtitle = "Done";
    }
  },
});

export const aboutViewConfig = (): ListConfig => ({
  title: "About",
  fetchList: async (selectedIndex?: number): Promise<BaseListItem[]> => {
    const items: BaseListItem[] = [];
    items.push(new BaseListItem(BaseListItemType.GENERIC, "0", "Device", "Kangunamp", true));
    items.push(new BaseListItem(BaseListItemType.GENERIC, "1", "Copyright", "© 2023 NBM", false));
    items.push(new BaseListItem(BaseListItemType.GENERIC, "2", "OS version", "0.0.0.1", false));
    items.push(new BaseListItem(BaseListItemType.GENERIC, "3", "User id", `${localStorage.getItem('jellyfin_user_id')}`, false));
    items.push(new BaseListItem(BaseListItemType.GENERIC, "4", "Access token", `${localStorage.getItem('jellyfin_access_token')}`, false));
    return items;
  },

  onSelectItem: (item: BaseListItem): void => {
  },

});
export const themesViewConfig = (): ListConfig => ({
  title: "Themes",
  fetchList: async (selectedIndex?: number): Promise<BaseListItem[]> => {
    const items: BaseListItem[] = [];
    items.push(new BaseListItem(BaseListItemType.GENERIC, "0", "Light", "",true));
    items.push(new BaseListItem(BaseListItemType.GENERIC, "1", "Dark","", false));
    items.push(new BaseListItem(BaseListItemType.GENERIC, "2", "Matrix", "", false));
    return items;
  },
  onSelectItem: (item: BaseListItem): void => {
  },
});


export const artistsViewConfig = (router: Router, audioService: AudioService, jellyfinService : JellyfinService): ListConfig => ({
  title: "Artists",
  fetchList: async (selectedIndex?: number): Promise<BaseListItem[]> => {
    try {
      const artists = await lastValueFrom(jellyfinService.listArtists());
      return artists.map((artist: BaseListItem, index: number) => {
        artist.hasChild = true;
        artist.selected = (index === selectedIndex);
        return artist;
      });
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
  fetchList: async (selectedIndex?: number, parentId?: string): Promise<BaseListItem[]> => {
    try {
      const albums : any = await lastValueFrom(jellyfinService.listAlbums(parentId));

      return albums.map((album: BaseListItem, index: number) => {
        album.hasChild = true;
        album.selected = (index === selectedIndex);
        return album;
      });
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
  fetchList: async (selectedIndex?: number, parentId?: string): Promise<BaseListItem[]> => {
    try {
      const albums =  await lastValueFrom(jellyfinService.listPlaylists());

      return albums.map((album: BaseListItem, index: number) => {
        album.hasChild = true;
        album.selected = (index === selectedIndex);
        return album;
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
  fetchList: async (selectedIndex?: number, parentId?: string): Promise<BaseListItem[]> => {
    try {
      const items: TrackItem[] = [];

      if (typeof parentId === 'string') {
        const tracks = await lastValueFrom((albumOrArtistTracks ? jellyfinService.listAlbumTracks(parentId) : jellyfinService.listArtistTracks(parentId)));
        tracks.forEach((track: TrackItem, index: number) => {
          track.selected = (index === selectedIndex);
          items.push(track);
        });
      }

      return items;
    } catch (error) {
      console.log(error);
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
      const index = items.indexOf(item);
      audioService.currentAudioIndex = index-1;
      audioService.playNextAudio();
      sharedService.popViewIndex();
      sharedService.popViewIndex();
      location.back();
    }
  }
});

