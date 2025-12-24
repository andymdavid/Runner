const PHASE = {
  SAFE: 'safe',
  WARNING: 'warning',
  DESCENDING: 'descending',
  HOLD: 'hold',
  ASCENDING: 'ascending',
};

export const CeilingSystem = {
  PHASE,
  currentPhase: PHASE.SAFE,
  phaseTimer: 0,
  SAFE_DURATION: 5000,
  WARNING_DURATION: 2000,
  DESCEND_DURATION: 250,
  ASCEND_DURATION: 700,
  HOLD_DURATION: 3000,
  DESCEND_DISTANCE: 220,
  currentDrop: 0,
  shakeAmplitude: 6,

  update(ceiling, deltaTime, terrainSystem) {
    this.phaseTimer += deltaTime;

    switch (this.currentPhase) {
      case PHASE.SAFE:
        ceiling.currentColor = ceiling.baseColor;
        this.currentDrop = 0;
        if (terrainSystem) terrainSystem.setCeilingShake(0);
        if (this.phaseTimer >= this.SAFE_DURATION) {
          this._setPhase(PHASE.WARNING);
        }
        break;

      case PHASE.WARNING:
        ceiling.currentColor = (Math.floor(this.phaseTimer / 200) % 2 === 0)
          ? ceiling.warningColor
          : ceiling.baseColor;
        if (terrainSystem) terrainSystem.setCeilingShake(this.shakeAmplitude);

        if (this.phaseTimer >= this.WARNING_DURATION) {
          this._setPhase(PHASE.DESCENDING);
        }
        break;

      case PHASE.DESCENDING: {
        const progress = Math.min(this.phaseTimer / this.DESCEND_DURATION, 1);
        this.currentDrop = progress * this.DESCEND_DISTANCE;
        ceiling.currentColor = ceiling.baseColor;
        if (terrainSystem) terrainSystem.setCeilingShake(0);

        if (this.phaseTimer >= this.DESCEND_DURATION) {
          this._setPhase(PHASE.HOLD);
        }
        break;
      }

      case PHASE.HOLD: {
        this.currentDrop = this.DESCEND_DISTANCE;
        if (terrainSystem) terrainSystem.setCeilingShake(0);
        if (this.phaseTimer >= this.HOLD_DURATION) {
          this._setPhase(PHASE.ASCENDING);
        }
        break;
      }

      case PHASE.ASCENDING: {
        const progress = Math.min(this.phaseTimer / this.ASCEND_DURATION, 1);
        this.currentDrop = (1 - progress) * this.DESCEND_DISTANCE;
        if (terrainSystem) terrainSystem.setCeilingShake(0);

        if (this.phaseTimer >= this.ASCEND_DURATION) {
          this.currentDrop = 0;
          ceiling.currentColor = ceiling.baseColor;
          this._setPhase(PHASE.SAFE);
        }
        break;
      }

      default:
        break;
    }

        if (terrainSystem) {
      terrainSystem.setCeilingDrop(this.currentDrop);
    }
  },

  _setPhase(phase) {
    this.currentPhase = phase;
    this.phaseTimer = 0;
  },

  isCeilingLow() {
    return this.currentPhase === PHASE.DESCENDING || this.currentPhase === PHASE.HOLD;
  },

  isCeilingSafe() {
    return this.currentPhase === PHASE.SAFE;
  },

};
