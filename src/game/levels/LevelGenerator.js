import { GROUND_Y } from '../../constants';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// Repeating terrain pattern
const HORIZONTAL_LENGTH = 500;
const SLOPE_LENGTH = 500;
const SLOPE_ANGLE_DEG = 15;
const SLOPE_RATE = Math.tan((SLOPE_ANGLE_DEG * Math.PI) / 180); // tan(15°) ≈ 0.2679
const TOTAL_RISE = SLOPE_LENGTH * SLOPE_RATE; // Total vertical rise during upward slope

// Pattern: horizontal(500) -> up(500) -> horizontal(500) -> down(500) = 2000px cycle
const PATTERN_CYCLE_LENGTH = HORIZONTAL_LENGTH + SLOPE_LENGTH + HORIZONTAL_LENGTH + SLOPE_LENGTH; // 2000px

export const LevelGenerator = {
  chunkWidth: 1000,
  minY: 260,
  maxY: GROUND_Y + 40,

  getDifficulty(distance) {
    return Math.min(distance / 5000, 1);
  },

  // Calculate Y position based on X position and repeating slope pattern
  getTerrainY(x) {
    // Find position within the current pattern cycle
    const positionInCycle = x % PATTERN_CYCLE_LENGTH;

    // Determine which segment we're in
    if (positionInCycle < HORIZONTAL_LENGTH) {
      // First horizontal segment (0-500 in cycle)
      return GROUND_Y;
    } else if (positionInCycle < HORIZONTAL_LENGTH + SLOPE_LENGTH) {
      // Upward slope segment (500-1000 in cycle)
      const distanceIntoSlope = positionInCycle - HORIZONTAL_LENGTH;
      const yOffset = distanceIntoSlope * SLOPE_RATE;
      return clamp(GROUND_Y - yOffset, this.minY, this.maxY);
    } else if (positionInCycle < HORIZONTAL_LENGTH + SLOPE_LENGTH + HORIZONTAL_LENGTH) {
      // Second horizontal segment at elevated position (1000-1500 in cycle)
      return clamp(GROUND_Y - TOTAL_RISE, this.minY, this.maxY);
    } else {
      // Downward slope segment (1500-2000 in cycle)
      const distanceIntoDecline = positionInCycle - (HORIZONTAL_LENGTH + SLOPE_LENGTH + HORIZONTAL_LENGTH);
      const yOffset = distanceIntoDecline * SLOPE_RATE;
      const elevatedY = GROUND_Y - TOTAL_RISE;
      return clamp(elevatedY + yOffset, this.minY, this.maxY);
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

    // Add ceiling obstacles/crevasses
    const overhangs = [];

    // Rectangular ceiling cutout at X:2000 (60px wide, extends down 60px into channel)
    const crevasse1StartX = 2000;
    const crevasse1EndX = 2060;
    if (startX <= crevasse1EndX && chunkEnd >= crevasse1StartX) {
      overhangs.push({
        startX: crevasse1StartX,
        endX: crevasse1EndX,
        clearance: 140, // 80px drop from base 220 clearance
      });
    }

    // Add ceiling recesses (inverse cutouts)
    const recesses = [];
    const floorOffsets = [];

    // Rectangular ceiling recess at X:2400 (60px wide, ceiling pulls back 60px)
    const recess1StartX = 2400;
    const recess1EndX = 2460;
    if (startX <= recess1EndX && chunkEnd >= recess1StartX) {
      recesses.push({
        startX: recess1StartX,
        endX: recess1EndX,
        clearance: 300, // 80px taller than base 220 clearance
      });
    }

    // Floor recess matching the ceiling-recess style (but cutting downward)
    const floorRecessStartX = 2200;
    const floorRecessEndX = floorRecessStartX + 60;
    if (startX <= floorRecessEndX && chunkEnd >= floorRecessStartX) {
      floorOffsets.push({
        startX: floorRecessStartX,
        endX: floorRecessEndX,
        offset: 25, // Drop floor by 25px within this span
      });
    }

    return {
      regions,
      overhangs,
      tunnels: [],
      recesses,
      floorOffsets,
      ceilingPoints: [],
      endPoint: { x: chunkEnd, y: endY },
      endX: chunkEnd,
    };
  },
};
