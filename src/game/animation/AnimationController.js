import { StickFigure } from './StickFigure';
import { CollisionSystem } from '../systems/CollisionSystem';

export const AnimationController = {
  currentState: 'running',
  animationFrame: 0,

  update(player, deltaTime) {
    const speed = Math.abs(player.velocity.x);
    const cycleSpeed = Math.max(speed / 5, 0.2);
    this.animationFrame += (deltaTime / 500) * cycleSpeed;
    if (this.animationFrame > 1) {
      this.animationFrame -= 1;
    }

    const clearance = CollisionSystem.getVerticalClearance(player);

    if (clearance < 60) {
      this.currentState = 'crouched';
    } else if (speed > 8) {
      this.currentState = 'sprinting';
    } else {
      this.currentState = 'running';
    }
  },

  draw(ctx, player, cameraX = 0) {
    const screenX = player.position.x - cameraX;
    switch (this.currentState) {
      case 'sprinting':
        StickFigure.drawSprinting(ctx, screenX, player.position.y, this.animationFrame);
        break;
      case 'crouched':
        StickFigure.drawCrouched(ctx, screenX, player.position.y, this.animationFrame);
        break;
      default:
        StickFigure.drawRunning(ctx, screenX, player.position.y, this.animationFrame);
    }
  },
};
