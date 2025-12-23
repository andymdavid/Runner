import { CANVAS_HEIGHT, GROUND_Y } from '../../constants';

const BASELINE_Y = CANVAS_HEIGHT - 40;
const CEILING_TOP = 40;

export const TerrainSystem = {
  regions: [],
  overhangs: [],
  tunnels: [],
  ceilingOffsets: [],
  thickness: 120,
  baseClearance: 220,
  minClearance: 0,
  ceilingDrop: 0,

  init(startY = GROUND_Y) {
    this.regions = [{ points: [{ x: 0, y: startY }] }];
    this.overhangs = [];
    this.tunnels = [];
    this.ceilingOffsets = [];
    this.ceilingDrop = 0;
  },

  addChunk(chunk) {
    if (!chunk) return;

    chunk.regions.forEach((region, index) => {
      if (!region.points || region.points.length < 2) return;
      const shouldMerge = index === 0 && this.regions.length > 0;
      this._addRegion(region.points, shouldMerge);
    });

    if (Array.isArray(chunk.overhangs)) {
      this.overhangs.push(...chunk.overhangs);
    }
    if (Array.isArray(chunk.tunnels)) {
      this.tunnels.push(...chunk.tunnels);
    }
    if (Array.isArray(chunk.ceilingPoints)) {
      this.ceilingOffsets.push(...chunk.ceilingPoints);
    }
  },

  _addRegion(points, mergeWithPrevious) {
    if (!points || points.length === 0) return;

    if (mergeWithPrevious) {
      const currentRegion = this.regions[this.regions.length - 1];
      if (currentRegion && currentRegion.points.length) {
        const lastPoint = currentRegion.points[currentRegion.points.length - 1];
        const firstNew = points[0];
        if (lastPoint.x === firstNew.x && lastPoint.y === firstNew.y) {
          currentRegion.points.push(...points.slice(1));
          return;
        }
      }
    }

    this.regions.push({ points: [...points] });
  },

  prune(beforeX) {
    // Never prune the first chunk (0-1100) to keep start area and slope intact
    const PROTECTED_START_ZONE = 1100;

    // Only prune if we're beyond the protected zone
    if (beforeX - 200 < PROTECTED_START_ZONE) {
      return; // Don't prune at all if we'd touch protected terrain
    }

    const cutoff = beforeX - 200;

    this.regions = this.regions
      .map((region) => {
        const { points } = region;
        if (points.length < 2) return null;

        let startIndex = points.findIndex((point) => point.x >= cutoff);
        if (startIndex <= 0) {
          startIndex = 0;
        } else {
          startIndex -= 1; // keep previous point for interpolation
        }

        const sliced = points.slice(startIndex);
        if (sliced.length >= 2) {
          return { points: sliced };
        }
        return null;
      })
      .filter(Boolean);

    this.overhangs = this.overhangs.filter((zone) => zone.endX >= cutoff);
    this.tunnels = this.tunnels.filter((zone) => zone.endX >= cutoff);
    this.ceilingOffsets = this.ceilingOffsets.filter((point) => point.x >= cutoff);

    if (this.regions.length === 0) {
      this.regions = [{ points: [{ x: cutoff, y: GROUND_Y }] }];
    }
  },

  getSurfaceY(x) {
    for (const region of this.regions) {
      const { points } = region;
      if (points.length < 2) continue;
      if (x < points[0].x || x > points[points.length - 1].x) {
        continue;
      }

      for (let i = 0; i < points.length - 1; i += 1) {
        const p1 = points[i];
        const p2 = points[i + 1];
        if (x >= p1.x && x <= p2.x) {
          const t = (x - p1.x) / (p2.x - p1.x || 1);
          return p1.y + (p2.y - p1.y) * t;
        }
      }
    }

    return Infinity;
  },

  getClearance(x) {
    let clearance = this.baseClearance;
    for (const zone of this.overhangs) {
      if (x >= zone.startX && x <= zone.endX) {
        clearance = Math.min(clearance, zone.clearance);
      }
    }
    for (const tunnel of this.tunnels) {
      if (x >= tunnel.startX && x <= tunnel.endX) {
        clearance = Math.min(clearance, tunnel.clearance);
      }
    }
    for (const point of this.ceilingOffsets) {
      if (x >= point.x && x <= point.x + 40) {
        clearance = Math.max(clearance, point.offset);
      }
    }
    clearance = Math.max(this.minClearance, clearance - this.ceilingDrop);
    return clearance;
  },

  getCeilingY(x) {
    const surfaceY = this.getSurfaceY(x);
    if (surfaceY === Infinity) {
      return CEILING_TOP;
    }
    const clearance = this.getClearance(x);
    return Math.max(CEILING_TOP, surfaceY - clearance);
  },

  setCeilingDrop(amount) {
    this.ceilingDrop = Math.max(0, amount);
  },

  draw(renderSystem, ceilingColor = '#000000', floorColor = '#000000', channelColor = '#cfcfcf') {
    const ctx = renderSystem.ctx;
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const cameraX = renderSystem.cameraX;

    // Draw column by column for accurate rendering
    const columnWidth = 2; // Draw in 2-pixel wide columns for performance

    for (let screenX = 0; screenX < width; screenX += columnWidth) {
      const worldX = screenX + cameraX;
      const floorY = this.getSurfaceY(worldX);
      const ceilingY = this.getCeilingY(worldX);

      const actualFloorY = floorY !== Infinity ? floorY : GROUND_Y;
      const actualCeilingY = Math.max(CEILING_TOP, ceilingY);

      // Draw ceiling column (from top to ceiling line)
      ctx.fillStyle = ceilingColor;
      ctx.fillRect(screenX, 0, columnWidth, actualCeilingY);

      // Draw channel column (from ceiling to floor)
      ctx.fillStyle = channelColor;
      const channelHeight = actualFloorY - actualCeilingY;
      ctx.fillRect(screenX, actualCeilingY, columnWidth, channelHeight);

      // Draw floor column (from floor to bottom)
      ctx.fillStyle = floorColor;
      ctx.fillRect(screenX, actualFloorY, columnWidth, height - actualFloorY);
    }
  },
};
