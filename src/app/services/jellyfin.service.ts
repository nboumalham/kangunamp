import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

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
  
  client = "kaiOs";
  device = 'kaiOS';
  deviceId = "dslkfsdlkjfsdkfljsdlfkj";
  version = "0.0.0.1";

  headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'X-MediaBrowser-Token': '',
    'X-Emby-Authorization': `MediaBrowser Client="${this.client}", Device="${this.device}", DeviceId="${this.deviceId}", Version="${this.version}"`,
    'MediaBrowser': 'Web',
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

listAlbums(artistId: string): Observable<any> {
    const cacheKey = `albums_${artistId}`;
    const cachedData = this.getDataFromLocalStorage(cacheKey);

    if (cachedData) {
      return of(cachedData);
    } else {
      const url = this.baseURL + "Items/?ArtistIds=" + artistId + "&Recursive=true&IncludeItemTypes=MusicAlbum";
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

getTrackImageURL(trackId : string) : string {
  return this.baseURL + "/Items/" + trackId + "/Images/Primary?fillWidth=200&fillHeight=200&quality=90"
}

getTrackStream(trackId : string) :string {
	const url = this.baseURL + `Audio/${trackId}/universal/`;
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



authenticate(username : string, password : string ) : Observable<any> {
    const url = this.baseURL + '/Users/authenticatebyname';
    const body = { Username: username,
                   Pw: password,
                 };
    return this.http.post(url, body, {headers: this.headers});
}

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




/** LOCAL STORAGE **/
 private expirationTime = 3600000; // 1 hour in milliseconds

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
