import { useRef, useEffect } from 'react';
import { GameLoop } from '../game/core/GameLoop';
import { InputSystem } from '../game/systems/InputSystem';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';

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
      InputSystem.cleanup();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      style={{ border: '1px solid #333' }}
    />
  );
}
