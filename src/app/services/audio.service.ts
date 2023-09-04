import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import {TrackItem} from "../models/list-item.model";

@Injectable()
export class AudioService {

    public audio: HTMLAudioElement;

    public playlistIndex : BehaviorSubject<string> = new BehaviorSubject('0 of 0');
    public timeElapsed: BehaviorSubject<string> = new BehaviorSubject('00:00');
    public timeRemaining: BehaviorSubject<string> = new BehaviorSubject('-00:00');
    public percentElapsed: BehaviorSubject<number> = new BehaviorSubject(0);
    public percentLoaded: BehaviorSubject<number> = new BehaviorSubject(0);
    public playerStatus: BehaviorSubject<string> = new BehaviorSubject('stopped');
    public currentTrack: BehaviorSubject<TrackItem> = new BehaviorSubject(new TrackItem("-1", "--", "--", true, false, "--", "--", "", true, "", "-1", 0));


    //for playlists
    public audioQueue: TrackItem[] = [];
    public currentAudioIndex: number = 0;
    public shuffle: boolean = false;

    constructor() {
        this.audio = new Audio();
        this.attachListeners();
    }

    private attachListeners(): void {
        this.audio.addEventListener('timeupdate', this.calculateTime, false);
        this.audio.addEventListener('playing', this.setPlayerStatus, false);
        this.audio.addEventListener('pause', this.setPlayerStatus, false);
        this.audio.addEventListener('progress', this.calculatePercentLoaded, false);
        this.audio.addEventListener('waiting', this.setPlayerStatus, false);
        this.audio.addEventListener('ended', this.handleAudioEnded, false);
    }

    private calculateTime = (evt : any) => {
        let ct = this.audio.currentTime;
        let d = this.getCurrentTrack().durationInMilliseconds;
        this.setTimeElapsed(ct);
        this.setPercentElapsed(d, ct);
        this.setTimeRemaining(d, ct);
    }

    private calculatePercentLoaded = (evt : any) => {
        if (this.audio.duration > 0) {
            for (var i = 0; i < this.audio.buffered.length; i++) {
                if (this.audio.buffered.start(this.audio.buffered.length - 1 - i) < this.audio.currentTime) {
                    let percent = (this.audio.buffered.end(this.audio.buffered.length - 1 - i) / this.audio.duration) * 100;
                    this.setPercentLoaded(percent)
                    break;
                }
            }
        }
    }

    // Add a new method to set the audio queue
    public setAudioQueue(queue: TrackItem | TrackItem[], index : number = 0): void {
        // If the input is a single TrackItem, convert it into an array with one element
        if (!Array.isArray(queue)) {
            queue = [queue];
        }
        this.audioQueue = queue;
        this.currentAudioIndex = index;
        this.loadCurrentAudio();

      this.currentTrack.subscribe((track : TrackItem)=> {
        if ('mediaSession' in navigator) {
          // Set media metadata
          navigator.mediaSession.metadata = new MediaMetadata({
            title: track.title,
            artist: track.albumArtists,
            album: track.album,
            artwork: [
              { src: track.imageURL + "?fillWidth=128&fillHeight=128&quality=90", sizes: '128x128', type: 'image/jpeg' },
              { src: track.imageURL + "?fillWidth=512&fillHeight=512&quality=90", sizes: '512x512', type: 'image/jpeg' },
              { src: track.imageURL + "?fillWidth=1024&fillHeight=1024&quality=90", sizes: '1024x1024', type: 'image/jpeg'}
            ]
          });
        }
      });
      if ('mediaSession' in navigator) {
        // Set media controls
        navigator.mediaSession.setActionHandler('play', () => {
          // Handle play action
          this.playAudio();
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          // Handle pause action
          this.pauseAudio();
        });
        // More action handlers like next, prev, seekbackward, seekforward, etc.
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          // Handle pause action
          this.playPreviousAudio();
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
          // Handle pause action
          this.playNextAudio();
        });
        navigator.mediaSession.setActionHandler('seekbackward', (details) => {
          // Handle pause action
          this.seekAudioBackwards(details.seekOffset);
        });
        navigator.mediaSession.setActionHandler('seekforward', (details) => {
          // Handle pause action
          this.seekAudioForward(details.seekOffset);
        });
      }
    }

    public getAudioQueue(): TrackItem[] {
        return this.audioQueue;
    }

    public getCurrentTrack(): TrackItem{
     return this.audioQueue[this.currentAudioIndex];
    }

    //method to handle the 'ended' event
    private handleAudioEnded = (evt: any) => {
        this.setPlayerStatus(evt);
        this.playNextAudio();
    }

    private setPlayerStatus = (evt : any) => {
        switch (evt.type) {
            case 'playing':
            this.playerStatus.next('playing');
            break;
            case 'pause':
            this.playerStatus.next('paused');
            break;
            case 'waiting':
            this.playerStatus.next('loading');
            break;
            case 'ended':
            this.playerStatus.next('ended');
            break;
            default:
            this.playerStatus.next('stopped');
            break;
        }
    }

    // Add a new method to load the current audio
    private loadCurrentAudio(): void {
        if (this.audioQueue.length === 0 || this.currentAudioIndex >= this.audioQueue.length) {
            return;
        }
        const track = this.getCurrentTrack();
        this.setAudio(track.audioTrackURL);
        this.setPlaylistIndex(this.currentAudioIndex);
        this.setCurrentTrack(track);
    }

    //methods to navigate the audio queue
    public playNextAudio(): void {
        if (this.currentAudioIndex + 1 < this.audioQueue.length) {
            this.currentAudioIndex++;
            this.loadCurrentAudio();
        } else {
            this.currentAudioIndex = 0;
            this.loadCurrentAudio();
            this.toggleAudio();
        }
    }

    public playPreviousAudio(): void {
        if (this.currentAudioIndex - 1 >= 0) {
            this.currentAudioIndex--;
            this.loadCurrentAudio();
        } else {
            this.currentAudioIndex = this.audioQueue.length - 1;
            this.loadCurrentAudio();
        }
    }

    //method to toggle shuffle. It will take the audio queue and shuffle it. keeping the original order in a new array that will be used to unshuffle.
    public toggleShuffle(): void {
        if (this.shuffle) {
            this.shuffle = false;
            this.audioQueue = this.audioQueue.sort((a, b) => a.indexNumber - b.indexNumber);
            this.currentAudioIndex = this.audioQueue.indexOf(this.getCurrentTrack());
            //this.loadCurrentAudio();
        } else {
            this.shuffle = true;
            this.audioQueue = this.shuffleArray(this.audioQueue);
            this.currentAudioIndex = this.audioQueue.indexOf(this.getCurrentTrack());
            //this.loadCurrentAudio();
        }
    }

    //method to shuffle the audio queue
  private shuffleArray(array: TrackItem[]): TrackItem[] {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex > this.currentAudioIndex + 1) {
      // Pick a remaining element (excluding the item at currentAudioIndex and before it)...
      randomIndex = Math.floor(Math.random() * (currentIndex - this.currentAudioIndex - 1)) + this.currentAudioIndex + 1;

      currentIndex--;
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }


    /**
     * If you need the audio instance in your component for some reason, use this.
     */
     public getAudio(): HTMLAudioElement {
         return this.audio;
     }

    /**
     * This is typically a URL to an MP3 file
     * @param src
     */
     public setAudio(src: string): void {
         this.audio.src = src;
         this.playAudio();
     }

    /**
     * The method to play audio
     */
     public playAudio(): void {
         this.audio.play();
     }

    /**
     * The method to pause audio
     */
     public pauseAudio(): void {
         this.audio.pause();
     }

    /**
     * Method to seek to a position on the audio track (in milliseconds, I think),
     * @param position
     */
     public seekAudio(position: number): void {
         this.audio.currentTime = position;
     }

  public seekAudioForward(delta: number = 100): void {
    this.audio.currentTime += delta;
  }

  public seekAudioBackwards(delta: number = 100): void {
    this.audio.currentTime -= delta;
  }

    /**
     * This formats the audio's elapsed time into a human readable format, could be refactored into a Pipe.
     * It takes the audio track's "currentTime" property as an argument. It is called from the, calulateTime method.
     * @param ct
     */
     private setTimeElapsed(ct: number): void {
         let seconds     = Math.floor(ct % 60),
         displaySecs = (seconds < 10) ? '0' + seconds : seconds,
         minutes     = Math.floor((ct / 60) % 60),
         displayMins = (minutes < 10) ? '0' + minutes : minutes;

         this.timeElapsed.next(displayMins + ':' + displaySecs);
     }

    /**
     * This method takes the track's "duration" and "currentTime" properties to calculate the remaing time the track has
     * left to play. It is called from the calculateTime method.
     * @param d
     * @param t
     */
     private setTimeRemaining(d: number, t: number): void {
         let remaining;
         let timeLeft = d - t,
         seconds = Math.floor(timeLeft % 60) || 0,
         remainingSeconds = seconds < 10 ? '0' + seconds : seconds,
         minutes = Math.floor((timeLeft / 60) % 60) || 0,
         remainingMinutes = minutes < 10 ? '0' + minutes : minutes,
         hours = Math.floor(((timeLeft / 60) / 60) % 60) || 0;

         // remaining = (hours === 0)
         if (hours === 0) {
             remaining = '-' + remainingMinutes + ':' + remainingSeconds;
         } else {
             remaining = '-' + hours + ':' + remainingMinutes + ':' + remainingSeconds;
         }
         this.timeRemaining.next(remaining);
     }

    /**
     * This method takes the track's "duration" and "currentTime" properties to calculate the percent of time elapsed.
     * This is valuable for setting the position of a range input. It is called from the calculateTime method.
     * @param d
     * @param ct
     */
     private setPercentElapsed(d: number, ct: number): void {
         this.percentElapsed.next(( Math.floor(( 100 / d ) * ct )) || 0 );
     }

    /**
     * This method takes the track's "duration" and "currentTime" properties to calculate the percent of time elapsed.
     * This is valuable for setting the position of a range input. It is called from the calculatePercentLoaded method.
     * @param p
     */
     private setPercentLoaded(p : any): void {
         this.percentLoaded.next(parseInt(p, 10) || 0 );
     }

    /**
     * This method returns an Observable whose value is the track's percent loaded
     */
     public getPercentLoaded(): Observable<number> {
         return this.percentLoaded.asObservable();
     }

    /**
     * This method returns an Observable whose value is the track's percent elapsed
     */
     public getPercentElapsed(): Observable<number> {
         return this.percentElapsed.asObservable();
     }

    /**
     * This method returns an Observable whose value is the track's percent loaded
     */
     public getTimeElapsed(): Observable<string> {
         return this.timeElapsed.asObservable();
     }

    /**
     * This method returns an Observable whose value is the track's time remaining
     */
     public getTimeRemaining(): Observable<string> {
         return this.timeRemaining.asObservable();
     }

    /**
     * This method returns an Observable whose value is the current status of the player.
     * This is useful inside your component to key off certain values, for example:
     *   - Show pause button when player status is 'playing'
     *   - Show play button when player status is 'paused'
     *   - Show loading indicator when player status is 'loading'
     *
     * See the setPlayer method for values.
     */
     public getPlayerStatus(): Observable<string> {
         return this.playerStatus.asObservable();
     }

    /**
     * Convenience method to toggle the audio between playing and paused
     */
     public toggleAudio(): void {
         (this.audio.paused) ? this.audio.play() : this.audio.pause();
     }

     public setPlaylistIndex(index : number) {
         this.playlistIndex.next((index + 1) + " of " + this.audioQueue.length);
     }

     public getPlaylistIndex() : Observable<string> {
         return this.playlistIndex.asObservable();
     }

     // Add methods to get and set the currentTrack as a BehaviorSubject
      public setCurrentTrack(track: TrackItem): void {
          this.currentTrack.next(track);
      }
      public getCurrentTrackObservable(): Observable<TrackItem> {
          return this.currentTrack.asObservable();
      }
 }
