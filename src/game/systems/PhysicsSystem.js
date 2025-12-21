import { GRAVITY } from '../../constants';

export const PhysicsSystem = {
  update(player, deltaTime) {
    const clampedDelta = Math.min(deltaTime, 100);
    const timeScale = clampedDelta / 16;

    // Apply gravity
    player.velocity.y += GRAVITY * timeScale;

    // Update position based on velocity
    player.position.x += player.velocity.x * timeScale;
    player.position.y += player.velocity.y * timeScale;

  }
};
