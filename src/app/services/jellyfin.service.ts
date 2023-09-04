import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {catchError, map, Observable, skip, startWith, throwError} from 'rxjs';
import {Router} from '@angular/router';
import {PlaybackProgressInfo} from "./playback-progress-info";
import {BaseListItem, BaseListItemType} from "../models/list-item.model";
import {SharedService} from "./shared.service";


@Injectable({
  providedIn: 'root'
})
export class JellyfinService {

  baseURL = "https://media.boumalham.com/";
  client = "Kangunamp";
  device!: string;
  deviceId!: string;
  version = "0.0.0.1";
  headers!: HttpHeaders;
  /** LOCAL STORAGE **/
  private expirationTime = 3600000; // 1 hour in milliseconds

  constructor(private http: HttpClient, private router: Router, private sharedService : SharedService) {
    // Check if the access token is still valid when the component is initialized
    const userIdToken = localStorage.getItem('jellyfin_user_id');
    const accessToken = localStorage.getItem('jellyfin_access_token');
    //Instantiate all variables before chekcing Auth session
    this.device = sharedService.getDeviceName();
    this.deviceId = sharedService.getDeviceId();
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-MediaBrowser-Token': '',
      'X-Emby-Authorization': `MediaBrowser Client="${this.client}", Device="${this.device}", DeviceId="${this.deviceId}", Version="${this.version}"`,
      'MediaBrowser': 'Music',
      'Client': this.client,
      'Device': this.device,
      'DeviceId': this.deviceId,
      'Version': this.version
    });
    //check Auth Session else redirect to authentication.
    if (accessToken && userIdToken) {
      console.log('checking access token ')
      this.checkAuth(accessToken, userIdToken);
    } else {
      console.log('No access TOKEN!!!')
      this.router.navigate(['/auth']);
    }
  }

  getHeaders(): HttpHeaders {
    const accessToken = localStorage.getItem('jellyfin_access_token');
    if (accessToken) {
      return this.headers.set('X-MediaBrowser-Token', `${accessToken}`)
    } else return this.headers;
  }


  listArtists(): Observable<any> {
    const url = this.baseURL + "artists/albumartists";
    return this.http.get<{ Items: any[] }>(url, {
      params: this.getBaseHttpParams(),
      headers: this.getHeaders()
    }).pipe(
      map(response => response.Items),
      map((data: any[]) => data.map(item => ({
        id: item.Id,
        title: item.Name,
        subtitle: '',
        imageURL: this.getItemImageURL(item.Id),
      }))),
      catchError(error => throwError(error))
    );
  }

  listAlbums(artistId: string = "all"): Observable<BaseListItem[] | any> {
    const url = this.baseURL + "Items/?" + (artistId !== "all" ? "ArtistIds=" + artistId + "&" : "") + "Recursive=true&IncludeItemTypes=MusicAlbum";
    const additionalItem = {
      type: BaseListItemType.ARTIST,
      id: artistId,
      title: "All Artist Tracks",
      subtitle: "",
      imageURL: this.getItemImageURL(artistId, false, "Primary")
    };

    return this.http.get<{ Items: BaseListItem[] }>(url, {
      params: this.getBaseHttpParams(),
      headers: this.getHeaders()
    }).pipe(
      map(response => response.Items),
      map((data: any[]) => [
        additionalItem,
        ...data.map(item => ({
          type: BaseListItemType.ALBUM,
          id: item.Id,
          title: item.Name,
          subtitle: '',
          imageURL: this.getItemImageURL(item.Id),
        }))
      ]),
      catchError(error => throwError(error)),
      startWith([additionalItem]) // Prepend the additional item to the list
    );
  }


  listPlaylists(): Observable<any> {
    const url = this.baseURL + "Items/?Recursive=true&IncludeItemTypes=Playlist";
    return this.http.get<{ Items: any[] }>(url, {
      params: this.getBaseHttpParams(),
      headers: this.getHeaders()
    }).pipe(
      map(response => response.Items),
      map((data: any[]) => data.map(item => ({
        id: item.Id,
        title: item.Name,
        subtitle: '',
        imageURL: this.getItemImageURL(item.Id),
      }))),
      catchError(error => throwError(error))
    );
  }

  listAlbumTracks(albumtId: string): Observable<any> {
    const url = this.baseURL + "Items/?" + `ParentId=${albumtId}`;
    return this.listTracks(url)
  }

  listArtistTracks(albumArtistId: string = "all"): Observable<any> {
    const url = this.baseURL + "Items/?" + (albumArtistId === "all" ? '' : `AlbumArtistIds=${albumArtistId}`) + "&Recursive=true&IncludeItemTypes=Audio";
    return this.listTracks(url)
  }

  protected listTracks(url: string): Observable<any> {
    return this.http.get<{ Items: any[] }>(url, {
      params: this.getBaseHttpParams(),
      headers: this.getHeaders()
    }).pipe(
      map(response => response.Items),
      map((data: any[]) => data.map(item => ({
        id: item.Id,
        indexNumber: item.IndexNumber,
        title: item.Name,
        parentId: item.AlbumId,
        albumArtists: item.AlbumArtist,
        subtitle: this.formatMicrosecondsToMMSS(item.RunTimeTicks),
        album: item.Album,
        imageURL: this.getItemImageURL(item.Id, true),
        audioTrackURL: this.getTrackStream(item.Id),
        backdropImage: this.getItemImageURL(item.ParentBackdropItemId, true, "Backdrop"),
        durationInMilliseconds: item.RunTimeTicks / 10000000,
      }))),
      catchError(error => throwError(error))
    );
  }


  private formatMicrosecondsToMMSS(microseconds: number): string {
    // Convert microseconds to seconds
    const secondsTotal = Math.floor(microseconds / 10000000);

    // Calculate minutes and seconds
    const minutes = Math.floor(secondsTotal / 60);
    const seconds = secondsTotal % 60;

    // Pad seconds with a leading zero if less than 10
    const paddedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

    return `${minutes}:${paddedSeconds}`;
  }

  private getItemImageURL(itemId: string, hd: boolean = false, type: string = "Primary"): string {
    return this.baseURL + "/Items/" + itemId + "/Images/" + type + (hd ? "" : "?fillWidth=200&fillHeight=200&quality=90");
  }

  getTrackStream(trackId: string): string {
    const url = this.baseURL + `Audio/${trackId}/universal`;
    let baseParams: any= this.getBaseHttpParams();
    let streamParams :any = {
      MaxStreamingBitrate: 140000000,
      Container: 'opus,webm|opus,mp3,aac,m4a|aac,m4b|aac,flac,webma,webm|webma,wav,ogg',
      TranscodingContainer: 'ts',
      TranscodingProtocol: 'hls',
      AudioCodec: 'aac',
      StartTimeTicks: 0,
      EnableRedirection: true,
      EnableRemoteMedia: false
    };
    const params = new HttpParams({fromObject: {...baseParams, ...streamParams}});
    //append range to params so that it's compatible with safari and ios
    return url + '?' + params.toString();
  }

  /*****************************************************************************/
  /*  AUTHENTICATION
  /*****************************************************************************/

  private getBaseHttpParams() {

    return {
      "UserId": `${localStorage.getItem('jellyfin_user_id')}`,
      "api_key": `${localStorage.getItem('jellyfin_access_token')}`,
      "DeviceId": `${this.deviceId}`
    };
  }

//REGULAR USERNAME PASSWORD AUTH (not used in this app but I want to keep it)
  authenticate(username: string, password: string): Observable<any> {
    const url = this.baseURL + '/Users/authenticatebyname';
    const body = {
      Username: username,
      Pw: password,
    };
    return this.http.post(url, body, {headers: this.headers});
  }

// QUICK CONNECT
  initiateQuickConnect(): Observable<any> {
    const url = this.baseURL + '/QuickConnect/Initiate';
    return this.http.get(url, {headers: this.getHeaders()});
  }

  checkQuickConnectStatus(secret: string): Observable<any> {
    const url = this.baseURL + '/QuickConnect/Connect';
    const params = new HttpParams().set('secret', secret);
    return this.http.get(url, {params, headers: this.getHeaders()});
  }

  authenticateWithQuickConnect(secret: string): Observable<any> {
    const url = this.baseURL + '/Users/AuthenticateWithQuickConnect';
    const body = {Secret: secret};
    return this.http.post(url, body, {headers: this.getHeaders()});
  }

//Checks if token is still valid
  checkAuth(accessToken: string, userId: string) {
    const url = this.baseURL + `/Users/${userId}`;
    const headersWithtoken = this.headers.set('X-MediaBrowser-Token', `${accessToken}`);
    this.http.get(url, {headers: headersWithtoken}).subscribe(
      (response: any) => {
        console.log("token still valid")
        // The access token is still valid, do nothing
      },
      (error: any) => {
        console.error('Access token has expired or is invalid:', error);
        // Redirect to the authentication route if the access token is invalid or expired
        this.router.navigate(['/auth']);
      }
    );
  }

  /** SESSION MANAGEMENT **/

  startSessionPlayback(itemId: string, isPaused: boolean = false): void {
    //const cacheKey = `items_${albumId}`;
    //const cachedData = this.getDataFromLocalStorage(cacheKey);
    const url = this.baseURL + "/Sessions/Playing";
    const progressInfo: PlaybackProgressInfo = new PlaybackProgressInfo({
      canSeek: true,
      itemId: itemId,
      isPaused: isPaused,
      isMuted: false,
      // Set other properties as needed
    });
    this.http.post(url, progressInfo, {headers: this.getHeaders()}).subscribe(
      (response) => {
        // Handle successful response if needed
        console.log('Playback started:', response);
      },
      (error) => {
        // Handle error if needed
        console.error('Error starting playback:', error);
      }
    );
  }
    stopSessionPlayback(itemId: string): void {
    const url = this.baseURL + "/Sessions/Playing/Stopped";
    const progressInfo: PlaybackProgressInfo = new PlaybackProgressInfo({
      canSeek: true,
      itemId: itemId,
      isPaused: false,
      isMuted: false,
      // Set other properties as needed
    });
    this.http.post(url, progressInfo, {headers: this.getHeaders()}).subscribe(
      (response) => {
        // Handle successful response if needed
        console.log('Playback started:', response);
      },
      (error) => {
        // Handle error if needed
        console.error('Error starting playback:', error);
      }
    );
  }
}
