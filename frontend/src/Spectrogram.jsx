import { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import Spectrogram from 'wavesurfer.js/dist/plugins/spectrogram.esm.js';

export default function SpectrogramView({ file }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!file || !containerRef.current) return;

    const url = URL.createObjectURL(file);

    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      height: 180,
      waveColor: '#999999',
      progressColor: '#ff0000',
      plugins: [
        Spectrogram.create({
          labels: true,
          height: 180,
          scale: 'mel',
          colorMap: 'roseus',
        }),
      ],
    });

    wavesurfer.load(url);

    return () => {
      wavesurfer.destroy();
      URL.revokeObjectURL(url);
    };
  }, [file]);

  if (!file) return null;

  return (
    <div
      style={{
        width: 'min(700px, 90%)',
        margin: '30px auto',
        padding: '20px',
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
        boxSizing: 'border-box',
      }}
    >
      <h2 style={{ color: '#222', fontSize: '22px' }}>
        Спектрограмма аудиозаписи
      </h2>

      <p style={{ color: '#666', overflowWrap: 'anywhere' }}>
        {file.name}
      </p>

      <div ref={containerRef} />
    </div>
  );
}