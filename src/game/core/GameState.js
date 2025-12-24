export const GameState = {
  lives: 3,
  distance: 0,
  isGameOver: false,
  isFinished: false,
  debugMode: false,

  toggleDebugMode() {
    this.debugMode = !this.debugMode;
    console.log(`Debug mode: ${this.debugMode ? 'ON' : 'OFF'}`);
  },

  loseLife() {
    if (this.isGameOver || this.debugMode) return;

    this.lives -= 1;
    if (this.lives <= 0) {
      this.lives = 0;
      this.isGameOver = true;
      console.log('GAME OVER');
    } else {
      console.log(`Lives remaining: ${this.lives}`);
    }
  },

  reset() {
    this.lives = 3;
    this.distance = 0;
    this.isGameOver = false;
    this.isFinished = false;
  },

  updateDistance(playerX) {
    this.distance = Math.max(this.distance, Math.floor(playerX / 10));
  },

  completeLevel() {
    if (this.isGameOver) return;
    this.isFinished = true;
    this.isGameOver = true;
    console.log('LEVEL COMPLETE');
  },
};
