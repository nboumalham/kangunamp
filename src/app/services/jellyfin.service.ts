import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JellyfinService {

  constructor(private http: HttpClient) { }

  baseURL = "https://media.boumalham.com/";
  headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

listArtists() : Observable<any> {
	var url = this.baseURL + "artists/albumartists";
	var poop = this.http.get(url, {params: this.getBaseHttpParams(), headers: this.headers});
	return poop;
}

listAlbums(artistId : string) : Observable<any> {
  var url = this.baseURL + "Items/?ArtistIds=" + artistId + "&Recursive=true&IncludeItemTypes=MusicAlbum";
  var poop = this.http.get(url, { params: this.getBaseHttpParams(), headers: this.headers});
  return poop;
}

listItems(albumId : string) : Observable<any> {
	var url = this.baseURL + "Items/?ParentId=" + albumId;
	var poop = this.http.get(url, { params: this.getBaseHttpParams(), headers: this.headers});
	return poop;
}

getTrackImageURL(trackId : string) : string {
  return this.baseURL + "/Items/" + trackId + "/Images/Primary?fillWidth=200&fillHeight=200&quality=90&api_key=9c7870b5cfd94ff3a012db85dff62978"
}

getTrackStream(trackId : string) :string {
	var url = this.baseURL + "Audio/" + trackId + "/universal/?api_key=9c7870b5cfd94ff3a012db85dff62978&DeviceId=14651563213216546543213131&UserId=cdb094fd28f04bdeaee23527ae575baf";
	return url;
}

getBaseHttpParams() {
    var params = {'api_key': "9c7870b5cfd94ff3a012db85dff62978",
    "DeviceId": "14651563213216546543213131",
    "UserId": "cdb094fd28f04bdeaee23527ae575baf"};
    return params;
}


}
