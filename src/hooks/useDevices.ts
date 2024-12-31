import { useState, useEffect } from 'react';

interface DeviceInfo {
  deviceId: string;
  label: string;
}

export const useDevices = () => {
  const [videoDevices, setVideoDevices] = useState<DeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<DeviceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        
        const videoDevs = devices
          .filter(device => device.kind === 'videoinput')
          .map(d => ({ 
            deviceId: d.deviceId, 
            label: d.label || `Camera ${d.deviceId.slice(0, 5)}` 
          }));

        const audioDevs = devices
          .filter(device => device.kind === 'audioinput')
          .map(d => ({ 
            deviceId: d.deviceId, 
            label: d.label || `Microphone ${d.deviceId.slice(0, 5)}` 
          }));
        
        setVideoDevices(videoDevs);
        setAudioDevices(audioDevs);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to enumerate devices:', error);
        setIsLoading(false);
      }
    };

    initializeDevices();
  }, []);

  return { videoDevices, audioDevices, isLoading };
};