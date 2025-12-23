import { GROUND_Y } from '../../constants';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const SLOPE_START_X = 500;
const SLOPE_END_X = 1000;
const SLOPE_ANGLE_DEG = 15;
const SLOPE_RATE = Math.tan((SLOPE_ANGLE_DEG * Math.PI) / 180); // tan(15°) ≈ 0.2679
const SLOPE_LENGTH = SLOPE_END_X - SLOPE_START_X; // 500 pixels
const TOTAL_RISE = SLOPE_LENGTH * SLOPE_RATE; // Total vertical rise during slope

export const LevelGenerator = {
  chunkWidth: 1000,
  minY: 260,
  maxY: GROUND_Y + 40,

  getDifficulty(distance) {
    return Math.min(distance / 5000, 1);
  },

  // Calculate Y position based on X position and slope
  getTerrainY(x) {
    if (x < SLOPE_START_X) {
      // Horizontal at starting elevation
      return GROUND_Y;
    } else if (x >= SLOPE_START_X && x <= SLOPE_END_X) {
      // Slope upward from 250 to 400
      const distanceFromSlopeStart = x - SLOPE_START_X;
      const yOffset = distanceFromSlopeStart * SLOPE_RATE;
      return clamp(GROUND_Y - yOffset, this.minY, this.maxY);
    } else {
      // Horizontal at higher elevation after slope
      return clamp(GROUND_Y - TOTAL_RISE, this.minY, this.maxY);
    }
  },

  generateChunk(startX, startY) {
    const regions = [];
    const chunkEnd = startX + this.chunkWidth;

    // Create points along the slope
    const points = [];
    const step = 100; // Sample every 100 pixels for smooth slope

    for (let x = startX; x <= chunkEnd; x += step) {
      const y = this.getTerrainY(x);
      points.push({ x, y });
    }

    // Ensure the end point is included
    if (points[points.length - 1].x !== chunkEnd) {
      points.push({ x: chunkEnd, y: this.getTerrainY(chunkEnd) });
    }

    regions.push({ points });

    const endY = this.getTerrainY(chunkEnd);

    return {
      regions,
      overhangs: [],
      tunnels: [],
      ceilingPoints: [],
      endPoint: { x: chunkEnd, y: endY },
      endX: chunkEnd,
    };
  },
};
