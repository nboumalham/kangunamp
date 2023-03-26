import { Router } from '@angular/router';
import { ListItem, TrackItem } from './list-item.model';

import { AudioService } from '../services/audio.service';
import { JellyfinService } from '../services/jellyfin.service';

export interface ListConfig {
  fetchList: (selectedIndex?: number, parentId?: string) => Promise<ListItem[]>;
  onSelectItem: (item: ListItem) => void;
}

export const homeViewConfig = (router: Router, audioService: AudioService): ListConfig => ({
  fetchList: async (selectedIndex?: number): Promise<ListItem[]> => {
    const items: ListItem[] = [
      new ListItem("0", "Music", "", 0 === selectedIndex, true),
      new ListItem("1", "Settings", "", 1 === selectedIndex, true),
    ];

    audioService.getPlayerStatus().subscribe((status) => {
      if (status === "playing" || status === "paused") {
        items.push(new ListItem("2", "Now Playing", "", 2 === selectedIndex,));
      }
    });
    return items;
  },

  onSelectItem: (item: ListItem): void => {
    if (item.title === "Music") {
      router.navigate(['artists']);
    } else if (item.title === "Settings") {
      router.navigate(['settings']);
    } else if (item.title === "Now Playing") {
      router.navigate(['player']);
    }
  },
});

export const settingsViewConfig = (router: Router): ListConfig => ({
  fetchList: async (selectedIndex?: number): Promise<ListItem[]> => {
    const items: ListItem[] = [];
    items.push(new ListItem("0", "About", "", 0 === selectedIndex, true));
    items.push(new ListItem("1", "Themes", "Light", 1 === selectedIndex, true));
    return items;
  },

  onSelectItem: (item: ListItem): void => {
    if (item.title === "About") {
      router.navigate(['about']);
    } else if (item.title === "Themes") {
      router.navigate(['themes']);
    }
  },
});

export const aboutViewConfig = (): ListConfig => ({
  fetchList: async (selectedIndex?: number): Promise<ListItem[]> => {
    const items: ListItem[] = [];
    items.push(new ListItem("0", "Device", "iPod Classic", true));
    items.push(new ListItem("1", "Copyright", "© 2023 NBM", false));
    items.push(new ListItem("2", "OS version", "0.0.0.1", false));
    items.push(new ListItem("3", "User id", `${localStorage.getItem('jellyfin_user_id')}`, false));
    items.push(new ListItem("4", "Access token", `${localStorage.getItem('jellyfin_access_token')}`, false));
    return items;
  },

  onSelectItem: (item: ListItem): void => {
  },

});
export const themesViewConfig = (): ListConfig => ({
  fetchList: async (selectedIndex?: number): Promise<ListItem[]> => {
    const items: ListItem[] = [];
    items.push(new ListItem("0", "Light", "",true));
    items.push(new ListItem("1", "Dark","", false));
    items.push(new ListItem("2", "Matrix", "", false));
    return items;
  },
  onSelectItem: (item: ListItem): void => {
  },
});


export const artistsViewConfig = (router: Router, audioService: AudioService, jellyfinService : JellyfinService): ListConfig => ({
  fetchList: async (selectedIndex?: number): Promise<ListItem[]> => {
    const items: ListItem[] = [];
    jellyfinService.listArtists().subscribe(
      (artists) => {
        artists.Items.forEach((artist: any, index: number) => {
          items.push(new ListItem(artist.Id, artist.Name, "", index === selectedIndex, true));
        });
      },
      (error) => {
        console.log(error);
      },
    );
    return items;
  },

  onSelectItem: (item: ListItem): void => {
    router.navigate(['artists', item.id, 'albums']);
  },
});


export const albumsViewConfig = (router: Router, audioService: AudioService, jellyfinService : JellyfinService): ListConfig => ({
  fetchList: async (selectedIndex?: number, parentId?: string): Promise<ListItem[]> => {
    const items: ListItem[] = [];
    if (typeof(parentId) === 'string') jellyfinService.listAlbums(parentId)
    .subscribe(
      albums => {
        albums.Items.forEach((album : any, index : number) => {
          var listItem : ListItem = new ListItem(album.Id, album.Name, "", index === selectedIndex, true);
          items.push(listItem);
        });
      },
      error => {
        console.log(error);
      });
    return items;
  },

  onSelectItem: (item: ListItem): void => {
    router.navigate(['albums', item.id, 'tracks']);
  },
});



export const tracksViewConfig = (router: Router, audioService: AudioService, jellyfinService : JellyfinService): ListConfig => ({
  fetchList: async (selectedIndex?: number, parentId?: string): Promise<ListItem[]> => {
    const items: ListItem[] = [];
    if (typeof(parentId) === 'string') jellyfinService.listItems(parentId)
    .subscribe(
        tracks => {
          tracks.Items.forEach((track : any, index : number) => {
          var listItem : ListItem = new ListItem(track.Id, track.Name, track.Artists[0], (index === selectedIndex ? true : false));
          items.push(listItem);
          });
        },
        error => {
          console.log(error);
        });
    return items;
  },

  onSelectItem: (item: ListItem): void => {
    audioService.setTrackName(item.title);
    audioService.setArtistName(item.subtitle);
    audioService.setAudio(jellyfinService.getTrackStream(item.id));
    audioService.setAlbumImageUrl(jellyfinService.getTrackImageURL(item.id));
    router.navigate(['player']);
  },
});