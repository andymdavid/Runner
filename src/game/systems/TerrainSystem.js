import { CANVAS_HEIGHT, GROUND_Y } from '../../constants';

const BASELINE_Y = CANVAS_HEIGHT - 40;
const CEILING_TOP = 40;

export const TerrainSystem = {
  regions: [],
  overhangs: [],
  tunnels: [],
  ceilingOffsets: [],
  recesses: [],
  floorOffsets: [],
  thickness: 120,
  baseClearance: 220,
  minClearance: 0,
  ceilingDrop: 0,
  ceilingShakeAmplitude: 0,
  ceilingShakeTime: 0,

  init(startY = GROUND_Y) {
    this.regions = [{ points: [{ x: 0, y: startY }] }];
    this.overhangs = [];
    this.tunnels = [];
    this.ceilingOffsets = [];
    this.recesses = [];
    this.floorOffsets = [];
    this.ceilingDrop = 0;
    this.ceilingShakeAmplitude = 0;
    this.ceilingShakeTime = 0;
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
    if (Array.isArray(chunk.recesses)) {
      this.recesses.push(...chunk.recesses);
    }
    if (Array.isArray(chunk.floorOffsets)) {
      this.floorOffsets.push(...chunk.floorOffsets);
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
    // Protect first 4000 pixels (2 full pattern cycles) from pruning
    const PROTECTED_START_ZONE = 4000;

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
    this.recesses = this.recesses.filter((zone) => zone.endX >= cutoff);
    this.ceilingOffsets = this.ceilingOffsets.filter((point) => point.x >= cutoff);
    this.floorOffsets = this.floorOffsets.filter((zone) => zone.endX >= cutoff);

    if (this.regions.length === 0) {
      this.regions = [{ points: [{ x: cutoff, y: GROUND_Y }] }];
    }
  },

  getSurfaceY(x) {
    const floorOffset = this._getFloorOffset(x);

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
          const baseY = p1.y + (p2.y - p1.y) * t;
          return baseY + floorOffset;
        }
      }
    }

    return Infinity;
  },

  _getFloorOffset(x) {
    let offset = 0;
    for (const zone of this.floorOffsets) {
      if (x >= zone.startX && x <= zone.endX) {
        offset = Math.max(offset, zone.offset || 0);
      }
    }
    return offset;
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
    for (const recess of this.recesses) {
      if (x >= recess.startX && x <= recess.endX) {
        clearance = Math.max(clearance, recess.clearance);
      }
    }
    for (const point of this.ceilingOffsets) {
      if (x >= point.x && x <= point.x + 40) {
        clearance = Math.max(clearance, point.offset);
      }
    }

    const floorOffset = this._getFloorOffset(x);
    if (floorOffset) {
      clearance += floorOffset;
    }

    const maxDrop = this._getMaxCollapseDrop();
    const actualDrop = Math.min(this.ceilingDrop, maxDrop);
    clearance = Math.max(this.minClearance, clearance - actualDrop);
    return clearance;
  },

  _getMaxCollapseDrop() {
    let minClearance = this.baseClearance;
    for (const zone of this.overhangs) {
      minClearance = Math.min(minClearance, zone.clearance);
    }
    for (const tunnel of this.tunnels) {
      minClearance = Math.min(minClearance, tunnel.clearance);
    }
    return Math.max(this.minClearance, minClearance);
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

  setCeilingShake(amplitude = 0) {
    this.ceilingShakeAmplitude = Math.max(0, amplitude);
  },

  draw(renderSystem, ceilingColor = '#000000', floorColor = '#000000', channelColor = '#cfcfcf') {
    const ctx = renderSystem.ctx;
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const cameraX = renderSystem.cameraX;

    // Draw column by column for accurate rendering
    const columnWidth = 2; // Draw in 2-pixel wide columns for performance

    if (this.ceilingShakeAmplitude > 0) {
      this.ceilingShakeTime += 0.2;
    } else {
      this.ceilingShakeTime = 0;
    }

    for (let screenX = 0; screenX < width; screenX += columnWidth) {
      const worldX = screenX + cameraX;
      const floorY = this.getSurfaceY(worldX);
      const ceilingY = this.getCeilingY(worldX);

      const actualFloorY = floorY !== Infinity ? floorY : GROUND_Y;
      let actualCeilingY = Math.max(CEILING_TOP, ceilingY);

      if (this.ceilingShakeAmplitude > 0) {
        const phase = Math.floor(this.ceilingShakeTime * 8);
        const blockIndex = Math.floor(worldX / 40);
        const direction = (phase + blockIndex) % 2 === 0 ? 1 : -1;
        const jitter = direction * this.ceilingShakeAmplitude;
        actualCeilingY = Math.max(CEILING_TOP, actualCeilingY + jitter);
      }

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
