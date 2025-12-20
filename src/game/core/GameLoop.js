import { RenderSystem } from '../systems/RenderSystem';
import { PhysicsSystem } from '../systems/PhysicsSystem';
import { CANVAS_WIDTH, GROUND_Y } from '../../constants';
import { Player } from '../entities/Player';

export class GameLoop {
  constructor(canvasContext) {
    this.canvasContext = canvasContext;
    this.lastTime = 0;
    this.animationFrameId = null;
    this.isRunning = false;

    // Initialize RenderSystem
    RenderSystem.init(this.canvasContext);

    // Create player instance
    this.player = new Player();
  }

  start() {
    this.isRunning = true;
    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  gameLoop(currentTime) {
    // Calculate deltaTime
    const deltaTime = currentTime - this.lastTime;

    // Update game state
    this.update(deltaTime);

    // Render game
    this.render();

    // Store current time for next frame
    this.lastTime = currentTime;

    // Continue loop if running
    if (this.isRunning) {
      this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
    }
  }

  update(deltaTime) {
    // Update physics
    PhysicsSystem.update(this.player, deltaTime);
  }

  render() {
    // Clear canvas
    RenderSystem.clear();

    // Draw ground line
    RenderSystem.drawRect(0, GROUND_Y, CANVAS_WIDTH, 100, 'white');

    // Draw player
    RenderSystem.drawRect(
      this.player.position.x - this.player.width / 2,  // center x
      this.player.position.y - this.player.height,      // bottom y
      this.player.width,
      this.player.height,
      'white'
    );
  }
}
