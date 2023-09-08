import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {catchError, forkJoin, map, Observable, skip, startWith, Subject, switchMap, tap, throwError} from 'rxjs';
import {Router} from '@angular/router';
import {PlaybackProgressInfo} from "./playback-progress-info";
import {BaseListItem, BaseListItemType, TrackItem} from "../models/list-item.model";
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

  // Cache for storing responses
  private cache: { [key: string]: Observable<any> } = {};

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
      this.checkAuth(accessToken, userIdToken);
    } else {
      this.router.navigate(['/auth']);
    }
  }

  private _getHeaders(): HttpHeaders {
    const accessToken = localStorage.getItem('jellyfin_access_token');
    if (accessToken) {
      return this.headers.set('X-MediaBrowser-Token', `${accessToken}`)
    } else return this.headers;
  }
  // Generic method to get data with caching
  private _getWithCache(url: string, params: HttpParams = new HttpParams()): Observable<any> {
    // Create a key that includes both the URL and the serialized parameters
    const cacheKey = `${url}?${params.toString()}`;

    // Check if the response is cached
    if (this.cache[cacheKey]) {
      console.debug(`Returning cached response for ${url}`);
      return this.cache[cacheKey];
    }

    // If not cached, fetch the data and cache the response
    const request = this.http.get(url, {
      params: params.appendAll(this.getBaseHttpParams()),
      headers: this._getHeaders(),
    }).pipe(
      map((response: any) => {
        // Cache the response using the cacheKey
        this.cache[cacheKey] = new Observable<any>((observer) => {
          observer.next(response);
          observer.complete();
        });
        return response;
      }),
      catchError((error) => {
        // Remove the cached response on error
        delete this.cache[cacheKey];
        return throwError(error);
      })
    );

    // Store the request in the cache using the cacheKey
    this.cache[cacheKey] = request;

    return request;
  }
  public listItems(paramOptions: {itemType? : string, parentId? : string, albumArtistIds? : string, sortBy? : string, sortOrder? : string}, type : string = 'baseItem'): Observable<BaseListItem[] | any> {
    const url = this.baseURL + 'Items/';
    let params = new HttpParams()
      .set('Recursive', 'true')
    //add optional params
    if(paramOptions.itemType) params = params.set('IncludeItemTypes', paramOptions.itemType);
    if(paramOptions.parentId) params = params.set('ParentId', paramOptions.parentId);
    if(paramOptions.albumArtistIds) params = params.set('AlbumArtistIds', paramOptions.albumArtistIds);
    if(paramOptions.sortBy) params = params.set('SortBy', paramOptions.sortBy);
    if(paramOptions.sortOrder) params = params.set('SortOrder', paramOptions.sortOrder);

    return this._getWithCache(url, params).pipe(
      map(response => response.Items),
      //fix this so that it checks the type of the item and returns the correct type of item
      map((data: any[]) => data.map((item) => {
          switch (type) {
            case 'track':
              return this.toTrackItem(item);
            default:
              return {
                type: BaseListItemType.GENERIC,
                id: item.Id,
                title: item.Name,
                subtitle: item.ProductionYear,
                imageURL: this.getItemImageURL(item.Id),};
            }
        }
      )));
  }
  public listArtists(): Observable<BaseListItem[] | any> {
   const artists = this.listItems({itemType: "MusicArtist", sortBy: "SortName", sortOrder: "Ascending"});
   //modify each item in the list to add the artist type and hasChild
    return artists.pipe(
      map((data: any[]) => data.map((item) => {
        item.type = BaseListItemType.ARTIST;
        item.hasChild = true;
        return item;
      }))
    );
  }
  public listAlbums(artistId? : string): Observable<BaseListItem[] | any> {
    const albums = this.listItems( {itemType: "MusicAlbum", parentId : artistId, sortBy: "PremiereDate,ProductionYear,Sortname", sortOrder: "Descending"});

    //add an additional item to the list to allow for all artist tracks
    const additionalItem = {
      type: BaseListItemType.ARTIST,
      id: artistId,
      title: "All Artist Tracks",
      subtitle: "",
    };

    //modify each item in the list to add the album type and hasChild
    return albums.pipe(
      map((data: any[]) => [additionalItem, ...data.map((item) => {
        item.type = BaseListItemType.ALBUM;
        item.hasChild = true;
        return item;
      })])
    );
  }
  public listPlaylists(): Observable<BaseListItem[] | any> {
    const playlists = this.listItems( {itemType: "Playlist", sortBy: "Sortname", sortOrder: "Ascending"});
    //modify each item in the list to add the playlist type and hasChild
    return playlists.pipe(
      map((data: BaseListItem[]) => data.map((item) => {
        item.type = BaseListItemType.PLAYLIST;
        item.hasChild = true;
        return item;
      }))
    );
  }
  public listAlbumTracks(albumId : string): Observable<TrackItem[] | any> {
    const playlists = this.listItems( {itemType: "Audio", parentId: albumId, sortBy: "ParentIndexNumber,IndexNumber,SortName"}, 'track');
    //modify each item in the list to add the playlist type and hasChild
    return playlists.pipe(
      map((data: BaseListItem[]) => data.map((item) => {
        item.type = BaseListItemType.TRACK;
        item.hasChild = false;
        return item;
      }))
    );
  }
  public listArtistTracks(artistId : string): Observable<TrackItem[] | any> {
    const playlists = this.listItems( {itemType: "Audio", albumArtistIds: artistId, sortBy: "IndexNumber,SortName"}, "track");
    //modify each item in the list to add the playlist type and hasChild
    return playlists.pipe(
      map((data: BaseListItem[]) => data.map((item) => {
        item.type = BaseListItemType.TRACK;
        item.hasChild = false;
        return item;
      }))
    );
  }
  private toTrackItem(item: any): TrackItem {
      const track = {
        type: BaseListItemType.TRACK,
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
        durationInMilliseconds: item.RunTimeTicks / 10000000};
      return track as TrackItem;
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
  private getTrackStream(trackId: string): string {
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
  public authenticate(username: string, password: string): Observable<any> {
    const url = this.baseURL + '/Users/authenticatebyname';
    const body = {
      Username: username,
      Pw: password,
    };
    return this.http.post(url, body, {headers: this.headers});
  }
// QUICK CONNECT
  public initiateQuickConnect(): Observable<any> {
    const url = this.baseURL + '/QuickConnect/Initiate';
    return this.http.get(url, {headers: this._getHeaders()});
  }
  public checkQuickConnectStatus(secret: string): Observable<any> {
    const url = this.baseURL + '/QuickConnect/Connect';
    const params = new HttpParams().set('secret', secret);
    return this.http.get(url, {params, headers: this._getHeaders()});
  }
  public authenticateWithQuickConnect(secret: string): Observable<any> {
    const url = this.baseURL + '/Users/AuthenticateWithQuickConnect';
    const body = {Secret: secret};
    return this.http.post(url, body, {headers: this._getHeaders()});
  }
//Checks if token is still valid
  public checkAuth(accessToken: string, userId: string) {
    const url = this.baseURL + `/Users/${userId}`;
    const headersWithtoken = this.headers.set('X-MediaBrowser-Token', `${accessToken}`);
    this.http.get(url, {headers: headersWithtoken}).subscribe(
      (response: any) => {
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
  public startSessionPlayback(itemId: string, isPaused: boolean = false): void {
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
    this.http.post(url, progressInfo, {headers: this._getHeaders()}).subscribe(
      (response) => {
        // Handle successful response if needed
      },
      (error) => {
        // Handle error if needed
      }
    );
  }
  public stopSessionPlayback(itemId: string): void {
    const url = this.baseURL + "/Sessions/Playing/Stopped";
    const progressInfo: PlaybackProgressInfo = new PlaybackProgressInfo({
      canSeek: true,
      itemId: itemId,
      isPaused: false,
      isMuted: false,
      // Set other properties as needed
    });
    this.http.post(url, progressInfo, {headers: this._getHeaders()}).subscribe(
      (response) => {
        // Handle successful response if needed
      },
      (error) => {
        // Handle error if needed
        console.error('Error starting playback:', error);
      }
    );
  }


  public dataLoadProgressSubject = new Subject<number>();

  loadDataCascade(): Observable<number> {
    const totalSteps = 400; // Total number of steps in the cascade
    let currentStep = 0;

    const updateProgress = () => {
      currentStep++;
      const progress = Math.floor(currentStep / totalSteps * 100);
      this.dataLoadProgressSubject.next(progress);
    };

    return new Observable<number>((observer) => {
      this.listArtists()
        .pipe(
          tap(() => updateProgress()),
          switchMap((artists) => {
            const artistObservables = artists.map((artist : any) => {
              return this.listAlbums(artist.id).pipe(
                tap((albums) => {
                  updateProgress();
                  albums.forEach((album: any) => {
                    this.listAlbumTracks(album.id).pipe(tap((tracks) => {
                      updateProgress();
                    })); // Load album tracks
                  });
                }),
                map(() => {}), // Return an empty value to complete the observable
              );
            });
            return forkJoin(artistObservables);
          }),
          switchMap(() => this.listAlbums()),
          tap(() => updateProgress()),
          switchMap((albums) => {
            const albumObservables = albums.map((album : any) => {
              return this.listAlbumTracks(album.id).pipe(
                tap(() => updateProgress())
              );
            });
            return forkJoin(albumObservables);
          }),
          switchMap(() => this.listPlaylists()),
          tap(() => updateProgress()),
          switchMap((playlists) => {
            const playlistObservables = playlists.map((playlist :any) => {
              return this.listAlbumTracks(playlist.id).pipe(
                tap(() => updateProgress())
              );
            });
            return forkJoin(playlistObservables);
          }),
          map(() => {
            this.dataLoadProgressSubject.next(100);// Complete with 100% progress
            observer.complete();
          })
        )
        .subscribe();
    });
  }
}
