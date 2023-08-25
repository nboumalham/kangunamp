import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import {PlaybackProgressInfo} from "./playback-progress-info";

@Injectable({
  providedIn: 'root'
})
export class JellyfinService {

  constructor(private http: HttpClient, private router: Router) {
    // Check if the access token is still valid when the component is initialized
    const userIdToken = localStorage.getItem('jellyfin_user_id');
    const accessToken = localStorage.getItem('jellyfin_access_token');
    if (accessToken && userIdToken) {
      console.log('checking access token ')
      this.checkAuth(accessToken, userIdToken);
    }
    else {
      console.log('No access TOKEN!!!')
      this.router.navigate(['/auth']);
    }
  }

  baseURL = "https://media.boumalham.com/";

  client = "Kangunamp";
  device = 'Kangunamp';
  deviceId = "TW96aWxsYS81LjAgKFgxMTsgTGludXggeDg2XzY0OyBydjo5NC4wKSBHZWNrby8yMDEwMDEwMSBGaXJlZm94Lzk0LjB8MTYzODA1MzA2OTY4Mw12";
  version = "0.0.0.1";

  headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'X-MediaBrowser-Token': '',
    'X-Emby-Authorization': `MediaBrowser Client="${this.client}", Device="${this.device}", DeviceId="${this.deviceId}", Version="${this.version}"`,
    'MediaBrowser': 'Music',
    'Client': this.client,
    'Device': this.device,
    'DeviceId': this.deviceId,
    'Version': this.version
  });

getHeaders() : HttpHeaders {
  const accessToken = localStorage.getItem('jellyfin_access_token');
  if (accessToken) {
    const headersWithtoken = this.headers.set('X-MediaBrowser-Token', `${accessToken}`);
    return headersWithtoken
  } else return this.headers;
}


 listArtists(): Observable<any> {
    const cacheKey = `artists`;
    const cachedData = this.getDataFromLocalStorage(cacheKey);

    if (cachedData) {
      return of(cachedData);
    } else {
      const url = this.baseURL + "artists/albumartists";
      return this.http.get(url, { params: this.getBaseHttpParams(), headers: this.getHeaders() }).pipe(
        tap(data => {
          this.setDataToLocalStorage(cacheKey, data);
        })
      );
    }
  }

listAlbums(artistId?: string): Observable<any> {
    const key = (artistId ? artistId : "all");
    const cacheKey = `albums_${key}`;
    const cachedData = this.getDataFromLocalStorage(cacheKey);

    if (cachedData) {
      return of(cachedData);
    } else {
      const url = this.baseURL + "Items/?" + (artistId ? "ArtistIds=" + artistId + "&" : "") + "Recursive=true&IncludeItemTypes=MusicAlbum";
      return this.http.get(url, { params: this.getBaseHttpParams(), headers: this.getHeaders() }).pipe(
        tap(data => {
          this.setDataToLocalStorage(cacheKey, data);
        })
      );
    }
  }

  listPlaylists(): Observable<any> {
    const cacheKey = 'playlists';
    const cachedData = this.getDataFromLocalStorage(cacheKey);

    if (cachedData) {
      return of(cachedData);
    } else {
      const url = this.baseURL + "Items/?IncludeItemTypes=Playlist&Recursive=true";
      return this.http.get(url, { params: this.getBaseHttpParams(), headers: this.getHeaders() }).pipe(
        tap(data => {
          this.setDataToLocalStorage(cacheKey, data);
        })
      );
    }
  }

  listItems(albumId: string): Observable<any> {
    const cacheKey = `items_${albumId}`;
    const cachedData = this.getDataFromLocalStorage(cacheKey);

    if (cachedData) {
      return of(cachedData);
    } else {
      const url = this.baseURL + "Items/?ParentId=" + albumId;
      return this.http.get(url, { params: this.getBaseHttpParams(), headers: this.getHeaders() }).pipe(
        tap(data => {
          this.setDataToLocalStorage(cacheKey, data);
        })
      );
    }
  }

getItemImageURL(itemId : string, hd: boolean = false, type : string = "Primary") : string {
  return this.baseURL + "/Items/" + itemId + "/Images/" + type + (hd ? "" : "?fillWidth=200&fillHeight=200&quality=90");
}

getTrackStream(trackId : string) :string {
	const url = this.baseURL + `Audio/${trackId}/stream`;
	const params = new HttpParams({ fromObject: this.getBaseHttpParams() });
  return url + '?' + params.toString();
}

getBaseHttpParams() {

    var params = {
       "UserId":  `${localStorage.getItem('jellyfin_user_id')}`,
       "api_key" : `${localStorage.getItem('jellyfin_access_token')}`,
       "DeviceId" : `${this.deviceId}`
     };
    return params;
}

/*****************************************************************************/
/*  AUTHENTICATION
/*****************************************************************************/


//REGULAR USERNAME PASSWORD AUTH (not used in this app but I want to keep it)
authenticate(username : string, password : string ) : Observable<any> {
    const url = this.baseURL + '/Users/authenticatebyname';
    const body = { Username: username,
                   Pw: password,
                 };
    return this.http.post(url, body, {headers: this.headers});
}

// QUICK CONNECT
initiateQuickConnect(): Observable<any> {
  const url = this.baseURL + '/QuickConnect/Initiate';
  return this.http.get(url, { headers: this.getHeaders() });
}

checkQuickConnectStatus(secret: string): Observable<any> {
  const url = this.baseURL + '/QuickConnect/Connect';
  const params = new HttpParams().set('secret', secret);
  return this.http.get(url, { params, headers: this.getHeaders() });
}

authenticateWithQuickConnect(secret: string): Observable<any> {
  const url = this.baseURL + '/Users/AuthenticateWithQuickConnect';
  const body = { Secret: secret };
  return this.http.post(url, body, { headers: this.getHeaders() });
}

//Checks if token is still valid
checkAuth(accessToken : string, userId: string) {
     const url = this.baseURL + `/Users/${userId}`;
     const headersWithtoken = this.headers.set('X-MediaBrowser-Token', `${accessToken}`);
     this.http.get(url, { headers: headersWithtoken }).subscribe(
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

startSessionPlayback(itemId: string, isPaused : boolean = false): void {
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
  this.http.post(url,  progressInfo, {headers: this.getHeaders()}).subscribe(
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

  getSessionPlayback(itemId: string): Observable<any> {
    //const cacheKey = `items_${albumId}`;
    //const cachedData = this.getDataFromLocalStorage(cacheKey);
    const url = this.baseURL + "/Sessions/Playing/Progress";
    return this.http.get(url, { params: this.getBaseHttpParams(), headers: this.getHeaders() }).pipe(
      tap(data => {
      })
    );
  }

  stopSessionPlayback(itemId: string): void {
    //const cacheKey = `items_${albumId}`;
    //const cachedData = this.getDataFromLocalStorage(cacheKey);
    const url = this.baseURL + "/Sessions/Playing/Stopped";
    const progressInfo: PlaybackProgressInfo = new PlaybackProgressInfo({
      canSeek: true,
      itemId: itemId,
      isPaused: false,
      isMuted: false,
      // Set other properties as needed
    });
    this.http.post(url,  progressInfo, {headers: this.getHeaders()}).subscribe(
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



/** LOCAL STORAGE **/
 private expirationTime = 1 //3600000; // 1 hour in milliseconds

 private getDataFromLocalStorage(key: string) {
    const data = localStorage.getItem(key);
    if (data) {
      const parsedData = JSON.parse(data);
      const currentTime = new Date().getTime();
      if (parsedData.timestamp && currentTime - parsedData.timestamp < this.expirationTime) {
        return parsedData.data;
      }
    }
    return null;
  }

  private setDataToLocalStorage(key: string, data: any) {
    const currentTime = new Date().getTime();
    const storageData = {
      data: data,
      timestamp: currentTime
    };
    localStorage.setItem(key, JSON.stringify(storageData));
  }

}
