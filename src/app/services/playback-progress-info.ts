export class PlaybackProgressInfo {
  canSeek?: boolean;
  itemId?: string;
  sessionId?: string | null;
  mediaSourceId?: string | null;
  audioStreamIndex?: number | null;
  subtitleStreamIndex?: number | null;
  isPaused: boolean = false;
  isMuted: boolean = false;
  positionTicks?: number | null;
  playbackStartTimeTicks?: number | null;
  volumeLevel?: number | null;
  brightness?: number | null;
  aspectRatio?: string | null;
  playMethod?: 'Transcode' | 'DirectStream' | 'DirectPlay';
  liveStreamId?: string | null;
  playSessionId?: string | null;
  repeatMode?: 'RepeatNone' | 'RepeatAll' | 'RepeatOne';
  playlistItemId?: string | null;

  constructor(data: Partial<PlaybackProgressInfo>) {
    // noinspection TypeScriptValidateTypes
    Object.assign(this, data);
  }
}
