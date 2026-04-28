'use client';

import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipForward, Settings, Subtitles, ChevronLeft, Loader2, PictureInPicture2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpdateProgress } from '@/hooks/useContent';

interface Subtitle {
  id: string;
  language: string;
  label: string;
  url: string;
}

interface VideoPlayerProps {
  contentId: string;
  videoUrl: string;
  videoType?: 'DIRECT' | 'EMBED' | 'HLS';
  title: string;
  episodeTitle?: string;
  subtitles?: Subtitle[];
  savedProgress?: number;
  duration?: number;
  introStart?: number;
  introEnd?: number;
  nextEpisode?: { id: string; title: string };
  onBack?: () => void;
  onEnded?: () => void;
  profileId?: string;
  // Watch Party sync
  onTimeUpdate?: (time: number) => void;
  onPlayStateChange?: (playing: boolean) => void;
  externalSeek?: number;
  externalSeekSeq?: number;
  externalPlaying?: boolean;
  topBarExtra?: ReactNode;
}

export function VideoPlayer({
  contentId,
  videoUrl,
  videoType = 'DIRECT',
  title,
  episodeTitle,
  subtitles = [],
  savedProgress = 0,
  duration = 0,
  introStart,
  introEnd,
  nextEpisode,
  onBack,
  onEnded,
  profileId,
  onTimeUpdate,
  onPlayStateChange,
  externalSeek,
  externalSeekSeq,
  externalPlaying,
  topBarExtra,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<any>(null);
  const progressSaveRef = useRef<any>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(duration || 0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showIntroSkip, setShowIntroSkip] = useState(false);
  const [showNextEpisode, setShowNextEpisode] = useState(false);
  const [selectedSubtitle, setSelectedSubtitle] = useState<string | null>(null);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState('auto');
  const [isPiP, setIsPiP] = useState(false);

  const { mutate: updateProgress } = useUpdateProgress();

  const saveProgress = useCallback(
    (time: number) => {
      if (!profileId || !contentId) return;
      updateProgress({
        contentId,
        profileId,
        progress: Math.floor(time),
        duration: Math.floor(videoDuration),
      });
    },
    [contentId, profileId, videoDuration, updateProgress],
  );

  useEffect(() => {
    if (!videoRef.current) return;

    const videoElement = document.createElement('video-js');
    videoElement.classList.add('vjs-big-play-centered', 'vjs-fluid');
    videoRef.current.appendChild(videoElement);

    const player = videojs(videoElement, {
      controls: false,
      autoplay: true,
      preload: 'auto',
      fluid: true,
      playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
      html5: { vhs: { overrideNative: true } },
      sources: [
        {
          src: videoUrl,
          type: videoType === 'HLS' || videoUrl.includes('.m3u8')
            ? 'application/x-mpegURL'
            : 'video/mp4',
        },
      ],
      tracks: subtitles.map((s) => ({
        src: s.url,
        kind: 'subtitles',
        srclang: s.language,
        label: s.label,
        default: s.language === 'es',
      })),
    });

    playerRef.current = player;

    player.on('ready', () => {
      if (savedProgress > 30) {
        player.currentTime(savedProgress);
      }
    });

    player.on('play', () => { setIsPlaying(true); onPlayStateChange?.(true); });
    player.on('pause', () => { setIsPlaying(false); onPlayStateChange?.(false); });
    player.on('volumechange', () => {
      setVolume(player.volume());
      setIsMuted(player.muted());
    });
    player.on('timeupdate', () => {
      const t = player.currentTime();
      const d = player.duration();
      setCurrentTime(t);
      onTimeUpdate?.(t);
      if (d && d !== Infinity) setVideoDuration(d);

      // Intro skip
      if (introStart !== undefined && introEnd !== undefined) {
        setShowIntroSkip(t >= introStart && t <= introEnd);
      }

      // Next episode button (last 30s)
      if (d && d !== Infinity && nextEpisode) {
        setShowNextEpisode(t >= d - 30);
      }
    });
    player.on('ended', () => {
      saveProgress(videoDuration);
      onEnded?.();
    });
    player.on('waiting', () => setIsLoading(true));
    player.on('canplay', () => setIsLoading(false));
    player.on('playing', () => setIsLoading(false));
    player.on('fullscreenchange', () => {
      setIsFullscreen(player.isFullscreen());
    });
    player.on('error', (e: any) => console.error('Player error:', e));

    // Auto-save progress every 15s
    progressSaveRef.current = setInterval(() => {
      if (playerRef.current) {
        saveProgress(playerRef.current.currentTime());
      }
    }, 15000);

    return () => {
      clearInterval(progressSaveRef.current);
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [videoUrl]);

  // External seek (Watch Party sync)
  useEffect(() => {
    if (externalSeek !== undefined && playerRef.current) {
      playerRef.current.currentTime(externalSeek);
    }
  }, [externalSeekSeq]); // fires when seq changes, uses externalSeek value

  // External play/pause (Watch Party sync)
  useEffect(() => {
    if (externalPlaying === undefined || !playerRef.current) return;
    if (externalPlaying && playerRef.current.paused()) {
      playerRef.current.play();
    } else if (!externalPlaying && !playerRef.current.paused()) {
      playerRef.current.pause();
    }
  }, [externalPlaying]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    playerRef.current.paused() ? playerRef.current.play() : playerRef.current.pause();
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    const newMuted = !playerRef.current.muted();
    playerRef.current.muted(newMuted);
  };

  const handleVolumeChange = (v: number) => {
    if (!playerRef.current) return;
    playerRef.current.volume(v);
    if (v === 0) playerRef.current.muted(true);
    else playerRef.current.muted(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    if (playerRef.current) playerRef.current.currentTime(t);
    setCurrentTime(t);
  };

  const togglePiP = async () => {
    try {
      const videoEl = playerRef.current?.tech(true)?.el() as HTMLVideoElement | undefined;
      if (!videoEl) return;
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiP(false);
      } else {
        await videoEl.requestPictureInPicture();
        setIsPiP(true);
        videoEl.addEventListener('leavepictureinpicture', () => setIsPiP(false), { once: true });
      }
    } catch (e) {
      console.warn('PiP not supported', e);
    }
  };

  const toggleFullscreen = () => {
    if (!playerRef.current) return;
    playerRef.current.isFullscreen()
      ? playerRef.current.exitFullscreen()
      : playerRef.current.requestFullscreen();
  };

  const skipIntro = () => {
    if (playerRef.current && introEnd) {
      playerRef.current.currentTime(introEnd);
    }
    setShowIntroSkip(false);
  };

  const skip = (sec: number) => {
    if (playerRef.current) {
      playerRef.current.currentTime(Math.max(0, playerRef.current.currentTime() + sec));
    }
  };

  const setPlaybackRateHandler = (rate: number) => {
    if (playerRef.current) playerRef.current.playbackRate(rate);
    setPlaybackRate(rate);
    setShowSettingsMenu(false);
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const resetControlsTimer = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3500);
    }
  };

  const progressPercent = videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0;

  /* ── Iframe embed player ─────────────────────────────────────── */
  if (videoType === 'EMBED') {
    return (
      <div className="relative bg-black w-full h-full flex flex-col">
        {/* Top bar — fades after 3 s of no movement */}
        <div
          className="absolute top-0 left-0 right-0 z-20 flex items-center gap-3 px-4 py-3 bg-gradient-to-b from-black/90 to-transparent pointer-events-none"
          style={{ pointerEvents: 'auto' }}
        >
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-full bg-black/50 hover:bg-black/80 transition-colors flex-shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate drop-shadow">{title}</p>
            {episodeTitle && (
              <p className="text-xs text-gray-300 truncate drop-shadow">{episodeTitle}</p>
            )}
          </div>
          {topBarExtra && (
            <div className="flex items-center gap-2 flex-shrink-0">{topBarExtra}</div>
          )}
        </div>

        <iframe
          src={videoUrl}
          className="w-full h-full border-0 flex-1"
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-top-navigation-by-user-activation"
          referrerPolicy="no-referrer-when-downgrade"
          title={episodeTitle || title}
          loading="eager"
        />
      </div>
    );
  }

  return (
    <div
      className="relative bg-black w-full h-full group"
      onMouseMove={resetControlsTimer}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onClick={() => { setShowSubMenu(false); setShowSettingsMenu(false); }}
    >
      {/* Video.js container */}
      <div ref={videoRef} className="w-full h-full" onClick={togglePlay} />

      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}

      {/* Skip intro button */}
      {showIntroSkip && (
        <button
          onClick={(e) => { e.stopPropagation(); skipIntro(); }}
          className="absolute bottom-24 right-8 bg-white/10 border border-white/40 text-white px-6 py-3 rounded backdrop-blur-sm hover:bg-white/20 transition-all font-medium"
        >
          Saltar introducción →
        </button>
      )}

      {/* Next episode button */}
      {showNextEpisode && nextEpisode && (
        <div className="absolute bottom-24 right-8 bg-nexora-dark-2 border border-white/20 p-4 rounded-lg max-w-xs">
          <p className="text-xs text-gray-400 mb-1">A continuación</p>
          <p className="font-medium text-sm mb-3">{nextEpisode.title}</p>
          <button className="w-full bg-white text-black font-bold py-2 rounded text-sm hover:bg-gray-200 transition-colors">
            Siguiente episodio →
          </button>
        </div>
      )}

      {/* Controls overlay */}
      <div
        className={cn(
          'absolute inset-0 flex flex-col justify-between transition-opacity duration-300 pointer-events-none',
          showControls ? 'opacity-100' : 'opacity-0',
        )}
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.8) 100%)' }}
      >
        {/* Top bar */}
        <div className="flex items-center gap-4 p-4 md:p-6 pointer-events-auto">
          {onBack && (
            <button onClick={onBack} className="p-2 hover:text-gray-300 transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <div className="flex-1">
            <p className="font-bold text-sm md:text-base">{title}</p>
            {episodeTitle && <p className="text-gray-300 text-xs">{episodeTitle}</p>}
          </div>
          {topBarExtra}
        </div>

        {/* Bottom controls */}
        <div className="p-4 md:p-6 space-y-3 pointer-events-auto">
          {/* Progress bar */}
          <div className="group/prog flex items-center gap-2">
            <span className="text-xs text-gray-300 w-12 text-right flex-shrink-0">
              {formatTime(currentTime)}
            </span>
            <div className="relative flex-1 h-1 group-hover/prog:h-2 transition-all bg-white/30 rounded-full cursor-pointer">
              <input
                type="range"
                min={0}
                max={videoDuration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div
                className="h-full bg-nexora-red rounded-full pointer-events-none"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs text-gray-300 w-12 flex-shrink-0">
              {formatTime(videoDuration)}
            </span>
          </div>

          {/* Buttons row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              {/* Play/Pause */}
              <button onClick={togglePlay} className="p-2 hover:text-gray-300 transition-colors">
                {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white" />}
              </button>

              {/* Skip back/forward */}
              <button onClick={() => skip(-10)} className="hidden md:block p-2 hover:text-gray-300 text-xs font-bold">
                ⏮ 10
              </button>
              <button onClick={() => skip(10)} className="p-2 hover:text-gray-300">
                <SkipForward className="w-5 h-5" />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <button onClick={toggleMute} className="p-2 hover:text-gray-300">
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-20 hidden md:block accent-white"
                />
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Subtitles */}
              {subtitles.length > 0 && (
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowSubMenu(!showSubMenu); setShowSettingsMenu(false); }}
                    className="p-2 hover:text-gray-300 transition-colors"
                  >
                    <Subtitles className="w-5 h-5" />
                  </button>
                  {showSubMenu && (
                    <div
                      className="absolute bottom-full right-0 mb-2 bg-nexora-dark-2 border border-white/20 rounded py-1 min-w-36"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => { setSelectedSubtitle(null); setShowSubMenu(false); }}
                        className="w-full px-4 py-2 text-sm text-left hover:bg-white/10"
                      >
                        Sin subtítulos
                      </button>
                      {subtitles.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => { setSelectedSubtitle(s.language); setShowSubMenu(false); }}
                          className={cn('w-full px-4 py-2 text-sm text-left hover:bg-white/10', selectedSubtitle === s.language && 'text-nexora-red')}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Settings */}
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowSettingsMenu(!showSettingsMenu); setShowSubMenu(false); }}
                  className="p-2 hover:text-gray-300 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>
                {showSettingsMenu && (
                  <div
                    className="absolute bottom-full right-0 mb-2 bg-nexora-dark-2 border border-white/20 rounded p-3 min-w-48"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="text-xs text-gray-400 mb-2 font-medium uppercase">Velocidad</p>
                    <div className="grid grid-cols-3 gap-1">
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((r) => (
                        <button
                          key={r}
                          onClick={() => setPlaybackRateHandler(r)}
                          className={cn(
                            'py-1.5 text-xs rounded',
                            playbackRate === r ? 'bg-nexora-red text-white' : 'bg-white/10 hover:bg-white/20',
                          )}
                        >
                          {r === 1 ? 'Normal' : `${r}x`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Picture-in-Picture */}
              {'pictureInPictureEnabled' in document && (
                <button
                  onClick={togglePiP}
                  title="Picture in Picture"
                  className={cn('p-2 hover:text-gray-300 transition-colors', isPiP && 'text-nexora-red')}
                >
                  <PictureInPicture2 className="w-5 h-5" />
                </button>
              )}

              {/* Fullscreen */}
              <button onClick={toggleFullscreen} className="p-2 hover:text-gray-300 transition-colors">
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
