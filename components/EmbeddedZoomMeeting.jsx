"use client";
import React, { useEffect, useRef, useState } from 'react';
import { X, Maximize2, Minimize2, Video, VideoOff, Mic, MicOff, Settings, LogOut } from 'lucide-react';

export default function EmbeddedZoomMeeting({ meetingConfig, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const meetingSDKElement = useRef(null);

  useEffect(() => {
    let zoomClient = null;

    const initZoom = async () => {
      try {
        setLoading(true);
        // We import dynamically to avoid SSR issues and wait for installation
        const { ZoomMtg } = await import('@zoom/meetingsdk');

        ZoomMtg.setZoomJSLib('https://source.zoom.us/lib', '/av');
        ZoomMtg.preLoadWasm();
        ZoomMtg.prepareWebSDK();

        ZoomMtg.init({
          leaveUrl: window.location.href,
          patchJsMedia: true,
          success: (success) => {
            ZoomMtg.join({
              signature: meetingConfig.signature,
              sdkKey: meetingConfig.sdkKey,
              meetingNumber: meetingConfig.meetingNumber,
              userName: meetingConfig.userName || 'Vanquish Admin',
              userEmail: meetingConfig.userEmail || '',
              passWord: meetingConfig.password || '',
              tk: '',
              success: (res) => {
                console.log('Joined meeting successfully');
                setLoading(false);
              },
              error: (err) => {
                console.error('Join error:', err);
                setError('Failed to join meeting. Please check your SDK credentials.');
                setLoading(false);
              }
            });
          },
          error: (err) => {
            console.error('Init error:', err);
            setError('Failed to initialize Zoom SDK.');
            setLoading(false);
          }
        });
      } catch (err) {
        console.error('SDK Load error:', err);
        setError('Error loading Zoom SDK. Please ensure it is installed.');
        setLoading(false);
      }
    };

    initZoom();

    return () => {
      // Clean up if Zoom provides a destroy method, or just hide the element
      const zoomRoot = document.getElementById('zmmtg-root');
      if (zoomRoot) zoomRoot.style.display = 'none';
    };
  }, [meetingConfig]);

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullScreen(!isFullScreen);
  };

  return (
    <div className={`fixed inset-0 z-[9999] bg-black flex flex-col ${isFullScreen ? '' : 'm-4 rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-800'}`}>
      {/* Custom Overlay Header to keep it integrated */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between px-6 z-[10000] pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">Vanquish Live Room</h2>
            <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Encrypted Session</p>
          </div>
        </div>

        <div className="flex items-center gap-4 pointer-events-auto">
          <button 
            onClick={toggleFullScreen}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/5"
            title="Toggle HD Mode"
          >
            {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          <button 
            onClick={onClose}
            className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2 font-bold px-6"
          >
            <LogOut className="w-5 h-5" /> 
            Exit Room
          </button>
        </div>
      </div>

      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-[10001]">
          <div className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-6 shadow-[0_0_30px_rgba(168,85,247,0.4)]"></div>
          <p className="text-white font-bold text-xl tracking-wide animate-pulse uppercase">Setting up secure line...</p>
          <p className="text-gray-500 text-sm mt-2">Connecting to Zoom Encrypted Node</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-[10001] p-12 text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center mb-6 border border-red-500/50">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Secure Link Failed</h3>
          <p className="text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
            {error}
          </p>
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-white text-black font-black rounded-xl hover:bg-gray-200 transition-all uppercase tracking-widest text-sm shadow-xl"
          >
            Return to Dashboard
          </button>
        </div>
      )}

      {/* Zoom SDK will render into #zmmtg-root which is created by the SDK itself globably */}
      {/* We just need to make sure our component container stays alive */}
      <div id="zmmtg-root" className="flex-1 w-full bg-black"></div>
      
      {/* Style overrides for Zoom SDK to make it fit better */}
      <style jsx global>{`
        #zmmtg-root {
          display: flex !important;
          flex-direction: column !important;
          height: 100% !important;
          width: 100% !important;
          position: relative !important;
        }
        .meeting-client {
          height: 100% !important;
          width: 100% !important;
        }
        /* Hide default Zoom footer if possible or theme it */
        #wc-footer {
          background-color: #000 !important;
          border-top: 1px solid #222 !important;
        }
      `}</style>
    </div>
  );
}

// Minimal AlertTriangle for the error state
function AlertTriangle({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
    </svg>
  );
}
