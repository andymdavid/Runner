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

// Designed ceiling/floor features
const CEILING_OVERHANGS = [
  // Chapter 1: Introductory staggered crevasses (700-1800)
  { start: 780, width: 60, clearance: 160 },
  { start: 860, width: 40, clearance: 150 },
  { start: 1140, width: 70, clearance: 180 },
  { start: 1240, width: 50, clearance: 160 },
  { start: 1430, width: 60, clearance: 160 },
  { start: 1560, width: 40, clearance: 150 },
  { start: 1710, width: 60, clearance: 140 },

  // Chapter 2: Mid-section gauntlets (1800-3200)
  { start: 2000, width: 60, clearance: 140 },
  { start: 2150, width: 80, clearance: 180 },
  { start: 2320, width: 60, clearance: 150 },
  { start: 2520, width: 70, clearance: 150 },
  { start: 2660, width: 60, clearance: 160 },
  { start: 2840, width: 70, clearance: 150 },
  { start: 3000, width: 60, clearance: 160 },
  { start: 3140, width: 60, clearance: 150 },

  // Chapter 3: Late-section choke points (3200-5000)
  { start: 3290, width: 80, clearance: 140 },
  { start: 3460, width: 60, clearance: 150 },
  { start: 3620, width: 60, clearance: 140 },
  { start: 3780, width: 70, clearance: 150 },
  { start: 3940, width: 60, clearance: 140 },
  { start: 4100, width: 70, clearance: 150 },
  { start: 4300, width: 70, clearance: 150 },
  { start: 4460, width: 60, clearance: 140 },
  { start: 4660, width: 80, clearance: 140 },
  { start: 4820, width: 60, clearance: 150 },
  { start: 4980, width: 70, clearance: 140 },
  { start: 5160, width: 60, clearance: 150 },
  { start: 5340, width: 70, clearance: 140 },
  { start: 5520, width: 60, clearance: 150 },
  { start: 5700, width: 70, clearance: 140 },
  { start: 5880, width: 60, clearance: 150 },
  { start: 6060, width: 70, clearance: 140 },
  { start: 6240, width: 60, clearance: 150 },
  { start: 6420, width: 70, clearance: 140 },
  { start: 6600, width: 60, clearance: 150 },
  { start: 6780, width: 80, clearance: 140 },
  { start: 6960, width: 60, clearance: 150 },
  { start: 7140, width: 70, clearance: 140 },
  { start: 7320, width: 60, clearance: 150 },
  { start: 7500, width: 70, clearance: 140 },
  { start: 7680, width: 60, clearance: 150 },
  { start: 7860, width: 70, clearance: 140 },
  { start: 8040, width: 60, clearance: 150 },
  { start: 8220, width: 70, clearance: 140 },
  { start: 8400, width: 60, clearance: 150 },
  { start: 8580, width: 70, clearance: 140 },
  { start: 8760, width: 60, clearance: 150 },
  { start: 8940, width: 70, clearance: 140 },
  { start: 9120, width: 60, clearance: 150 },
  { start: 9300, width: 70, clearance: 140 },
  { start: 9480, width: 60, clearance: 150 },
  { start: 9660, width: 70, clearance: 140 },
];

const CEILING_RECESSES = [
  // Chapter 1 safety pockets
  { start: 900, width: 80, clearance: 280 },
  { start: 1330, width: 80, clearance: 260 },
  { start: 1810, width: 80, clearance: 260 },

  // Chapter 2 spaced alcoves
  { start: 2400, width: 60, clearance: 300 },
  { start: 2880, width: 80, clearance: 260 },
  { start: 3380, width: 80, clearance: 300 },
  { start: 3600, width: 80, clearance: 280 },
  { start: 4020, width: 80, clearance: 280 },
  { start: 4460, width: 90, clearance: 280 },
  { start: 4900, width: 90, clearance: 270 },

  // Chapter 3 sparse refuges
  { start: 5340, width: 90, clearance: 300 },
  { start: 6000, width: 80, clearance: 280 },
  { start: 6660, width: 90, clearance: 260 },
  { start: 7320, width: 80, clearance: 280 },
  { start: 7980, width: 90, clearance: 300 },
  { start: 8640, width: 80, clearance: 280 },
  { start: 9300, width: 90, clearance: 260 },
  { start: 9740, width: 90, clearance: 300 },
];

const FLOOR_RECESSES = [
  // Chapter 1 crevasses
  { start: 720, width: 140, offset: 20 },
  { start: 1110, width: 130, offset: 25 },
  { start: 1390, width: 100, offset: 25 },
  { start: 1660, width: 110, offset: 25 },
  { start: 1900, width: 80, offset: 25 },
  { start: 2200, width: 110, offset: 25 },

  // Chapter 2 support pits (fewer, longer gaps between them)
  { start: 2680, width: 110, offset: 25 },
  { start: 2940, width: 120, offset: 25 },
  { start: 3220, width: 130, offset: 25 },
  { start: 3500, width: 120, offset: 25 },
  { start: 3760, width: 110, offset: 25 },
  { start: 4020, width: 130, offset: 25 },

  // Chapter 3 sparse crevasses
  { start: 4580, width: 120, offset: 25 },
  { start: 4860, width: 130, offset: 30 },
  { start: 5140, width: 120, offset: 25 },
  { start: 5420, width: 130, offset: 30 },
  { start: 5700, width: 120, offset: 25 },
  { start: 5980, width: 140, offset: 30 },
  { start: 6260, width: 130, offset: 25 },
  { start: 6540, width: 140, offset: 30 },
  { start: 6820, width: 120, offset: 25 },
  { start: 7100, width: 140, offset: 30 },
  { start: 7380, width: 120, offset: 25 },
  { start: 7660, width: 140, offset: 30 },
  { start: 7940, width: 120, offset: 25 },
  { start: 8220, width: 140, offset: 30 },
  { start: 8500, width: 120, offset: 25 },
  { start: 8780, width: 140, offset: 30 },
  { start: 9060, width: 120, offset: 25 },
  { start: 9340, width: 140, offset: 30 },
  { start: 9620, width: 120, offset: 25 },
];

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
    CEILING_OVERHANGS.forEach(({ start, width, clearance }) => {
      const end = start + width;
      if (startX <= end && chunkEnd >= start) {
        overhangs.push({ startX: start, endX: end, clearance });
      }
    });

    // Add ceiling recesses (inverse cutouts)
    const recesses = [];
    const floorOffsets = [];

    CEILING_RECESSES.forEach(({ start, width, clearance }) => {
      const end = start + width;
      if (startX <= end && chunkEnd >= start) {
        recesses.push({ startX: start, endX: end, clearance });
      }
    });

    FLOOR_RECESSES.forEach(({ start, width, offset }) => {
      const end = start + width;
      if (startX <= end && chunkEnd >= start) {
        floorOffsets.push({ startX: start, endX: end, offset });
      }
    });

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
