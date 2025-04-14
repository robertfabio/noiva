'use client';

import React, { useRef, useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Box, Button, HStack, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Text, Icon, Spinner, Center } from '@chakra-ui/react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress } from 'react-icons/fa';

// Importar players adicionais para mais formatos
import 'react-player/lazy';

interface VideoPlayerProps {
  url: string;
  roomId: string;
  isHost: boolean;
  onPlayPause?: (isPlaying: boolean) => void;
  onSeek?: (seconds: number) => void;
  onProgressUpdate?: (progress: {
    played: number;
    loaded: number;
    playedSeconds: number;
    loadedSeconds: number;
  }) => void;
  remoteAction?: {
    type: 'play' | 'pause' | 'seek';
    value?: number;
  } | null;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  roomId, // eslint-disable-line @typescript-eslint/no-unused-vars
  isHost,
  onPlayPause,
  onSeek,
  onProgressUpdate,
  remoteAction
}) => {
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playerReady, setPlayerReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Handle remote actions from other users
  useEffect(() => {
    if (!remoteAction) return;
    
    if (remoteAction.type === 'play') {
      setPlaying(true);
    } else if (remoteAction.type === 'pause') {
      setPlaying(false);
    } else if (remoteAction.type === 'seek' && remoteAction.value !== undefined) {
      playerRef.current?.seekTo(remoteAction.value);
      setProgress(remoteAction.value);
    }
  }, [remoteAction]);

  // Detect video type
  const isHLS = url?.endsWith('.m3u8');
  const isDASH = url?.endsWith('.mpd');
  
  const handlePlayPause = () => {
    const newPlayingState = !playing;
    setPlaying(newPlayingState);
    
    if (onPlayPause) {
      onPlayPause(newPlayingState);
    }
  };
  
  const handleVolumeChange = (value: number) => {
    setVolume(value);
    setMuted(value === 0);
  };
  
  const toggleMute = () => {
    setMuted(!muted);
  };
  
  const handleSeekChange = (value: number) => {
    setSeeking(true);
    setProgress(value);
  };
  
  const handleSeekMouseUp = (value: number) => {
    setSeeking(false);
    playerRef.current?.seekTo(value);
    
    if (onSeek) {
      onSeek(value * duration);
    }
  };
  
  const handleProgress = (state: { played: number; loaded: number; playedSeconds: number; loadedSeconds: number }) => {
    // Only update progress if not seeking
    if (!seeking) {
      setProgress(state.played);
    }
    
    if (onProgressUpdate && isHost) {
      onProgressUpdate(state);
    }
    
    // Hide loading spinner when video is playing
    if (state.loaded > 0 && loading) {
      setLoading(false);
    }
  };
  
  const handleDuration = (duration: number) => {
    setDuration(duration);
  };
  
  const handleReady = () => {
    setPlayerReady(true);
    setLoading(false);
  };
  
  const handleError = (error: Error | string) => {
    console.error("Video player error:", error);
    setError("Erro ao carregar vídeo. Verifique se o formato é suportado.");
    setLoading(false);
  };
  
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!fullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    
    setFullscreen(!fullscreen);
  };
  
  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    return [
      h > 0 ? h : null,
      m,
      s < 10 ? `0${s}` : s
    ]
      .filter(Boolean)
      .join(':');
  };
  
  return (
    <Box 
      w="full" 
      position="relative" 
      borderRadius="lg" 
      overflow="hidden" 
      bg="black"
      ref={containerRef}
      h={fullscreen ? "100vh" : "auto"}
      aspectRatio={16/9}
    >
      {loading && playerReady === false && (
        <Center position="absolute" top="0" left="0" right="0" bottom="0" zIndex="1" bg="rgba(0,0,0,0.7)">
          <Spinner size="xl" color="purple.500" thickness="4px" />
        </Center>
      )}
      
      {error && (
        <Center position="absolute" top="0" left="0" right="0" bottom="0" zIndex="1" bg="rgba(0,0,0,0.7)">
          <Text color="white">{error}</Text>
        </Center>
      )}
      
      <ReactPlayer
        ref={playerRef}
        url={url}
        width="100%"
        height="100%"
        playing={playing}
        volume={volume}
        muted={muted}
        onDuration={handleDuration}
        onProgress={handleProgress}
        onReady={handleReady}
        onError={handleError}
        progressInterval={1000}
        style={{ position: 'absolute', top: 0, left: 0 }}
        config={{
          file: {
            forceHLS: isHLS,
            forceDASH: isDASH,
            attributes: {
              controlsList: 'nodownload'
            }
          }
        }}
      />
      
      <Box
        position="absolute"
        bottom="0"
        left="0"
        right="0"
        bg="rgba(0,0,0,0.7)"
        p={3}
        transition="opacity 0.3s"
        _hover={{ opacity: 1 }}
        opacity="0.7"
      >
        <Slider
          aria-label="video-progress"
          value={progress * duration}
          min={0}
          max={duration}
          onChange={(v) => handleSeekChange(v / duration)}
          onChangeEnd={(v) => handleSeekMouseUp(v / duration)}
          mb={3}
        >
          <SliderTrack bg="gray.600">
            <SliderFilledTrack bg="purple.500" />
          </SliderTrack>
          <SliderThumb boxSize={3} />
        </Slider>
        
        <HStack justify="space-between">
          <HStack spacing={3}>
            <Button
              size="sm"
              variant="ghost"
              color="white"
              onClick={handlePlayPause}
              aria-label={playing ? 'Pause' : 'Play'}
            >
              <Icon as={playing ? FaPause : FaPlay} />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              color="white"
              onClick={toggleMute}
              aria-label={muted ? 'Unmute' : 'Mute'}
            >
              <Icon as={muted ? FaVolumeMute : FaVolumeUp} />
            </Button>
            
            <Box w="100px">
              <Slider
                aria-label="volume"
                value={muted ? 0 : volume}
                min={0}
                max={1}
                step={0.01}
                onChange={handleVolumeChange}
              >
                <SliderTrack bg="gray.600">
                  <SliderFilledTrack bg="purple.500" />
                </SliderTrack>
                <SliderThumb boxSize={2} />
              </Slider>
            </Box>
            
            <Text color="white" fontSize="sm">
              {formatTime(progress * duration)} / {formatTime(duration)}
            </Text>
          </HStack>
          
          <Button
            size="sm"
            variant="ghost"
            color="white"
            onClick={toggleFullscreen}
            aria-label={fullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
          >
            <Icon as={fullscreen ? FaCompress : FaExpand} />
          </Button>
        </HStack>
      </Box>
    </Box>
  );
};

export default VideoPlayer; 