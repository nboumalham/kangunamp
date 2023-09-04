// db.ts
import Dexie, { Table } from 'dexie';
import {BaseItem} from "../models/list-item.model";
import {Timestamp} from "rxjs";

export interface Artist extends BaseItem{
  id: string;
  title: string;
  subtitle: string;
  serverOrder?: number;
}

export interface Playlist extends BaseItem{
  id: string;
  title: string;
  subtitle: string;
  serverOrder?: number;
}

export interface Album extends BaseItem{
  id: string;
  parentId: string;
  albumArtistsId: string[];
  title: string;
  subtitle: string;
  serverOrder?: number;
}

export interface Track extends BaseItem{
  id: string;
  parentId: string;
  title: string;
  subtitle: string;
  serverOrder?: number;
  albumArtists : string;
  album : string;
  imageURL : string;
  backdropImage : string;
  audioTrackURL : string;
}
export class AppDB extends Dexie {
  artists!: Table<Artist, string>;
  playlists!: Table<Playlist, string>;
  albums!: Table<Album, string>; // Add this line
  tracks!: Table<Track, string>;  // Add this line

  constructor() {
    super('ngdexieliveQuery');
    this.version(1).stores({
      artists: 'id, title, serverOrder',
      playlists: 'id, title, serverOrder',
      albums: 'id, title, parentId, albumArtistsId, serverOrder',
      tracks: 'id, title, parentId, serverOrder',
    });
  }
}

export const db = new AppDB();
