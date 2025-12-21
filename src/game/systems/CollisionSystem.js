import { TerrainSystem } from './TerrainSystem';

export const CollisionSystem = {
  resolveTerrainCollision(player) {
    const surfaceY = TerrainSystem.getSurfaceY(player.position.x);
    if (surfaceY !== Infinity && player.position.y >= surfaceY) {
      player.position.y = surfaceY;
      player.velocity.y = 0;
      return true;
    }
    return false;
  },

  checkCeilingCollision(player) {
    const playerTop = player.position.y - player.height;
    const ceilingY = TerrainSystem.getCeilingY(player.position.x);
    return playerTop <= ceilingY;
  },

  getVerticalClearance(player) {
    return TerrainSystem.getClearance(player.position.x);
  },
};
