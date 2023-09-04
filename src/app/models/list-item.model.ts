import {Track} from "../services/db";

export interface BaseItem {
  id: string;
  title: string;
  subtitle: string;
}

export enum BaseListItemType {
  GENERIC,
  ARTIST,
  ALBUM,
  PLAYLIST,
  TRACK
}

export class BaseListItem implements BaseItem {
	public id: string;
	public title: string;
	public subtitle: string;
  public imageURL : string = "";
  public selected : boolean;
	public hasChild : boolean = false;
  public type : BaseListItemType;

  	constructor(type: BaseListItemType = BaseListItemType.GENERIC, id: string, title: string, subtitle: string, selected : boolean = false, hasChild : boolean = false, imageURL? : string) {
    	this.type = type;
      this.id = id;
    	this.title = title;
	    this.subtitle = subtitle;
    	this.selected = selected;
      this.hasChild = hasChild;
      this.imageURL = imageURL ? imageURL : "";
  }
}

export class TrackItem extends BaseListItem implements Track {
  public indexNumber : number = 0;
  public albumArtists : string = "--";
  public album : string = "--";
  public backdropImage : string = "";
  public playing : boolean = false;
  public audioTrackURL : string = "";
  public parentId : string = "";
  public durationInMilliseconds : number = 0;

  constructor(id: string, title: string, subtitle: string, selected: boolean, hasChild: boolean, albumArtists: string, album: string, backdropImage: string, playing: boolean, audioTrackURL: string, parentId: string, durationInMilliseconds: number, indexNumber: number = 0) {
    super(BaseListItemType.TRACK, id, title, subtitle, selected, hasChild);
    this.albumArtists = albumArtists;
    this.album = album;
    this.backdropImage = backdropImage;
    this.playing = playing;
    this.audioTrackURL = audioTrackURL;
    this.parentId = parentId;
    this.durationInMilliseconds = durationInMilliseconds;
    this.indexNumber = indexNumber;
  }
}
