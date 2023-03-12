import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArtistListComponent } from './artistList/artistList.component';
import { AlbumListComponent } from './albumList/albumList.component';
import { TrackListComponent } from './trackList/trackList.component';
import { HomeComponent } from './home/home.component';
import { PlayerComponent } from './player/player.component';
const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'player', component: PlayerComponent },
  { path: 'artists', component: ArtistListComponent },
  { path: 'artists/:id/albums', component: AlbumListComponent },
  { path: 'albums/:id/tracks', component: TrackListComponent },
  { path: '',   redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
