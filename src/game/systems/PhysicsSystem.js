import { GRAVITY, GROUND_Y } from '../../constants';

export const PhysicsSystem = {
  update(player, deltaTime) {
    // Apply gravity
    player.velocity.y += GRAVITY * (deltaTime / 16);

    // Update position based on velocity
    player.position.x += player.velocity.x * (deltaTime / 16);
    player.position.y += player.velocity.y * (deltaTime / 16);

    // Simple ground collision (temporary)
    if (player.position.y >= GROUND_Y) {
      player.position.y = GROUND_Y;
      player.velocity.y = 0;
    }
  }
};
