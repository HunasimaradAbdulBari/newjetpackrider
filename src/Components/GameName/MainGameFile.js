'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';

const QUESTIONS = [
  { "question": "Which of the following is a feature of Core Java?", "answers": ["Platform Dependent", "Object-Oriented", "No Memory Management", "No Inheritance"], "correctAnswer": "Object-Oriented" },
  { "question": "Which keyword is used to inherit a class in Java?", "answers": ["this", "super", "extends", "implements"], "correctAnswer": "extends" },
  { "question": "What is the SI unit of force?", "answers": ["Newton", "Joule", "Watt", "Pascal"], "correctAnswer": "Newton" },
  { "question": "Which process do green plants use to make food using sunlight?", "answers": ["Photosynthesis", "Respiration", "Transpiration", "Osmosis"], "correctAnswer": "Photosynthesis" },
  { "question": "What is the pH value of pure neutral water at 25°C?", "answers": ["7", "0", "14", "10"], "correctAnswer": "7" },
  { "question": "Which formula gives the area of a circle?", "answers": ["πr²", "2πr", "πd", "r²"], "correctAnswer": "πr²" },
  { "question": "What does CPU stand for in computer science?", "answers": ["Central Processing Unit", "Central Program Unit", "Control Processing Unit", "Computer Processing Unit"], "correctAnswer": "Central Processing Unit" },
  { "question": "Which is the largest ocean on Earth?", "answers": ["Indian Ocean", "Atlantic Ocean", "Pacific Ocean", "Arctic Ocean"], "correctAnswer": "Pacific Ocean" },
  { "question": "Who led the Salt March in India in 1930?", "answers": ["Jawaharlal Nehru", "Subhas Chandra Bose", "Mahatma Gandhi", "Sardar Patel"], "correctAnswer": "Mahatma Gandhi" },
  { "question": "Which of the following words is a pronoun?", "answers": ["They", "Run", "Beautiful", "Quickly"], "correctAnswer": "They" }
];

const MainGameFile = () => {
  const gameRef = useRef(null);
  const phaserGameRef = useRef(null);
  const [gameLoaded, setGameLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isPauseVisible, setIsPauseVisible] = useState(true);

  useEffect(() => { setMounted(true); }, []);

  const handleHomeClick = useCallback(() => {
    if (typeof window !== 'undefined' && mounted) window.location.href = '/';
  }, [mounted]);

  const handleRestartClick = useCallback(() => {
    if (phaserGameRef.current && mounted) {
      try {
        const scene = phaserGameRef.current.scene.getScene('JetpackGameScene');
        if (scene) scene.scene.restart({ questions: QUESTIONS });
      } catch (error) {
        console.error('Error restarting game:', error);
        setError('Failed to restart game. Please reload the page.');
      }
    }
  }, [mounted]);

  const handleReloadClick = useCallback(() => {
    if (typeof window !== 'undefined' && mounted) window.location.reload();
  }, [mounted]);

  const handlePauseToggle = useCallback(() => {
    if (phaserGameRef.current) {
      const scene = phaserGameRef.current.scene.getScene('JetpackGameScene');
      if (scene) {
        if (isPaused) {
          scene.scene.resume();
          setIsPaused(false);
        } else {
          scene.scene.pause();
          setIsPaused(true);
        }
      }
    }
  }, [isPaused]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && phaserGameRef.current && !isPaused) {
        const scene = phaserGameRef.current.scene.getScene('JetpackGameScene');
        if (scene && scene.scene.isActive()) {
          scene.scene.pause();
          setIsPaused(true);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPaused]);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    if (phaserGameRef.current) return;

    const initGame = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await loadPhaserFromCDN();
        await loadGSAPFromCDN();

        const RedesignedJetpackScene = createRedesignedJetpackScene();
        const config = {
          type: window.Phaser.AUTO, 
          width: window.innerWidth < 768 ? window.innerWidth : 1400, 
          height: window.innerHeight < 500 ? window.innerHeight : 700, 
          parent: gameRef.current,
          backgroundColor: '#0a0a0f',
          physics: { default: 'arcade', arcade: { gravity: { y: 800 }, debug: false } },
          scene: RedesignedJetpackScene,
          scale: { 
            mode: window.Phaser.Scale.FIT, 
            autoCenter: window.Phaser.Scale.CENTER_BOTH, 
            min: { width: 320, height: 400 }, 
            max: { width: 1920, height: 1080 }
          }
        };

        const game = new window.Phaser.Game(config);
        phaserGameRef.current = game;

        setTimeout(() => {
          try {
            const scene = game.scene.getScene('JetpackGameScene');
            if (scene && scene.scene) {
              scene.setPauseVisibilityCallback = setIsPauseVisible;
              scene.scene.restart({ questions: QUESTIONS });
            }
            setGameLoaded(true);
            setIsLoading(false);
          } catch (err) {
            console.error('Error initializing scene:', err);
            setError('Failed to initialize game scene. Please try reloading.');
            setIsLoading(false);
          }
        }, 1000);
      } catch (err) {
        console.error('Failed to initialize game:', err);
        setError(`Failed to load game: ${err || 'Unknown error'}. Please refresh the page.`);
        setIsLoading(false);
      }
    };

    initGame();

    return () => {
      if (phaserGameRef.current) {
        try {
          phaserGameRef.current.destroy(true);
          phaserGameRef.current = null;
        } catch (error) {
          console.warn('Error destroying Phaser game:', error);
        }
      }
    };
  }, [mounted]);

  const loadPhaserFromCDN = () => {
    return new Promise((resolve, reject) => {
      if (window.Phaser) { resolve(); return; }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Phaser from CDN'));
      document.head.appendChild(script);
    });
  };

  const loadGSAPFromCDN = () => {
    return new Promise((resolve, reject) => {
      if (window.gsap) { resolve(); return; }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load GSAP from CDN'));
      document.head.appendChild(script);
    });
  };

  const createRedesignedJetpackScene = () => {
    return class JetpackGameScene extends window.Phaser.Scene {
      constructor() {
        super({ key: 'JetpackGameScene' });
        this.lives = 3; this.score = 0; this.distance = 0; this.questionIndex = 0;
        this.obstaclesPassed = 0; this.correctAnswers = 0; this.wrongAnswers = 0;
        this.gameState = 'PLAYING'; this.isInvulnerable = false; this.invulnerabilityTimer = null;
        this.jetpackActive = false; this.jetpackFuel = 100; this.maxJetpackFuel = 100;
        this.fuelConsumptionRate = 0.8; this.fuelRechargeRate = 0.6; this.scrollSpeed = 200;
        this.normalScrollSpeed = 200; this.questionScrollSpeed = 200 / 1.1;
        this.hasStartedFlying = false; this.hoverTargetY = 540; this.isHovering = false;
        this.player = null; this.background = null; this.jetpackParticles = []; this.hoverParticles = [];
        this.questionCoins = []; this.heartIcons = []; this.scoreText = null; this.distanceText = null;
        this.progressText = null; this.questionText = null; this.questionContainer = null;
        this.questionNumberText = null; this.fuelBar = null; this.fuelBarBg = null;
        this.cursors = null; this.spaceKey = null; this.questions = []; this.currentQuestionElements = [];
        this.currentInstructionText = null; this.answerProcessed = false; this.questionTimeout = null;
        this.questionTimeLimit = 15000; this.nextQuestionDistance = 75; this.questionInterval = 30;
        this.setPauseVisibilityCallback = null; this.scaleFactor = Math.min(window.innerWidth / 1400, window.innerHeight / 700);
      }

      init(data) {
        this.questions = data?.questions || QUESTIONS;
        Object.assign(this, { lives: 3, score: 0, distance: 0, questionIndex: 0, obstaclesPassed: 0, correctAnswers: 0, wrongAnswers: 0, gameState: 'PLAYING', isInvulnerable: false, invulnerabilityTimer: null, jetpackActive: false, jetpackFuel: 100, jetpackParticles: [], hoverParticles: [], questionCoins: [], currentQuestionElements: [], currentInstructionText: null, answerProcessed: false, hasStartedFlying: false, isHovering: false, hoverTargetY: 540, questionTimeout: null, nextQuestionDistance: 75, questionInterval: 30 });
        this.scrollSpeed = this.normalScrollSpeed;
        if (this.setPauseVisibilityCallback) this.setPauseVisibilityCallback(true);
      }

      preload() { this.createRedesignedAssets(); }

      createRedesignedAssets() {
        // Player texture
        const playerGraphics = this.add.graphics();
        playerGraphics.fillStyle(0x2E86AB, 1); playerGraphics.fillRoundedRect(15, 25, 35, 40, 8);
        playerGraphics.fillStyle(0x74D3AE, 0.9); playerGraphics.fillCircle(32, 35, 12);
        playerGraphics.fillStyle(0xA23B72, 0.8); playerGraphics.fillCircle(32, 35, 8);
        playerGraphics.fillStyle(0xF18F01, 1); playerGraphics.fillRoundedRect(5, 40, 20, 8, 4); playerGraphics.fillRoundedRect(40, 40, 20, 8, 4);
        playerGraphics.fillStyle(0xC73E1D, 1); playerGraphics.fillRoundedRect(20, 65, 8, 15, 4); playerGraphics.fillRoundedRect(37, 65, 8, 15, 4);
        playerGraphics.fillStyle(0xFF6B35, 1); playerGraphics.fillCircle(24, 75, 3); playerGraphics.fillCircle(41, 75, 3);
        playerGraphics.generateTexture('redesigned-jetpack-player', 65, 85); playerGraphics.destroy();

        // SVG Heart icons
        const createHeartTexture = (type, svg) => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 42; canvas.height = 42;
          const img = new Image();
          img.onload = () => { ctx.drawImage(img, 0, 0); this.textures.addCanvas(type, canvas); };
          img.src = 'data:image/svg+xml;base64,' + btoa(svg);
        };
        
        createHeartTexture('full-heart', `<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" fill="red" viewBox="0 0 24 24"><path d="m12.75 20.66 6.184-7.098c2.677-2.884 2.559-6.506.754-8.705-.898-1.095-2.206-1.816-3.72-1.855-1.293-.034-2.652.43-3.963 1.442-1.315-1.012-2.678-1.476-3.973-1.442-1.515.04-2.825.76-3.724 1.855-1.806 2.201-1.915 5.823.772 8.706l6.183 7.097c.19.216.46.34.743.34a.985.985 0 0 0 .743-.34Z"/></svg>`);
        setTimeout(() => createHeartTexture('empty-heart', `<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" fill="none" viewBox="0 0 24 24"><path stroke="red" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12.01 6.001C6.5 1 1 8 5.782 13.001L12.011 20l6.23-7C23 8 17.5 1 12.01 6.002Z"/></svg>`), 100);

        // Question coin
        const questionCoinGraphics = this.add.graphics();
        questionCoinGraphics.lineStyle(4, 0xEAB308, 1); questionCoinGraphics.fillStyle(0xFDE047, 1);
        questionCoinGraphics.fillCircle(24, 24, 22); questionCoinGraphics.strokeCircle(24, 24, 22);
        questionCoinGraphics.generateTexture('question-coin', 48, 48); questionCoinGraphics.destroy();

        // Background texture
        const gameWidth = this.sys.canvas.width; const gameHeight = this.sys.canvas.height;
        const bgGraphics = this.add.graphics();
        bgGraphics.fillGradientStyle(0x0B1426, 0x1A2332, 0x2D3748, 0x4A5568, 1);
        bgGraphics.fillRect(0, 0, gameWidth, gameHeight);
        for (let i = 0; i < 80; i++) {
          const x = Math.random() * gameWidth, y = Math.random() * (gameHeight * 0.4), a = Math.random();
          if (a > 0.7) { bgGraphics.fillStyle(0xFFFFFF, a); bgGraphics.fillCircle(x, y, a > 0.9 ? 3 : 1); }
        }
        const cityColor = 0x1A202C, buildingWidth = 80, buildingSpacing = 20, minHeight = gameHeight * 0.2, maxHeight = gameHeight * 0.4;
        for (let x = 0; x <= gameWidth; x += buildingWidth + buildingSpacing) {
          const h = window.Phaser.Math.Between(minHeight, maxHeight);
          bgGraphics.fillStyle(cityColor, 1); bgGraphics.fillRoundedRect(x, gameHeight - h, buildingWidth, h, 5);
          const windowSize = 8, sx = 18, sy = 25, rows = Math.floor(h / (windowSize + sy)), cols = Math.floor(buildingWidth / (windowSize + sx));
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              if (window.Phaser.Math.Between(0, 100) > 40) {
                const wx = x + 10 + c * sx, wy = gameHeight - h + 20 + r * sy;
                bgGraphics.fillStyle(0xFED7AA, 0.9); bgGraphics.fillRoundedRect(wx, wy, windowSize, windowSize, 2);
              }
            }
          }
        }
        bgGraphics.generateTexture('redesigned-cityscape-background', gameWidth, gameHeight); bgGraphics.destroy();
      }

      create() {
        this.physics.world.setBounds(0, 0, this.sys.canvas.width, this.sys.canvas.height);
        this.createScrollingBackground(); this.createRedesignedPlayer(); this.createRedesignedUI(); this.setupInput();
      }

      createScrollingBackground() {
        this.background = this.add.tileSprite(0, 0, this.sys.canvas.width, this.sys.canvas.height, 'redesigned-cityscape-background');
        this.background.setOrigin(0, 0);
      }

      createRedesignedPlayer() {
        const playerX = this.sys.canvas.width * 0.1; const playerY = this.sys.canvas.height * 0.5;
        this.player = this.physics.add.sprite(playerX, playerY, 'redesigned-jetpack-player');
        this.player.setCollideWorldBounds(true); this.player.setBounce(0.1); this.player.setScale(0.8 * this.scaleFactor);
        this.player.setSize(50, 65); this.player.setGravityY(0); this.player.setTint(0xFFFFFF);
        this.hoverTargetY = this.sys.canvas.height * 0.77;
      }

      createRedesignedUI() {
        this.createHeartIcons();
        const fontSize = Math.max(16, 22 * this.scaleFactor);
        this.scoreText = this.add.text(30, 65, 'Score: ' + this.score, { fontSize: fontSize + 'px', fill: '#68D391', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' });
        this.createHorizontalFuelBar();
      }

      createHeartIcons() {
        this.heartIcons = [];
        for (let i = 0; i < 3; i++) {
          const heart = this.add.image(30 + (i * 45 * this.scaleFactor), 35, 'full-heart');
          heart.setScale(0.8 * this.scaleFactor); this.heartIcons.push(heart);
        }
      }

      updateHeartIcons() {
        for (let i = 0; i < 3; i++) {
          this.heartIcons[i].setTexture(i < this.lives ? 'full-heart' : 'empty-heart');
        }
      }

      createHorizontalFuelBar() {
        const barWidth = this.sys.canvas.width;
        this.fuelBarBg = this.add.rectangle(barWidth/2, 5, barWidth, 4, 0x2D3748); this.fuelBarBg.setOrigin(0.5, 0);
        this.fuelBar = this.add.rectangle(0, 5, barWidth, 4, 0x68D391); this.fuelBar.setOrigin(0, 0);
      }

      setFuelBarVisible(visible) {
        if (!this.fuelBarBg || !this.fuelBar) return;
        this.fuelBarBg.setVisible(visible); this.fuelBar.setVisible(visible);
      }

      setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(window.Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.input.on('pointerdown', (pointer) => {
          this.jetpackActive = true;
          const ripple = this.add.circle(pointer.x, pointer.y, 8, 0x68D391, 0.7);
          this.tweens.add({ targets: ripple, radius: 40, alpha: 0, duration: 400, ease: 'Power2', onComplete: () => ripple.destroy() });
        });
        this.input.on('pointerup', () => { this.jetpackActive = false; });
      }

      update() {
        if (this.spaceKey.isDown || this.jetpackActive) {
          if (!this.hasStartedFlying) this.hasStartedFlying = true;
          if (this.jetpackFuel > 0) {
            this.isHovering = false; this.player.setVelocityY(-320);
            this.jetpackFuel = Math.max(0, this.jetpackFuel - this.fuelConsumptionRate);
            this.createJetpackParticles(); this.player.rotation = -0.2; this.player.setTint(0xAADDFF);
          }
        } else {
          if (this.hasStartedFlying) {
            this.isHovering = true;
            const targetY = this.hoverTargetY, currentY = this.player.y, diff = targetY - currentY;
            if (Math.abs(diff) > 5) {
              this.player.setVelocityY(diff * 2.5);
            } else {
              this.player.setVelocityY(0); this.createHoverParticles(); this.createContinuousFireEffect();
              if (Math.random() < 0.1) this.player.y += Math.sin(this.time.now * 0.005) * 0.5;
            }
          } else {
            this.player.setVelocityY(80);
          }
          this.jetpackFuel = Math.min(this.maxJetpackFuel, this.jetpackFuel + this.fuelRechargeRate);
          this.player.rotation = Math.min(0.3, this.player.body.velocity.y * 0.001); this.player.setTint(0xFFFFFF);
        }

        this.updateFuelBar();
        if (this.gameState === 'PLAYING') {
          this.scrollSpeed = this.normalScrollSpeed; this.scrollBackground(); this.distance += 0.12;
        } else if (this.gameState === 'QUESTION_ACTIVE') {
          this.scrollSpeed = this.questionScrollSpeed; this.scrollBackground(); this.distance += 0.12 / 1.1;
        }
        this.cleanupObjects();
        if (this.gameState === 'PLAYING') this.checkQuestionTrigger();
        this.updateUI(); this.updateParticles();
        if (this.gameState === 'QUESTION_ACTIVE') {
          this.updateMovingQuestionCoins(); this.checkCoinCollisions();
        }
      }

      createJetpackParticles() {
        [-8, 8].forEach(offset => {
          for (let i = 0; i < 2; i++) {
            const particle = this.add.circle(
              this.player.x + offset + window.Phaser.Math.Between(-3, 3),
              this.player.y + 40, window.Phaser.Math.Between(2, 4),
              window.Phaser.Math.RND.pick([0xF56565, 0xF6AD55, 0xFED7AA]), 0.8
            );
            this.jetpackParticles.push(particle);
            this.tweens.add({
              targets: particle,
              x: particle.x + window.Phaser.Math.Between(-8, 8),
              y: particle.y + window.Phaser.Math.Between(25, 45),
              alpha: 0, scale: 0.2, duration: 400, ease: 'Power2',
              onComplete: () => { if (particle.active) particle.destroy(); this.jetpackParticles = this.jetpackParticles.filter(p => p !== particle); }
            });
          }
        });
      }

      createHoverParticles() {
        if (Math.random() < 0.3) {
          [-8, 8].forEach(offset => {
            const particle = this.add.circle(
              this.player.x + offset + window.Phaser.Math.Between(-2, 2),
              this.player.y + 40, window.Phaser.Math.Between(1, 2),
              window.Phaser.Math.RND.pick([0xF6AD55, 0xFED7AA]), 0.4
            );
            this.hoverParticles.push(particle);
            this.tweens.add({
              targets: particle,
              x: particle.x + window.Phaser.Math.Between(-5, 5),
              y: particle.y + window.Phaser.Math.Between(15, 25),
              alpha: 0, scale: 0.1, duration: 600, ease: 'Power1',
              onComplete: () => { if (particle.active) particle.destroy(); this.hoverParticles = this.hoverParticles.filter(p => p !== particle); }
            });
          });
        }
      }

      createContinuousFireEffect() {
        if (Math.random() < 0.6) {
          [-8, 8].forEach(offset => {
            const fire = this.add.circle(
              this.player.x + offset + window.Phaser.Math.Between(-1, 1),
              this.player.y + 38, window.Phaser.Math.Between(1, 2),
              window.Phaser.Math.RND.pick([0xFF6B35, 0xF56565]), 0.7
            );
            this.jetpackParticles.push(fire);
            this.tweens.add({
              targets: fire,
              x: fire.x + window.Phaser.Math.Between(-3, 3),
              y: fire.y + window.Phaser.Math.Between(8, 15),
              alpha: 0, scale: 0.1, duration: 250, ease: 'Power1',
              onComplete: () => { if (fire.active) fire.destroy(); this.jetpackParticles = this.jetpackParticles.filter(p => p !== fire); }
            });
          });
        }
      }

      updateFuelBar() {
        const fuelPercent = this.jetpackFuel / this.maxJetpackFuel;
        this.fuelBar.displayWidth = fuelPercent * this.sys.canvas.width;
        this.fuelBar.setFillStyle(fuelPercent > 0.6 ? 0x68D391 : fuelPercent > 0.3 ? 0xF6AD55 : 0xF56565);
      }

      scrollBackground() { if (this.background) this.background.tilePositionX += this.scrollSpeed * 0.015; }

      cleanupObjects() {
        this.questionCoins = this.questionCoins.filter(coin => {
          if (coin.sprite.x < -100) {
            coin.sprite.destroy(); if (coin.label) coin.label.destroy(); return false;
          }
          return true;
        });
      }

      checkQuestionTrigger() { if (this.distance >= this.nextQuestionDistance) this.showRedesignedQuestion(); }

      updateParticles() {
        this.jetpackParticles = this.jetpackParticles.filter(particle => particle && particle.active);
        this.hoverParticles = this.hoverParticles.filter(particle => particle && particle.active);
      }

      updateUI() { this.updateHeartIcons(); this.scoreText.setText('Score: ' + this.score); }

      showRedesignedQuestion() {
        if (this.questionIndex >= this.questions.length) { this.showResults(); return; }
        const question = this.questions[this.questionIndex];
        if (!question) { this.showResults(); return; }
        this.gameState = 'QUESTION_ACTIVE'; this.answerProcessed = false;
        this.showStaticQuestionUI(question);
        this.time.delayedCall(1000, () => { this.spawnMovingCoins(question); this.startQuestionTimeout(); });
      }

      startQuestionTimeout() {
        if (this.questionTimeout) this.questionTimeout.remove();
        this.questionTimeout = this.time.delayedCall(this.questionTimeLimit, () => {
          if (this.gameState === 'QUESTION_ACTIVE' && !this.answerProcessed) this.handleQuestionSkipped();
        });
      }

      handleQuestionSkipped() {
        this.answerProcessed = true; this.lives--; this.wrongAnswers++; this.questionIndex++;
        this.cameras.main.shake(400, 0.02);
        const skipText = this.add.text(this.player.x, this.player.y - 50, 'SKIPPED! -1 LIFE', { fontSize: (28 * this.scaleFactor) + 'px', fill: '#F56565', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);
        this.tweens.add({ targets: skipText, y: skipText.y - 60, alpha: 0, duration: 1400, onComplete: () => skipText.destroy() });
        this.nextQuestionDistance = this.distance + this.questionInterval;
        if (this.lives <= 0) {
          this.gameState = 'GAME_OVER'; this.time.delayedCall(1800, () => this.gameOver());
        } else {
          this.time.delayedCall(3000, () => this.hideQuestion());
        }
      }

      showStaticQuestionUI(question) {
        const maxTextLength = Math.max(...question.answers.map(a => a.length));
        const useVerticalLayout = maxTextLength > 25;
        const containerHeight = useVerticalLayout ? 250 * this.scaleFactor : 180 * this.scaleFactor;
        const containerWidth = 800 * this.scaleFactor;
        const containerY = 20 + containerHeight/2;
        
        this.questionContainer = this.add.rectangle(this.sys.canvas.width/2, containerY, containerWidth, containerHeight, 0x2D3748, 0.95);
        this.questionContainer.setStrokeStyle(2, 0x68D391);
        const questionFontSize = Math.max(14, 18 * this.scaleFactor);
        this.questionText = this.add.text(this.sys.canvas.width/2, containerY - containerHeight/2 + 40, question.question, { fontSize: questionFontSize + 'px', fill: '#E2E8F0', align: 'center', fontWeight: 'bold', wordWrap: { width: 750 * this.scaleFactor }, fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);

        const answerLabels = ['A', 'B', 'C', 'D'], answerElements = [];
        if (useVerticalLayout) {
          for (let i = 0; i < question.answers.length; i++) {
            const yPos = containerY - containerHeight/2 + 100 + (i * 45 * this.scaleFactor);
            const optionBg = this.add.rectangle(this.sys.canvas.width/2, yPos, 750 * this.scaleFactor, 40 * this.scaleFactor, 0x1A202C, 0.6);
            optionBg.setStrokeStyle(1, 0x68D391, 0.5);
            const labelFontSize = Math.max(16, 20 * this.scaleFactor);
            const answerFontSize = Math.max(12, 14 * this.scaleFactor);
            const label = this.add.text(this.sys.canvas.width/2 - 200 * this.scaleFactor, yPos, answerLabels[i], { fontSize: labelFontSize + 'px', fill: '#F6AD55', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);
            const answerText = this.add.text(this.sys.canvas.width/2, yPos, question.answers[i], { fontSize: answerFontSize + 'px', fill: '#E2E8F0', align: 'center', fontWeight: 'bold', wordWrap: { width: 600 * this.scaleFactor }, fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);
            answerElements.push({ bg: optionBg, label, text: answerText, index: i, answer: question.answers[i] });
          }
        } else {
          const positions = [
            { x: this.sys.canvas.width/2 - 120 * this.scaleFactor, y: containerY - containerHeight/2 + 90 }, 
            { x: this.sys.canvas.width/2 + 120 * this.scaleFactor, y: containerY - containerHeight/2 + 90 }, 
            { x: this.sys.canvas.width/2 - 120 * this.scaleFactor, y: containerY - containerHeight/2 + 140 }, 
            { x: this.sys.canvas.width/2 + 120 * this.scaleFactor, y: containerY - containerHeight/2 + 140 }
          ];
          for (let i = 0; i < question.answers.length; i++) {
            const pos = positions[i];
            const optionBg = this.add.rectangle(pos.x, pos.y, 200 * this.scaleFactor, 45 * this.scaleFactor, 0x1A202C, 0.6);
            optionBg.setStrokeStyle(1, 0x68D391, 0.5);
            const labelFontSize = Math.max(14, 18 * this.scaleFactor);
            const answerFontSize = Math.max(10, 12 * this.scaleFactor);
            const label = this.add.text(pos.x - 80 * this.scaleFactor, pos.y, answerLabels[i], { fontSize: labelFontSize + 'px', fill: '#F6AD55', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);
            const answerText = this.add.text(pos.x, pos.y, question.answers[i], { fontSize: answerFontSize + 'px', fill: '#E2E8F0', align: 'center', fontWeight: 'bold', wordWrap: { width: 150 * this.scaleFactor }, fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);
            answerElements.push({ bg: optionBg, label, text: answerText, index: i, answer: question.answers[i] });
          }
        }
        this.currentQuestionElements = [this.questionContainer, this.questionText, ...answerElements.flatMap(e => [e.bg, e.label, e.text])];
        this.currentAnswerElements = answerElements;
      }

      spawnMovingCoins(question) {
        this.questionCoins = [];
        const coinSpeed = -182.8125, answerLabels = ['A', 'B', 'C', 'D'];
        const verticalSpacing = 70 * this.scaleFactor, staircaseOffsets = [{ x: 0, y: 0 }, { x: 80, y: verticalSpacing }, { x: 170, y: verticalSpacing * 2 }, { x: 230, y: verticalSpacing * 3 }];
        const baseY = this.sys.canvas.height * 0.5;

        for (let i = 0; i < question.answers.length; i++) {
          const startX = this.sys.canvas.width + 100 + staircaseOffsets[i].x, yPos = baseY + staircaseOffsets[i].y;
          const coinSprite = this.add.sprite(startX, yPos, 'question-coin'); coinSprite.setScale(1.0 * this.scaleFactor);
          const coinLabelFontSize = Math.max(14, 18 * this.scaleFactor);
          const coinLabel = this.add.text(startX, yPos, answerLabels[i], { fontSize: coinLabelFontSize + 'px', fill: '#A16207', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);
          const coinData = { sprite: coinSprite, label: coinLabel, answerIndex: i, answerText: question.answers[i], speed: coinSpeed, isActive: true };
          this.questionCoins.push(coinData);
          this.tweens.add({ targets: coinSprite, scaleX: (1.1 * this.scaleFactor), scaleY: (1.1 * this.scaleFactor), duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        }
        this.hoverTargetY = baseY + staircaseOffsets[3].y;
        this.time.delayedCall(800, () => this.showCleanInstruction());
      }

      updateMovingQuestionCoins() {
        if (this.gameState !== 'QUESTION_ACTIVE') return;
        const dt = this.game.loop.delta / 1000;
        this.questionCoins.forEach(coin => {
          if (!coin.isActive) return;
          coin.sprite.x += coin.speed * dt; coin.label.x += coin.speed * dt;
          if (coin.sprite.x < -100) coin.isActive = false;
        });
      }

      checkCoinCollisions() {
        if (this.gameState !== 'QUESTION_ACTIVE' || !this.player || this.answerProcessed) return;
        const playerBounds = this.player.getBounds();
        this.questionCoins.forEach((coin, index) => {
          if (!coin.isActive) return;
          const coinBounds = coin.sprite.getBounds();
          const hit = playerBounds.x < coinBounds.x + coinBounds.width && playerBounds.x + playerBounds.width > coinBounds.x && playerBounds.y < coinBounds.y + coinBounds.height && playerBounds.y + playerBounds.height > coinBounds.y;
          if (hit) { this.selectCoinAnswer(index); return; }
        });
      }

      selectCoinAnswer(coinIndex) {
        if (this.answerProcessed) return;
        const coinData = this.questionCoins[coinIndex];
        if (!coinData || !coinData.isActive) return;
        this.answerProcessed = true;
        if (this.questionTimeout) { this.questionTimeout.remove(); this.questionTimeout = null; }
        const question = this.questions[this.questionIndex], selectedAnswer = coinData.answerText, isCorrect = selectedAnswer === question.correctAnswer;
        this.animateCoinDisappear(coinData);
        if (isCorrect) this.handleCorrectAnswer(coinIndex); else this.handleWrongAnswer(coinIndex, question.correctAnswer);
      }

      animateCoinDisappear(coinData) {
        if (window.gsap) {
          window.gsap.to([coinData.sprite, coinData.label], { duration: 0.6, scale: 0, rotation: Math.PI * 2, alpha: 0, ease: "bounce.out", onComplete: () => { if (coinData.sprite.active) coinData.sprite.destroy(); if (coinData.label.active) coinData.label.destroy(); } });
        } else {
          this.tweens.add({ targets: [coinData.sprite, coinData.label], scaleX: 0, scaleY: 0, rotation: Math.PI * 2, alpha: 0, duration: 600, ease: 'Back.easeIn', onComplete: () => { if (coinData.sprite.active) coinData.sprite.destroy(); if (coinData.label.active) coinData.label.destroy(); } });
        }
        coinData.isActive = false;
      }

      handleCorrectAnswer(coinIndex) {
        if (this.currentAnswerElements && this.currentAnswerElements[coinIndex]) this.currentAnswerElements[coinIndex].bg.setFillStyle(0x68D391, 0.8);
        this.createSuccessEffect(this.player.x, this.player.y);
        this.score += 25; this.correctAnswers++; this.questionIndex++; this.nextQuestionDistance = this.distance + this.questionInterval;
        const scoreFontSize = Math.max(28, 36 * this.scaleFactor);
        const scorePopup = this.add.text(this.player.x, this.player.y - 50, '+25', { fontSize: scoreFontSize + 'px', fill: '#68D391', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);
        this.tweens.add({ targets: scorePopup, y: scorePopup.y - 50, alpha: 0, scale: 1.5, duration: 1400, ease: 'Power2', onComplete: () => scorePopup.destroy() });
        this.time.delayedCall(2500, () => this.hideQuestion());
      }

      handleWrongAnswer(coinIndex, correctAnswer) {
        if (this.currentAnswerElements && this.currentAnswerElements[coinIndex]) this.currentAnswerElements[coinIndex].bg.setFillStyle(0xF56565, 0.8);
        this.highlightCorrectAnswer(correctAnswer); this.cameras.main.shake(400, 0.02);
        this.lives--; this.wrongAnswers++; this.questionIndex++; this.nextQuestionDistance = this.distance + this.questionInterval;
        const damageFontSize = Math.max(22, 28 * this.scaleFactor);
        const damageText = this.add.text(this.player.x, this.player.y - 50, '-1 LIFE', { fontSize: damageFontSize + 'px', fill: '#F56565', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);
        this.tweens.add({ targets: damageText, y: damageText.y - 60, alpha: 0, duration: 1400, onComplete: () => damageText.destroy() });
        if (this.lives <= 0) { this.gameState = 'GAME_OVER'; this.time.delayedCall(1800, () => this.gameOver()); } else { this.time.delayedCall(3000, () => this.hideQuestion()); }
      }

      highlightCorrectAnswer(correctAnswer) {
        if (!this.currentAnswerElements) return;
        this.currentAnswerElements.forEach((element, idx) => {
          if (element.answer === correctAnswer) {
            this.tweens.add({ targets: element.bg, alpha: 0.9, duration: 300, yoyo: true, repeat: 3, onStart: () => { element.bg.setFillStyle(0x68D391); } });
          }
        });
      }

      createSuccessEffect(x, y) {
        const colors = [0x68D391, 0x90CDF4, 0xF6AD55, 0xFED7AA];
        for (let i = 0; i < 12; i++) {
          const p = this.add.circle(x, y, window.Phaser.Math.Between(4 * this.scaleFactor, 8 * this.scaleFactor), colors[i % colors.length]);
          const angle = (i / 12) * Math.PI * 2, dist = (80 + Math.random() * 40) * this.scaleFactor;
          this.tweens.add({ targets: p, x: x + Math.cos(angle) * dist, y: y + Math.sin(angle) * dist, alpha: 0, scale: 0.3, duration: 1100, ease: 'Power2', onComplete: () => p.destroy() });
        }
      }

      hideQuestion() {
        if (this.questionTimeout) { this.questionTimeout.remove(); this.questionTimeout = null; }
        if (this.currentQuestionElements && this.currentQuestionElements.length > 0) {
          this.currentQuestionElements.forEach(el => {
            if (el && el.active) this.tweens.add({ targets: el, y: -150, alpha: 0, duration: 600, onComplete: () => { if (el && el.active) el.destroy(); } });
          });
          this.currentQuestionElements = [];
        }
        if (this.currentInstructionText && this.currentInstructionText.active) {
          this.tweens.add({ targets: this.currentInstructionText, alpha: 0, duration: 400, onComplete: () => { if (this.currentInstructionText && this.currentInstructionText.active) { this.currentInstructionText.destroy(); } this.currentInstructionText = null; } });
        }
        this.questionCoins.forEach(coin => { if (coin.sprite.active) coin.sprite.destroy(); if (coin.label.active) coin.label.destroy(); });
        this.questionCoins = []; this.currentAnswerElements = [];
        if (this.questionIndex >= this.questions.length) { this.time.delayedCall(800, () => this.showResults()); return; }
        this.time.delayedCall(1000, () => { this.gameState = 'PLAYING'; });
      }

      showCleanInstruction() {
        const instructionFontSize = Math.max(12, 16 * this.scaleFactor);
        const instruction = this.add.text(this.sys.canvas.width/2, this.sys.canvas.height - 50, 'Fly through the correct coin to answer!', { fontSize: instructionFontSize + 'px', fill: '#FED7D7', align: 'center', fontWeight: 'bold', fontFamily: 'Arial, sans-serif', stroke: '#1A202C', strokeThickness: 2 }).setOrigin(0.5);
        this.tweens.add({ targets: instruction, alpha: 0.7, scale: 0.95, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.currentInstructionText = instruction;
      }

      gameOver() {
        this.gameState = 'GAME_OVER';
        if (this.setPauseVisibilityCallback) this.setPauseVisibilityCallback(false);
        if (this.questionTimeout) { this.questionTimeout.remove(); this.questionTimeout = null; }
        this.createEndScreen(false);
      }

      showResults() {
        this.gameState = 'RESULTS';
        if (this.setPauseVisibilityCallback) this.setPauseVisibilityCallback(false);
        const totalQuestions = this.questionIndex, percentage = totalQuestions > 0 ? Math.round((this.correctAnswers / totalQuestions) * 100) : 0;
        this.createEndScreen(percentage >= 70);
      }

      createEndScreen(passed) {
        const container = this.add.container(this.sys.canvas.width/2, this.sys.canvas.height/2);
        const overlay = this.add.rectangle(0, 0, this.sys.canvas.width, this.sys.canvas.height, 0x0B1426, 0.95);
        const cardWidth = Math.min(440, this.sys.canvas.width * 0.9), cardHeight = Math.min(600, this.sys.canvas.height * 0.85);
        const cardBg = this.add.rectangle(0, 0, cardWidth, cardHeight, 0x1A202C, 1);
        cardBg.setStrokeStyle(6, passed ? 0x68D391 : 0xF56565, 1);

        const titleFontSize = Math.max(20, 32 * this.scaleFactor);
        const title = this.add.text(0, -cardHeight/2 + 60, passed ? 'MISSION COMPLETED' : 'MISSION FAILED', { fontSize: titleFontSize + 'px', fill: '#E2E8F0', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);
        
        const scoreLabelFontSize = Math.max(14, 18 * this.scaleFactor);
        const scoreLabel = this.add.text(0, -cardHeight/2 + 120, 'FINAL SCORE', { fontSize: scoreLabelFontSize + 'px', fill: '#9CA3AF', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);
        const scoreValueFontSize = Math.max(32, 48 * this.scaleFactor);
        const scoreValue = this.add.text(0, -cardHeight/2 + 155, `${this.score}`, { fontSize: scoreValueFontSize + 'px', fill: '#68D391', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);

        const statsBg = this.add.rectangle(0, -cardHeight/2 + 250, cardWidth - 40, 120, 0x2C3A50, 1);
        statsBg.setStrokeStyle(2, 0x4A5568, 1);

        const statFontSize = Math.max(18, 24 * this.scaleFactor);
        const labelFontSize = Math.max(12, 14 * this.scaleFactor);
        const correctStat = this.add.text(-cardWidth/4, -cardHeight/2 + 240, `${this.correctAnswers}`, { fontSize: statFontSize + 'px', fill: '#68D391', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);
        const correctLabel = this.add.text(-cardWidth/4, -cardHeight/2 + 265, 'CORRECT', { fontSize: labelFontSize + 'px', fill: '#68D391', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);
        
        const wrongStat = this.add.text(cardWidth/4, -cardHeight/2 + 240, `${this.wrongAnswers}`, { fontSize: statFontSize + 'px', fill: '#F56565', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);
        const wrongLabel = this.add.text(cardWidth/4, -cardHeight/2 + 265, 'WRONG', { fontSize: labelFontSize + 'px', fill: '#F56565', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);

        const progressBg = this.add.rectangle(0, -cardHeight/2 + 330, cardWidth - 80, 20, 0x24314C, 1);
        const progressWidth = Math.max(20, (this.questionIndex / this.questions.length) * (cardWidth - 80));
        const progressFill = this.add.rectangle(-(cardWidth - 80)/2 + progressWidth/2, -cardHeight/2 + 330, progressWidth, 20, 0x68D391, 1);
        const progressTextFontSize = Math.max(12, 16 * this.scaleFactor);
        const progressText = this.add.text(0, -cardHeight/2 + 360, `${this.questionIndex} / ${this.questions.length} QUESTIONS`, { fontSize: progressTextFontSize + 'px', fill: '#E2E8F0', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);

        const statusFontSize = Math.max(16, 20 * this.scaleFactor);
        const statusText = this.add.text(0, -cardHeight/2 + 400, passed ? 'EXCELLENT WORK' : 'KEEP PRACTICING', { fontSize: statusFontSize + 'px', fill: passed ? '#68D391' : '#F6AD55', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);

        const buttonWidth = Math.min(160, cardWidth/2.5), buttonHeight = 50;
        const buttonFontSize = Math.max(12, 16 * this.scaleFactor);

        const restartBtn = this.add.container(-buttonWidth/2 - 20, cardHeight/2 - 80);
        const restartBg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, passed ? 0x68D391 : 0xF56565, 1);
        restartBg.setStrokeStyle(3, passed ? 0x5BB585 : 0xE04848, 1);
        const restartTxt = this.add.text(0, 0, 'PLAY AGAIN', { fontSize: buttonFontSize + 'px', fill: passed ? '#132618' : '#FFFFFF', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);
        restartBtn.add([restartBg, restartTxt]);
        restartBtn.setInteractive(new window.Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight), window.Phaser.Geom.Rectangle.Contains);

        const homeBtn = this.add.container(buttonWidth/2 + 20, cardHeight/2 - 80);
        const homeBg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x202F47, 1);
        homeBg.setStrokeStyle(3, passed ? 0x68D391 : 0xF56565, 1);
        const homeTxt = this.add.text(0, 0, 'HOME', { fontSize: buttonFontSize + 'px', fill: passed ? '#68D391' : '#F56565', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);
        homeBtn.add([homeBg, homeTxt]);
        homeBtn.setInteractive(new window.Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight), window.Phaser.Geom.Rectangle.Contains);

        restartBtn.on('pointerover', () => { this.tweens.add({ targets: restartBtn, scaleX: 1.05, scaleY: 1.05, duration: 200 }); restartBg.setFillStyle(passed ? 0x5BB585 : 0xE04848); });
        restartBtn.on('pointerout', () => { this.tweens.add({ targets: restartBtn, scaleX: 1, scaleY: 1, duration: 200 }); restartBg.setFillStyle(passed ? 0x68D391 : 0xF56565); });
        homeBtn.on('pointerover', () => { this.tweens.add({ targets: homeBtn, scaleX: 1.05, scaleY: 1.05, duration: 200 }); homeBg.setFillStyle(passed ? 0x68D391 : 0xF56565); });
        homeBtn.on('pointerout', () => { this.tweens.add({ targets: homeBtn, scaleX: 1, scaleY: 1, duration: 200 }); homeBg.setFillStyle(0x202F47); });

        restartBtn.on('pointerdown', () => { if (this.setPauseVisibilityCallback) this.setPauseVisibilityCallback(true); this.scene.restart({ questions: this.questions }); });
        homeBtn.on('pointerdown', () => { if (typeof window !== 'undefined') window.location.href = '/'; });

        container.add([overlay, cardBg, title, scoreLabel, scoreValue, statsBg, correctStat, correctLabel, wrongStat, wrongLabel, progressBg, progressFill, progressText, statusText, restartBtn, homeBtn]);
        container.setAlpha(0); container.setScale(0.8);
        this.tweens.add({ targets: container, alpha: 1, scaleX: 1, scaleY: 1, duration: 800, ease: 'Back.easeOut' });
        this.tweens.addCounter({ from: 0, to: this.score, duration: 1500, delay: 500, ease: 'Power2', onUpdate: (tween) => { scoreValue.setText(Math.floor(tween.getValue())); } });
      }
    };
  };

  const LoaderSVG = () => React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '150', height: '150', viewBox: '0 0 200 200', className: 'pencil' }, [
    React.createElement('defs', { key: 'defs' }, React.createElement('clipPath', { id: 'pencil-eraser' }, React.createElement('rect', { height: '30', width: '30', ry: '5', rx: '5' }))),
    React.createElement('circle', { key: 'stroke', transform: 'rotate(-113,100,100)', strokeLinecap: 'round', strokeDashoffset: '439.82', strokeDasharray: '439.82 439.82', strokeWidth: '2', stroke: 'currentColor', fill: 'none', r: '70', className: 'pencil__stroke' }),
    React.createElement('g', { key: 'rotate-group', transform: 'translate(100,100)', className: 'pencil__rotate' }, [
      React.createElement('g', { key: 'bodies', fill: 'none' }, [
        React.createElement('circle', { key: 'body1', transform: 'rotate(-90)', strokeDashoffset: '402', strokeDasharray: '402.12 402.12', strokeWidth: '30', stroke: 'hsl(223,90%,50%)', r: '64', className: 'pencil__body1' }),
        React.createElement('circle', { key: 'body2', transform: 'rotate(-90)', strokeDashoffset: '465', strokeDasharray: '464.96 464.96', strokeWidth: '10', stroke: 'hsl(223,90%,60%)', r: '74', className: 'pencil__body2' }),
        React.createElement('circle', { key: 'body3', transform: 'rotate(-90)', strokeDashoffset: '339', strokeDasharray: '339.29 339.29', strokeWidth: '10', stroke: 'hsl(223,90%,40%)', r: '54', className: 'pencil__body3' })
      ]),
      React.createElement('g', { key: 'eraser-group', transform: 'rotate(-90) translate(49,0)', className: 'pencil__eraser' }, [
        React.createElement('g', { key: 'eraser-skew', className: 'pencil__eraser-skew' }, [
          React.createElement('rect', { key: 'eraser-main', height: '30', width: '30', ry: '5', rx: '5', fill: 'hsl(223,90%,70%)' }),
          React.createElement('rect', { key: 'eraser-clip', clipPath: 'url(#pencil-eraser)', height: '30', width: '5', fill: 'hsl(223,90%,60%)' }),
          React.createElement('rect', { key: 'eraser-white', height: '20', width: '30', fill: 'hsl(223,10%,90%)' }),
          React.createElement('rect', { key: 'eraser-gray1', height: '20', width: '15', fill: 'hsl(223,10%,70%)' }),
          React.createElement('rect', { key: 'eraser-gray2', height: '20', width: '5', fill: 'hsl(223,10%,80%)' }),
          React.createElement('rect', { key: 'eraser-line1', height: '2', width: '30', y: '6', fill: 'hsla(223,10%,10%,0.2)' }),
          React.createElement('rect', { key: 'eraser-line2', height: '2', width: '30', y: '13', fill: 'hsla(223,10%,10%,0.2)' })
        ])
      ]),
      React.createElement('g', { key: 'point-group', transform: 'rotate(-90) translate(49,-30)', className: 'pencil__point' }, [
        React.createElement('polygon', { key: 'point-main', points: '15 0,30 30,0 30', fill: 'hsl(33,90%,70%)' }),
        React.createElement('polygon', { key: 'point-shadow', points: '15 0,6 30,0 30', fill: 'hsl(33,90%,50%)' }),
        React.createElement('polygon', { key: 'point-tip', points: '15 0,20 10,10 10', fill: 'hsl(223,10%,10%)' })
      ])
    ])
  ]);

  const pencilStyles = `.pencil{width:150px!important;height:150px!important;display:block}.pencil__body1,.pencil__body2,.pencil__body3,.pencil__eraser,.pencil__eraser-skew,.pencil__point,.pencil__rotate,.pencil__stroke{animation-duration:3s;animation-timing-function:linear;animation-iteration-count:infinite}.pencil__body1,.pencil__body2,.pencil__body3{transform:rotate(-90deg)}.pencil__body1{animation-name:pencilBody1}.pencil__body2{animation-name:pencilBody2}.pencil__body3{animation-name:pencilBody3}.pencil__eraser{animation-name:pencilEraser;transform:rotate(-90deg) translate(49px,0)}.pencil__eraser-skew{animation-name:pencilEraserSkew;animation-timing-function:ease-in-out}.pencil__point{animation-name:pencilPoint;transform:rotate(-90deg) translate(49px,-30px)}.pencil__rotate{animation-name:pencilRotate}.pencil__stroke{animation-name:pencilStroke;transform:translate(100px,100px) rotate(-113deg)}@keyframes pencilBody1{from,to{stroke-dashoffset:351.86;transform:rotate(-90deg)}50%{stroke-dashoffset:150.8;transform:rotate(-225deg)}}@keyframes pencilBody2{from,to{stroke-dashoffset:406.84;transform:rotate(-90deg)}50%{stroke-dashoffset:174.36;transform:rotate(-225deg)}}@keyframes pencilBody3{from,to{stroke-dashoffset:296.88;transform:rotate(-90deg)}50%{stroke-dashoffset:127.23;transform:rotate(-225deg)}}@keyframes pencilEraser{from,to{transform:rotate(-45deg) translate(49px,0)}50%{transform:rotate(0deg) translate(49px,0)}}@keyframes pencilEraserSkew{from,32.5%,67.5%,to{transform:skewX(0)}35%,65%{transform:skewX(-4deg)}37.5%,62.5%{transform:skewX(8deg)}40%,45%,50%,55%,60%{transform:skewX(-15deg)}42.5%,47.5%,52.5%,57.5%{transform:skewX(15deg)}}@keyframes pencilPoint{from,to{transform:rotate(-90deg) translate(49px,-30px)}50%{transform:rotate(-225deg) translate(49px,-30px)}}@keyframes pencilRotate{from{transform:translate(100px,100px) rotate(0)}to{transform:translate(100px,100px) rotate(720deg)}}@keyframes pencilStroke{from{stroke-dashoffset:439.82;transform:translate(100px,100px) rotate(-113deg)}50%{stroke-dashoffset:164.93;transform:translate(100px,100px) rotate(-113deg)}75%,to{stroke-dashoffset:439.82;transform:translate(100px,100px) rotate(112deg)}}`;

  const pauseButtonStyles = `.container{--color:white;--size:45px;display:flex;justify-content:center;align-items:center;position:relative;cursor:pointer;font-size:var(--size);user-select:none;fill:var(--color);width:60px;height:60px;background:linear-gradient(45deg,#68D391,#4FD1C7);border-radius:12px;border:3px solid #2D3748;box-shadow:0 4px 12px rgba(0,0,0,0.3);transition:all 0.3s ease}.container:hover{transform:scale(1.05);box-shadow:0 6px 16px rgba(0,0,0,0.4)}.container:active{transform:scale(0.95)}.container .play{position:absolute;animation:keyframes-fill 0.3s}.container .pause{position:absolute;display:none;animation:keyframes-fill 0.3s}.container input:checked ~ .play{display:none}.container input:checked ~ .pause{display:block}.container input{position:absolute;opacity:0;cursor:pointer;height:0;width:0}@keyframes keyframes-fill{0%{transform:scale(0);opacity:0}50%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}`;

  if (!mounted) {
    return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(45deg, #0B1426, #1A2332)', color: 'white', fontFamily: 'Arial, sans-serif' } }, [
      React.createElement('style', { key: 'pencil-styles' }, pencilStyles),
      React.createElement('div', { key: 'loader-container', style: { width: '150px', height: '150px', display: 'flex', justifyContent: 'center', alignItems: 'center' } }, [LoaderSVG()]),
      React.createElement('div', { key: 'loading-text', style: { fontSize: '24px', marginBottom: '10px', marginTop: '20px' } }, 'Loading Quest Flight...'),
      React.createElement('div', { key: 'preparing-text', style: { fontSize: '16px', opacity: 0.7 } }, 'Preparing systems...')
    ]);
  }

  if (error) {
    return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(45deg, #1A202C, #2D3748)', color: 'white', fontFamily: 'Arial, sans-serif', padding: '20px', textAlign: 'center' } }, [
      React.createElement('div', { key: 'error-title', style: { fontSize: '32px', marginBottom: '20px' } }, 'Game Error'),
      React.createElement('div', { key: 'error-message', style: { fontSize: '18px', marginBottom: '30px', maxWidth: '600px' } }, error),
      React.createElement('div', { key: 'error-buttons', style: { display: 'flex', gap: '15px' } }, [
        React.createElement('button', { key: 'reload-btn', onClick: handleReloadClick, style: { padding: '12px 24px', fontSize: '16px', backgroundColor: '#68D391', color: '#1A202C', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' } }, 'Reload Game'),
        React.createElement('button', { key: 'home-btn', onClick: handleHomeClick, style: { padding: '12px 24px', fontSize: '16px', backgroundColor: '#2D3748', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' } }, 'Home')
      ])
    ]);
  }

  return React.createElement('div', { style: { width: '100%', height: '100vh', overflow: 'hidden', background: 'linear-gradient(45deg, #0B1426, #1A2332)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } }, [
    isLoading && React.createElement('div', { key: 'loading-overlay', style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(45deg, #0B1426, #1A2332)', color: 'white', fontSize: '24px', fontFamily: 'Arial, sans-serif', zIndex: 1000 } }, [
      React.createElement('style', { key: 'overlay-pencil-styles' }, pencilStyles),
      React.createElement('div', { key: 'overlay-loader-container', style: { width: '150px', height: '150px', display: 'flex', justifyContent: 'center', alignItems: 'center' } }, [LoaderSVG()]),
      React.createElement('div', { key: 'overlay-loading-text', style: { fontSize: '24px', marginBottom: '10px', marginTop: '20px' } }, 'Loading Quest Flight...'),
      React.createElement('div', { key: 'overlay-preparing-text', style: { fontSize: '16px', opacity: 0.7 } }, 'Preparing systems...')
    ]),

    React.createElement('div', { key: 'game-container', ref: gameRef, style: { width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' } }),

    gameLoaded && isPauseVisible && React.createElement('div', { key: 'pause-button', style: { position: 'absolute', top: '10px', right: '10px', zIndex: 100 } }, [
      React.createElement('style', { key: 'pause-button-styles' }, pauseButtonStyles),
      React.createElement('label', { key: 'pause-label', className: 'container' }, [
        React.createElement('input', { key: 'pause-input', type: 'checkbox', checked: isPaused, onChange: handlePauseToggle }),
        React.createElement('svg', { key: 'play-svg', className: 'play', xmlns: 'http://www.w3.org/2000/svg', height: '1em', viewBox: '0 0 384 512' }, [
          React.createElement('path', { key: 'play-path', d: 'M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z' })
        ]),
        React.createElement('svg', { key: 'pause-svg', className: 'pause', xmlns: 'http://www.w3.org/2000/svg', height: '1em', viewBox: '0 0 320 512' }, [
          React.createElement('path', { key: 'pause-path', d: 'M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z' })
        ])
      ])
    ])
  ]);
};

export default MainGameFile;