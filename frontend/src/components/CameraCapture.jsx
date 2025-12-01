/**
 * CameraCapture komponens - Kamera használat mobilon/PC-n
 * Frontend Developer: Sarah Kim
 */

import React, { useRef, useState, useEffect } from 'react';

const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Mindig próbáljuk meg elindítani a kamerát - lehet, hogy a böngésző mégis engedélyezi
    startCamera();
    
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      // Részletes diagnosztika
      console.log('🔍 Kamera diagnosztika:');
      console.log('- navigator.mediaDevices:', navigator.mediaDevices);
      console.log('- navigator.mediaDevices?.getUserMedia:', navigator.mediaDevices?.getUserMedia);
      console.log('- navigator.getUserMedia (régi API):', navigator.getUserMedia);
      console.log('- navigator.webkitGetUserMedia:', navigator.webkitGetUserMedia);
      console.log('- navigator.mozGetUserMedia:', navigator.mozGetUserMedia);
      console.log('- window.location.protocol:', window.location.protocol);
      console.log('- window.location.hostname:', window.location.hostname);
      console.log('- Is localhost?:', window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

      // HTTP-n a böngészők biztonsági okokból nem engedélyezik a kamerát
      // Kivéve: localhost, 127.0.0.1
      const isSecureContext = window.location.protocol === 'https:' || 
                               window.location.hostname === 'localhost' || 
                               window.location.hostname === '127.0.0.1' ||
                               window.location.hostname.startsWith('192.168.') ||
                               window.location.hostname.startsWith('10.') ||
                               window.location.hostname.startsWith('172.');

      // Próbáljuk meg a modern API-t
      let getUserMedia = null;
      
      // Először próbáljuk a modern API-t
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        getUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
        console.log('✅ Modern API elérhető');
      } 
      // Ha nincs modern API, próbáljuk a régi API-kat (ezek HTTP-n is működhetnek régebbi böngészőkben)
      else if (navigator.getUserMedia) {
        console.log('⚠️ Régi navigator.getUserMedia API-t használunk');
        getUserMedia = (constraints) => {
          return new Promise((resolve, reject) => {
            navigator.getUserMedia(constraints, resolve, reject);
          });
        };
      } else if (navigator.webkitGetUserMedia) {
        console.log('⚠️ Webkit régi API-t használunk');
        getUserMedia = (constraints) => {
          return new Promise((resolve, reject) => {
            navigator.webkitGetUserMedia(constraints, resolve, reject);
          });
        };
      } else if (navigator.mozGetUserMedia) {
        console.log('⚠️ Firefox régi API-t használunk');
        getUserMedia = (constraints) => {
          return new Promise((resolve, reject) => {
            navigator.mozGetUserMedia(constraints, resolve, reject);
          });
        };
      }

      if (!getUserMedia) {
        let errorMsg = '❌ A böngésző nem teszi elérhetővé a kamerát.';
        if (!isSecureContext) {
          errorMsg += '\n\n🔒 HTTP-n a modern böngészők biztonsági okokból nem engedélyezik a kamerát.';
          errorMsg += '\n\n✅ Megoldások:';
          errorMsg += '\n1. Használj HTTPS-t (https://192.168.50.75:3000)';
          errorMsg += '\n2. Vagy localhost-ot (http://localhost:3000)';
          errorMsg += '\n3. Vagy próbáld meg egy régebbi böngészőt';
          errorMsg += '\n\n💡 Jelenleg: ' + window.location.protocol + '//' + window.location.hostname;
          errorMsg += '\n\n⚠️ Még az engedély kérése sem lehetséges HTTP-n, mert a böngésző nem teszi elérhetővé a kamera API-t.';
        } else {
          errorMsg += '\n\nPróbáld meg egy másik böngészőt vagy ellenőrizd a böngésző beállításait!';
        }
        throw new Error(errorMsg);
      }

      // Próbáljuk meg elérni a kamerát
      let mediaStream;
      try {
        // Először próbáljuk a hátsó kamerát (mobilon)
        console.log('📷 Próbáljuk a hátsó kamerát...');
        mediaStream = await getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });
        console.log('✅ Hátsó kamera sikeresen elérve');
      } catch (envError) {
        console.log('⚠️ Hátsó kamera nem elérhető, próbáljuk az elülsőt...', envError);
        try {
          // Ha nem sikerül a hátsó kamera, próbáljuk az elülsőt
          mediaStream = await getUserMedia({
            video: {
              facingMode: 'user',
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            }
          });
          console.log('✅ Elülső kamera sikeresen elérve');
        } catch (userError) {
          console.log('⚠️ Elülső kamera sem működik, próbáljuk bármilyen kamerát...', userError);
          // Végül próbáljuk bármilyen kamerát
          mediaStream = await getUserMedia({
            video: true
          });
          console.log('✅ Kamera sikeresen elérve (alapértelmezett)');
        }
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (err) {
      console.error('❌ Kamera hozzáférési hiba:', err);
      console.error('Hiba részletei:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      
      let errorMessage = 'Nem sikerült elérni a kamerát.';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'A kamera hozzáférés megtagadva. Kérjük, engedélyezd a kamerát a böngésző beállításaiban!';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'Nem található kamera eszköz. Ellenőrizd, hogy van-e kamera a számítógépen/telefonon!';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'A kamera más alkalmazás által használatban van. Zárj be más alkalmazásokat!';
      } else if (err.name === 'NotSupportedError' || err.name === 'ConstraintNotSatisfiedError') {
        errorMessage = 'A kamera beállítások nem támogatottak. Próbáld meg egy másik böngészőt!';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const capturePhoto = () => {
    console.log('📸📸📸 capturePhoto hívva!');
    const video = videoRef.current;
    const canvas = canvasRef.current;

    console.log('📸 Video ref:', video ? 'OK' : 'NULL');
    console.log('📸 Canvas ref:', canvas ? 'OK' : 'NULL');
    console.log('📸 onCapture callback:', typeof onCapture);

    if (!video || !canvas) {
      console.error('❌ Video vagy canvas hiányzik!', { video: !!video, canvas: !!canvas });
      alert('Hiba: Kamera nem elérhető!');
      return;
    }

    // JAVÍTVA: Ellenőrizzük, hogy a video ready-e
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    
    console.log('📸 Video méretek:', { 
      videoWidth, 
      videoHeight, 
      readyState: video.readyState,
      paused: video.paused,
      ended: video.ended
    });

    if (!videoWidth || !videoHeight || videoWidth === 0 || videoHeight === 0) {
      console.error('❌❌❌ Video még nem ready!', {
        videoWidth,
        videoHeight,
        readyState: video.readyState
      });
      alert('Hiba: A kamera még nem kész! Várj egy pillanatot és próbáld újra.');
      return;
    }

    try {
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      
      console.log('📸 Canvas méretek beállítva:', { width: canvas.width, height: canvas.height });
      
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, videoWidth, videoHeight);
      console.log('📸 Kép rajzolva a canvas-ra');

      canvas.toBlob((blob) => {
        console.log('📸📸📸 toBlob callback hívva!', { 
          blob: blob ? 'OK' : 'NULL', 
          size: blob?.size,
          blobType: blob?.type
        });
        
        if (!blob) {
          console.error('❌❌❌ Blob nem jött létre!');
          alert('Hiba: A kép nem hozható létre!');
          return;
        }

        try {
          const fileName = `camera-${Date.now()}.jpg`;
          console.log('📸 File létrehozása kezdődik...', { fileName, blobSize: blob.size });
          
          const file = new File([blob], fileName, {
            type: 'image/jpeg'
          });
          
          console.log('📸📸📸 File létrehozva:', {
            name: file.name,
            size: file.size,
            type: file.type,
            isFile: file instanceof File,
            fileObject: file
          });

          console.log('📸📸📸 onCapture callback ellenőrzése...', {
            onCapture: typeof onCapture,
            isFunction: typeof onCapture === 'function'
          });
          
          if (typeof onCapture === 'function') {
            console.log('📸📸📸 onCapture meghívása file-dal...');
            try {
              onCapture(file);
              console.log('✅✅✅ onCapture sikeresen meghívva!');
            } catch (callbackError) {
              console.error('❌❌❌ onCapture callback hiba:', callbackError);
              alert('Hiba az onCapture callback-ben: ' + callbackError.message);
            }
          } else {
            console.error('❌❌❌ onCapture nem függvény!', { 
              type: typeof onCapture,
              value: onCapture 
            });
            alert('Hiba: onCapture callback nem elérhető! Type: ' + typeof onCapture);
          }
          
          stopCamera();
        } catch (error) {
          console.error('❌❌❌ File létrehozási hiba:', error);
          console.error('Hiba részletek:', {
            message: error.message,
            stack: error.stack,
            name: error.name
          });
          alert('Hiba: ' + error.message);
        }
      }, 'image/jpeg', 0.95);
      
      // JAVÍTVA: Ha a toBlob nem hívódik meg, próbáljuk meg setTimeout-tal
      setTimeout(() => {
        console.log('📸 toBlob timeout ellenőrzés - ha nem jött blob, lehet probléma');
      }, 1000);
    } catch (error) {
      console.error('❌ capturePhoto hiba:', error);
      alert('Hiba: ' + error.message);
    }
  };

  if (error) {
    return (
      <div className="camera-container" style={{ 
        width: '100%', 
        maxWidth: '800px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          color: 'var(--game-red)',
          background: 'var(--game-cream-light)',
          border: '2px solid var(--game-red)',
          borderRadius: '12px',
          width: '100%'
        }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</p>
          <p style={{ fontFamily: 'var(--font-text)', marginBottom: '1rem' }}>{error}</p>
          <button 
            className="btn btn-secondary" 
            onClick={onClose} 
            style={{ 
              marginTop: '1rem',
              padding: '0.75rem 2rem',
              background: 'var(--game-cream)',
              color: 'var(--game-brown)',
              border: '2px solid var(--game-brown)',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: 'var(--font-text)'
            }}
          >
            Bezárás
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="camera-container" style={{ 
      width: '100%', 
      maxWidth: '800px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px'
    }}>
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="camera-video"
        onLoadedMetadata={() => {
          const video = videoRef.current;
          if (video) {
            console.log('📸 Video metadata loaded:', {
              videoWidth: video.videoWidth,
              videoHeight: video.videoHeight,
              readyState: video.readyState
            });
          }
        }}
        onCanPlay={() => {
          const video = videoRef.current;
          if (video) {
            console.log('📸 Video can play:', {
              videoWidth: video.videoWidth,
              videoHeight: video.videoHeight
            });
          }
        }}
        style={{
          width: '100%',
          maxWidth: '100%',
          height: 'auto',
          borderRadius: '12px',
          background: '#000'
        }}
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <div className="camera-controls" style={{
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        width: '100%'
      }}>
        <button 
          className="capture-btn" 
          onClick={() => {
            const video = videoRef.current;
            console.log('📸 Fényképezés gomb kattintva!', {
              video: !!video,
              videoWidth: video?.videoWidth,
              videoHeight: video?.videoHeight,
              readyState: video?.readyState
            });
            
            if (video && (video.videoWidth === 0 || video.videoHeight === 0)) {
              console.warn('⚠️ Video még nem ready, várunk 500ms...');
              // Várunk egy kicsit és újra próbáljuk
              setTimeout(() => {
                const videoAfterWait = videoRef.current;
                if (videoAfterWait && videoAfterWait.videoWidth > 0 && videoAfterWait.videoHeight > 0) {
                  console.log('✅ Video most már ready, capturePhoto hívása...');
                  capturePhoto();
                } else {
                  console.error('❌ Video még mindig nem ready!', {
                    videoWidth: videoAfterWait?.videoWidth,
                    videoHeight: videoAfterWait?.videoHeight
                  });
                  alert('Hiba: A kamera még nem kész! Várj egy pillanatot és próbáld újra.');
                }
              }, 500);
            } else {
              capturePhoto();
            }
          }}
          style={{
            padding: '0.75rem 2rem',
            background: 'var(--game-green)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: 'var(--font-text)'
          }}
        >
          📸 Fényképezés
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={() => {
            stopCamera();
            onClose();
          }}
          style={{
            padding: '0.75rem 2rem',
            background: 'var(--game-cream)',
            color: 'var(--game-brown)',
            border: '2px solid var(--game-brown)',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: 'var(--font-text)'
          }}
        >
          Mégse
        </button>
      </div>
    </div>
  );
};

export default CameraCapture;
