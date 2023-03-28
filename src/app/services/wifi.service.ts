import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WifiNetwork {
  ssid: string;
  signal: number;
  quality: string;
  frequency: number;
  bitrates: string;
  encrypted: boolean;
  address: string;
  channel: number;
  mode: string;
}

@Injectable({
  providedIn: 'root',
})
export class WifiService {
  private apiUrl = 'http://localhost:5000/wifi';

  constructor(private http: HttpClient) {}

  scanNetworks(): Observable<{ networks: WifiNetwork[] }> {
    return this.http.get<{ networks: WifiNetwork[] }>(`${this.apiUrl}/scan`);
  }

  connectToNetwork(ssid: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/connect`, { ssid, password });
  }
}
