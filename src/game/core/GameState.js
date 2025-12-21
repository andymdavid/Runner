export const GameState = {
  lives: 3,
  distance: 0,
  isGameOver: false,

  loseLife() {
    if (this.isGameOver) return;

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
  },

  updateDistance(playerX) {
    this.distance = Math.max(this.distance, Math.floor(playerX / 10));
  }
};
