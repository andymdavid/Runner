const trackedKeys = ['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'KeyW', 'KeyS'];

export const InputSystem = {
  keys: {},
  _handleKeyDown: null,
  _handleKeyUp: null,
  _onDebugToggle: null,

  init(onDebugToggle = null) {
    if (this._handleKeyDown || this._handleKeyUp) {
      return;
    }

    this._onDebugToggle = onDebugToggle;

    this._handleKeyDown = (event) => {
      if (trackedKeys.includes(event.code)) {
        this.keys[event.code] = true;
      }

      // Toggle debug mode with 'D' key
      if (event.code === 'KeyD' && event.shiftKey && this._onDebugToggle) {
        this._onDebugToggle();
      }
    };

    this._handleKeyUp = (event) => {
      if (trackedKeys.includes(event.code)) {
        this.keys[event.code] = false;
      }
    };

    window.addEventListener('keydown', this._handleKeyDown);
    window.addEventListener('keyup', this._handleKeyUp);
  },

  getSpeedModifier() {
    if (this.keys['ArrowLeft']) {
      return 0.67;
    }

    if (this.keys['ArrowRight']) {
      return 1.65;
    }

    return 1.0;
  },

  getCameraPan() {
    let panX = 0;
    if (this.keys['KeyA']) {
      panX -= 1;
    }
    if (this.keys['KeyD']) {
      panX += 1;
    }
    return panX;
  },

  cleanup() {
    if (this._handleKeyDown) {
      window.removeEventListener('keydown', this._handleKeyDown);
      this._handleKeyDown = null;
    }

    if (this._handleKeyUp) {
      window.removeEventListener('keyup', this._handleKeyUp);
      this._handleKeyUp = null;
    }

    trackedKeys.forEach((key) => {
      this.keys[key] = false;
    });
  }
};
