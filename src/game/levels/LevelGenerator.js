import { GROUND_Y } from '../../constants';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const LevelGenerator = {
  chunkWidth: 1000,
  minY: 260,
  maxY: GROUND_Y + 40,

  getDifficulty(distance) {
    return Math.min(distance / 5000, 1);
  },

  generateChunk(startX, startY) {
    const regions = [];
    const chunkEnd = startX + this.chunkWidth;
    let cursorX = startX;
    const y = clamp(startY, this.minY, this.maxY);
    const points = [
      { x: cursorX, y },
      { x: chunkEnd, y },
    ];
    regions.push({ points });

    return {
      regions,
      overhangs: [],
      tunnels: [],
      ceilingPoints: [],
      endPoint: { x: chunkEnd, y },
      endX: chunkEnd,
    };
  },
};
