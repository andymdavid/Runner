import { RenderSystem } from '../systems/RenderSystem';
import { PhysicsSystem } from '../systems/PhysicsSystem';
import { InputSystem } from '../systems/InputSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { CeilingSystem } from '../systems/CeilingSystem';
import { TerrainSystem } from '../systems/TerrainSystem';
import { GameState } from './GameState';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y } from '../../constants';
import { Player } from '../entities/Player';
import { Ceiling } from '../entities/Ceiling';
import { AnimationController } from '../animation/AnimationController';
import { LevelGenerator } from '../levels/LevelGenerator';

export class GameLoop {
  constructor(canvasContext) {
    this.canvasContext = canvasContext;
    this.lastTime = null;
    this.animationFrameId = null;
    this.isRunning = false;
    this.maxDelta = 100; // cap delta to avoid giant physics steps
    this.loopCallback = this.gameLoop.bind(this);

    // Initialize RenderSystem
    RenderSystem.init(this.canvasContext);

    // Create player instance
    this.player = new Player();

    TerrainSystem.init(GROUND_Y);
    this.nextChunkX = 0;
    this.terrainEndY = GROUND_Y;

    for (let i = 0; i < 3; i += 1) {
      this.generateNextChunk();
    }

    this.snapPlayerToTerrain();

    this.ceiling = new Ceiling();
    this.showCrushMessage = false;
    this.crushMessageTimer = 0;

    InputSystem.init();
  }

  start() {
    this.isRunning = true;
    this.lastTime = null; // force seeding on first frame
    this.animationFrameId = requestAnimationFrame(this.loopCallback);
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.animationFrameId = null;
    this.lastTime = null;
  }

  gameLoop(currentTime) {
    if (!this.isRunning) {
      return;
    }

    // Seed lastTime before processing the first frame after start/resume
    if (this.lastTime === null) {
      this.lastTime = currentTime;
      this.animationFrameId = requestAnimationFrame(this.loopCallback);
      return;
    }

    // Calculate deltaTime
    const deltaTimeRaw = currentTime - this.lastTime;
    const deltaTime = Math.min(deltaTimeRaw, this.maxDelta);

    // Update game state
    this.update(deltaTime);

    // Render game
    this.render();

    // Store current time for next frame
    this.lastTime = currentTime;

    // Continue loop if running
    if (this.isRunning) {
      this.animationFrameId = requestAnimationFrame(this.loopCallback);
    }
  }

  update(deltaTime) {
    if (GameState.isGameOver) {
      return;
    }

    const speedModifier = InputSystem.getSpeedModifier();
    this.player.velocity.x = this.player.baseSpeed * speedModifier;
    this.player.previousPosition = { ...this.player.position };
    AnimationController.update(this.player, deltaTime);

    // Update physics
    PhysicsSystem.update(this.player, deltaTime);

    CollisionSystem.resolveTerrainCollision(this.player);

    if (this.player.position.y > CANVAS_HEIGHT + 100) {
      GameState.loseLife();
      this.player.reset();
      this.snapPlayerToTerrain();
    }

    GameState.updateDistance(this.player.position.x);

    CeilingSystem.update(this.ceiling, deltaTime, TerrainSystem);

    if (this.player.position.x + CANVAS_WIDTH > this.nextChunkX) {
      this.generateNextChunk();
    }

    TerrainSystem.prune(this.player.position.x);

    if (CollisionSystem.checkCeilingCollision(this.player)) {
      GameState.loseLife();
      this.player.reset();
      this.snapPlayerToTerrain();
      this.showCrushMessage = true;
      this.crushMessageTimer = 1000;
    }

    if (this.showCrushMessage) {
      this.crushMessageTimer -= deltaTime;
      if (this.crushMessageTimer <= 0) {
        this.showCrushMessage = false;
      }
    }

    const targetCameraX = this.player.position.x - CANVAS_WIDTH / 2;
    RenderSystem.setCameraX(targetCameraX);
  }

  render() {
    // Clear canvas
    RenderSystem.clear();

    const ceilingColor = GameState.isGameOver ? '#000000' : '#000000';
    TerrainSystem.draw(RenderSystem, ceilingColor, '#000000', '#cfcfcf');

    AnimationController.draw(RenderSystem.ctx, this.player, RenderSystem.cameraX);

    RenderSystem.ctx.fillStyle = 'white';
    RenderSystem.ctx.font = '20px Arial';
    RenderSystem.ctx.fillText(`Lives: ${GameState.lives}`, 10, 30);
    RenderSystem.ctx.fillText(`Distance: ${GameState.distance}m`, 10, 60);

    if (GameState.isGameOver) {
      RenderSystem.ctx.fillStyle = 'red';
      RenderSystem.ctx.font = '48px Arial';
      RenderSystem.ctx.fillText('GAME OVER', CANVAS_WIDTH / 2 - 120, CANVAS_HEIGHT / 2);
    }

    if (this.showCrushMessage) {
      RenderSystem.ctx.fillStyle = 'red';
      RenderSystem.ctx.font = '36px Arial';
      RenderSystem.ctx.fillText('CRUSHED!', CANVAS_WIDTH / 2 - 80, CANVAS_HEIGHT / 2);
    }
  }

  generateNextChunk() {
    const difficulty = LevelGenerator.getDifficulty(this.nextChunkX);
    const chunk = LevelGenerator.generateChunk(this.nextChunkX, this.terrainEndY, difficulty);
    TerrainSystem.addChunk(chunk);
    this.nextChunkX = chunk.endX;
    this.terrainEndY = chunk.endPoint.y;
  }

  snapPlayerToTerrain() {
    const surfaceY = Math.round(TerrainSystem.getSurfaceY(this.player.position.x));
    if (surfaceY !== Infinity) {
      this.player.position.y = surfaceY;
      this.player.velocity.y = 0;
    }
  }
}
