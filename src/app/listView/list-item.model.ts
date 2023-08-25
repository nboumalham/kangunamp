export class ListItem {
	public id: string;
	public title: string;
	public subtitle: string;
	public selected : boolean;
	public hasChild : boolean = false;

  	constructor(id: string, title: string, subtitle: string, selected : boolean, hasChild? : boolean) {
    	this.id = id;
    	this.title = title;
	    this.subtitle = subtitle;
    	this.selected = selected;
    	if (hasChild != undefined) {
    		this.hasChild = hasChild;
    	}
  }
}


export class TrackItem extends ListItem {

  public trackImageURL : string = "https://cdn.iconscout.com/icon/premium/png-512-thumb/question-mark-4397530-3644875.png?f=avif&w=256";
  public artistName : string = "--";
  public albumName : string = "--";
  public progressBarWidth = '0%';
  public currentTime : number  = 0;
  public duration : number = 0;
  public playing : boolean = false;
  public audioUrl : string = "";
  public parentId : string = "";

    constructor(id: string, title: string, subtitle: string, selected : boolean, artistName? : string, albumName? : string, trackImageURL? : string, audioUrl? : string, parentId? : string) {
      super(id, title, subtitle, selected);

      if (typeof trackImageURL !== 'undefined') {
        this.trackImageURL = trackImageURL;
      }
      if (typeof albumName !== 'undefined') {
        this.albumName = albumName;
      }
      if (typeof artistName !== 'undefined') {
        this.artistName = artistName;
      }
      if (typeof audioUrl !== 'undefined') {
        this.audioUrl = audioUrl;
      }
      if (typeof parentId !== 'undefined') {
        this.parentId = parentId;
      }
  }
}
