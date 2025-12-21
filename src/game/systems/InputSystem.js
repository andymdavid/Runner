const trackedKeys = ['ArrowLeft', 'ArrowRight'];

export const InputSystem = {
  keys: {},
  _handleKeyDown: null,
  _handleKeyUp: null,

  init() {
    if (this._handleKeyDown || this._handleKeyUp) {
      return;
    }

    this._handleKeyDown = (event) => {
      if (trackedKeys.includes(event.code)) {
        this.keys[event.code] = true;
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
      return 0.5;
    }

    if (this.keys['ArrowRight']) {
      return 1.8;
    }

    return 1.0;
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
