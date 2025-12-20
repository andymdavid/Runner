import { useRef, useEffect } from 'react';
import { GameLoop } from '../game/core/GameLoop';

export function GameCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create and start game loop
    const gameLoop = new GameLoop(ctx);
    gameLoop.start();

    // Cleanup function
    return () => {
      gameLoop.stop();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{ border: '1px solid #333' }}
    />
  );
}
