'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';

const QUESTIONS = [
  { "question": "Which of the following is a feature of Core Java?", "answers": ["Platform Dependent", "Object-Oriented", "No Memory Management", "No Inheritance"], "correctAnswer": "Object-Oriented" },
  { "question": "Which keyword is used to inherit a class in Java?", "answers": ["this", "super", "extends", "implements"], "correctAnswer": "extends" },
  { "question": "What is the SI unit of force?", "answers": ["Newton", "Joule", "Watt", "Pascal"], "correctAnswer": "Newton" },
  { "question": "Which process do green plants use to make food using sunlight?", "answers": ["Photosynthesis", "Respiration", "Transpiration", "Osmosis"], "correctAnswer": "Photosynthesis" },
  { "question": "What is the pH value of pure water at 25°C?", "answers": ["7", "0", "14", "10"], "correctAnswer": "7" },
  { "question": "Which formula gives the area of a circle?", "answers": ["πr²", "2πr", "πd", "r²"], "correctAnswer": "πr²" },
  { "question": "What does CPU stand for in computer science?", "answers": ["Central Processing Unit", "Central Program Unit", "Control Processing Unit", "Computer Processing Unit"], "correctAnswer": "Central Processing Unit" },
  { "question": "Which is the largest ocean on Earth?", "answers": ["Indian Ocean", "Atlantic Ocean", "Pacific Ocean", "Arctic Ocean"], "correctAnswer": "Pacific Ocean" },
  { "question": "Who led the Salt March in India in 1930?", "answers": ["Jawaharlal Nehru", "Subhas Chandra Bose", "Mahatma Gandhi", "Sardar Patel"], "correctAnswer": "Mahatma Gandhi" },
  { "question": "Which of the following words is a pronoun?", "answers": ["They", "Run", "Beautiful", "Quickly"], "correctAnswer": "They" }
];

const MainGameFile = () => {
  const gameRef = useRef(null), phaserGameRef = useRef(null);
  const [gameLoaded, setGameLoaded] = useState(false), [error, setError] = useState(null), [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true), [isPaused, setIsPaused] = useState(false), [isPauseVisible, setIsPauseVisible] = useState(true);
  const [showRotatePrompt, setShowRotatePrompt] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const checkOrientation = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setShowRotatePrompt(isMobile && isPortrait);
    };
    checkOrientation();
    window.addEventListener('orientationchange', checkOrientation);
    window.addEventListener('resize', checkOrientation);
    return () => {
      window.removeEventListener('orientationchange', checkOrientation);
      window.removeEventListener('resize', checkOrientation);
    };
  }, [mounted]);

  const handleReloadClick = useCallback(() => {
    if (typeof window !== 'undefined' && mounted) window.location.reload();
  }, [mounted]);

  const handlePauseToggle = useCallback(() => {
    if (phaserGameRef.current) {
      const scene = phaserGameRef.current.scene.getScene('JetpackGameScene');
      if (scene) {
        if (isPaused) { scene.scene.resume(); setIsPaused(false); }
        else { scene.scene.pause(); setIsPaused(true); }
      }
    }
  }, [isPaused]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && phaserGameRef.current && !isPaused) {
        const scene = phaserGameRef.current.scene.getScene('JetpackGameScene');
        if (scene && scene.scene.isActive()) { scene.scene.pause(); setIsPaused(true); }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPaused]);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined' || phaserGameRef.current) return;
    const initGame = async () => {
      try {
        setIsLoading(true); setError(null);
        await loadPhaserFromCDN(); await loadGSAPFromCDN();
        const RedesignedJetpackScene = createRedesignedJetpackScene();
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        let gameWidth, gameHeight;
        if (isMobile) { gameWidth = window.innerWidth; gameHeight = window.innerHeight; }
        else {
          const screenWidth = window.innerWidth, screenHeight = window.innerHeight;
          const baseWidth = 1400, baseHeight = 700, aspectRatio = baseWidth / baseHeight;
          if (screenWidth / screenHeight > aspectRatio) {
            gameHeight = Math.min(screenHeight * 0.95, baseHeight);
            gameWidth = gameHeight * aspectRatio;
          } else {
            gameWidth = Math.min(screenWidth * 0.95, baseWidth);
            gameHeight = gameWidth / aspectRatio;
          }
          gameWidth = Math.max(gameWidth, 640); gameHeight = Math.max(gameHeight, 320);
        }
        const config = {
          type: window.Phaser.AUTO, width: gameWidth, height: gameHeight, parent: gameRef.current,
          backgroundColor: '#0B1426', physics: { default: 'arcade', arcade: { gravity: { y: 800 }, debug: false } },
          scene: RedesignedJetpackScene, scale: {
            mode: isMobile ? window.Phaser.Scale.RESIZE : window.Phaser.Scale.FIT,
            autoCenter: window.Phaser.Scale.CENTER_BOTH, min: { width: 320, height: 200 }, max: { width: 2560, height: 1440 }
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
            setGameLoaded(true); setIsLoading(false);
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
        try { phaserGameRef.current.destroy(true); phaserGameRef.current = null; }
        catch (error) { console.warn('Error destroying Phaser game:', error); }
      }
    };
  }, [mounted]);

  const loadPhaserFromCDN = () => new Promise((resolve, reject) => {
    if (window.Phaser) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js';
    script.async = true; script.onload = () => resolve(); script.onerror = () => reject(new Error('Failed to load Phaser from CDN'));
    document.head.appendChild(script);
  });

  const loadGSAPFromCDN = () => new Promise((resolve, reject) => {
    if (window.gsap) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
    script.async = true; script.onload = () => resolve(); script.onerror = () => reject(new Error('Failed to load GSAP from CDN'));
    document.head.appendChild(script);
  });

  const createRedesignedJetpackScene = () => {
    return class JetpackGameScene extends window.Phaser.Scene {
      constructor() {
        super({ key: 'JetpackGameScene' });
        Object.assign(this, {
          lives: 3, score: 0, distance: 0, questionIndex: 0, obstaclesPassed: 0, correctAnswers: 0, wrongAnswers: 0,
          gameState: 'PLAYING', isInvulnerable: false, invulnerabilityTimer: null, jetpackActive: false,
          jetpackFuel: 100, maxJetpackFuel: 100, fuelConsumptionRate: 0.8, fuelRechargeRate: 0.6,
          scrollSpeed: 200, normalScrollSpeed: 200, questionScrollSpeed: 200 / 1.1, hasStartedFlying: false,
          hoverTargetY: 540, isHovering: false, player: null, background: null, jetpackParticles: [], hoverParticles: [],
          questionCoins: [], heartIcons: [], scoreText: null, distanceText: null, progressText: null, questionText: null,
          questionContainer: null, questionNumberText: null, fuelBar: null, fuelBarBg: null, cursors: null, spaceKey: null,
          questions: [], currentQuestionElements: [], currentInstructionText: null, answerProcessed: false,
          questionTimeout: null, questionTimeLimit: 15000, nextQuestionDistance: 75, questionInterval: 30,
          setPauseVisibilityCallback: null, isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
          scaleFactor: 1
        });
      }

      init(data) {
        this.questions = data?.questions || QUESTIONS;
        const gameWidth = this.sys.canvas.width, gameHeight = this.sys.canvas.height;
        if (this.isMobile) {
          const baseWidth = 800, baseHeight = 450;
          this.scaleFactor = Math.min(gameWidth / baseWidth, gameHeight / baseHeight);
          this.scaleFactor = Math.max(0.6, Math.min(1.5, this.scaleFactor));
        } else {
          const baseWidth = 1400, baseHeight = 700;
          this.scaleFactor = Math.min(gameWidth / baseWidth, gameHeight / baseHeight);
          this.scaleFactor = Math.max(0.5, Math.min(1.2, this.scaleFactor));
        }
        Object.assign(this, {
          lives: 3, score: 0, distance: 0, questionIndex: 0, obstaclesPassed: 0, correctAnswers: 0, wrongAnswers: 0,
          gameState: 'PLAYING', isInvulnerable: false, invulnerabilityTimer: null, jetpackActive: false, jetpackFuel: 100,
          jetpackParticles: [], hoverParticles: [], questionCoins: [], currentQuestionElements: [],
          currentInstructionText: null, answerProcessed: false, hasStartedFlying: false, isHovering: false,
          hoverTargetY: 540, questionTimeout: null, nextQuestionDistance: 75, questionInterval: 30
        });
        this.scrollSpeed = this.normalScrollSpeed;
        if (this.setPauseVisibilityCallback) this.setPauseVisibilityCallback(true);
      }

      preload() { this.createRedesignedAssets(); }

      createRedesignedAssets() {
        const playerGraphics = this.add.graphics();
        playerGraphics.fillStyle(0x2E86AB, 1); playerGraphics.fillRoundedRect(15, 25, 35, 40, 8);
        playerGraphics.fillStyle(0x74D3AE, 0.9); playerGraphics.fillCircle(32, 35, 12);
        playerGraphics.fillStyle(0xA23B72, 0.8); playerGraphics.fillCircle(32, 35, 8);
        playerGraphics.fillStyle(0xF18F01, 1); playerGraphics.fillRoundedRect(5, 40, 20, 8, 4); playerGraphics.fillRoundedRect(40, 40, 20, 8, 4);
        playerGraphics.fillStyle(0xC73E1D, 1); playerGraphics.fillRoundedRect(20, 65, 8, 15, 4); playerGraphics.fillRoundedRect(37, 65, 8, 15, 4);
        playerGraphics.fillStyle(0xFF6B35, 1); playerGraphics.fillCircle(24, 75, 3); playerGraphics.fillCircle(41, 75, 3);
        playerGraphics.generateTexture('redesigned-jetpack-player', 65, 85); playerGraphics.destroy();

        const heartSize = Math.max(32, 42 * this.scaleFactor);
        const createHeartTexture = (type, svg) => {
          const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
          canvas.width = heartSize; canvas.height = heartSize;
          const img = new Image();
          img.onload = () => { ctx.drawImage(img, 0, 0); this.textures.addCanvas(type, canvas); };
          img.src = 'data:image/svg+xml;base64,' + btoa(svg.replace(/42/g, heartSize));
        };
        createHeartTexture('full-heart', `<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" fill="red" viewBox="0 0 24 24"><path d="m12.75 20.66 6.184-7.098c2.677-2.884 2.559-6.506.754-8.705-.898-1.095-2.206-1.816-3.72-1.855-1.293-.034-2.652.43-3.963 1.442-1.315-1.012-2.678-1.476-3.973-1.442-1.515.04-2.825.76-3.724 1.855-1.806 2.201-1.915 5.823.772 8.706l6.183 7.097c.19.216.46.34.743.34a.985.985 0 0 0 .743-.34Z"/></svg>`);
        setTimeout(() => createHeartTexture('empty-heart', `<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" fill="none" viewBox="0 0 24 24"><path stroke="red" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12.01 6.001C6.5 1 1 8 5.782 13.001L12.011 20l6.23-7C23 8 17.5 1 12.01 6.002Z"/></svg>`), 100);

        const coinSize = Math.max(36, 48 * this.scaleFactor);
        const questionCoinGraphics = this.add.graphics();
        questionCoinGraphics.lineStyle(4, 0xEAB308, 1); questionCoinGraphics.fillStyle(0xFDE047, 1);
        questionCoinGraphics.fillCircle(coinSize / 2, coinSize / 2, (coinSize / 2) - 2); questionCoinGraphics.strokeCircle(coinSize / 2, coinSize / 2, (coinSize / 2) - 2);
        questionCoinGraphics.generateTexture('question-coin', coinSize, coinSize); questionCoinGraphics.destroy();

        const gameWidth = this.sys.canvas.width, gameHeight = this.sys.canvas.height, bgGraphics = this.add.graphics();
        bgGraphics.fillGradientStyle(0x0B1426, 0x0F1B35, 0x1A2547, 0x243759, 1); bgGraphics.fillRect(0, 0, gameWidth, gameHeight);
        const starCount = Math.min(150, 80 + (gameWidth * gameHeight / 8000));
        for (let i = 0; i < starCount; i++) {
          const x = Math.random() * gameWidth, y = Math.random() * (gameHeight * 0.5), a = Math.random();
          if (a > 0.6) {
            const starSize = a > 0.85 ? Math.max(2, 4 * this.scaleFactor) : Math.max(1, 2 * this.scaleFactor);
            const starColor = a > 0.9 ? 0xFFFFFF : (a > 0.8 ? 0xB0C4DE : 0xE6E6FA);
            bgGraphics.fillStyle(starColor, a); bgGraphics.fillCircle(x, y, starSize);
          }
        }
        const cityColor = 0x0F1B35, buildingWidth = Math.max(50, 80 * this.scaleFactor), buildingSpacing = Math.max(15, 20 * this.scaleFactor);
        const minHeight = gameHeight * 0.2, maxHeight = gameHeight * 0.4;
        for (let x = 0; x <= gameWidth; x += buildingWidth + buildingSpacing) {
          const h = window.Phaser.Math.Between(minHeight, maxHeight);
          bgGraphics.fillStyle(cityColor, 1); bgGraphics.fillRoundedRect(x, gameHeight - h, buildingWidth, h, Math.max(3, 5 * this.scaleFactor));
          const windowSize = Math.max(6, 8 * this.scaleFactor), sx = Math.max(14, 18 * this.scaleFactor), sy = Math.max(20, 25 * this.scaleFactor);
          const rows = Math.floor(h / (windowSize + sy)), cols = Math.floor(buildingWidth / (windowSize + sx));
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              if (window.Phaser.Math.Between(0, 100) > 40) {
                const wx = x + 8 + c * sx, wy = gameHeight - h + 15 + r * sy;
                const windowColor = window.Phaser.Math.RND.pick([0xFED7AA, 0xF6AD55, 0xE6E6FA]);
                bgGraphics.fillStyle(windowColor, 0.8); bgGraphics.fillRoundedRect(wx, wy, windowSize, windowSize, 2);
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
        const playerX = this.sys.canvas.width * 0.1;
        // FIXED: Start at ground level (85% down from top instead of 50%)
        const playerY = this.sys.canvas.height * 0.85;
        this.player = this.physics.add.sprite(playerX, playerY, 'redesigned-jetpack-player');
        this.player.setCollideWorldBounds(true); this.player.setBounce(0.1); this.player.setScale(Math.max(0.6, 0.8 * this.scaleFactor));
        this.player.setSize(50, 65); this.player.setGravityY(0); this.player.setTint(0xFFFFFF);
        // FIXED: Set initial hover target to D coin level (will be updated when coins spawn)
        this.hoverTargetY = this.sys.canvas.height * 0.85;
      }

      createRedesignedUI() {
        this.createHeartIcons();
        const fontSize = Math.max(18, Math.min(32, 26 * this.scaleFactor)), uiMargin = Math.max(20, 30 * this.scaleFactor);
        this.scoreText = this.add.text(uiMargin, Math.max(50, 65 * this.scaleFactor), 'Score: ' + this.score, {
          fontSize: fontSize + 'px', fill: '#68D391', fontWeight: 'bold', fontFamily: 'Arial, sans-serif'
        });
        this.createHorizontalFuelBar();
      }

      createHeartIcons() {
        this.heartIcons = [];
        const spacing = Math.max(35, 45 * this.scaleFactor), startX = Math.max(20, 30 * this.scaleFactor), startY = Math.max(25, 35 * this.scaleFactor);
        for (let i = 0; i < 3; i++) {
          const heart = this.add.image(startX + (i * spacing), startY, 'full-heart');
          heart.setScale(Math.max(0.6, 0.8 * this.scaleFactor)); this.heartIcons.push(heart);
        }
      }

      updateHeartIcons() {
        for (let i = 0; i < 3; i++) this.heartIcons[i].setTexture(i < this.lives ? 'full-heart' : 'empty-heart');
      }

      createHorizontalFuelBar() {
        const barWidth = this.sys.canvas.width, barHeight = Math.max(3, 4 * this.scaleFactor);
        this.fuelBarBg = this.add.rectangle(barWidth / 2, 5, barWidth, barHeight, 0x2D3748); this.fuelBarBg.setOrigin(0.5, 0);
        this.fuelBar = this.add.rectangle(0, 5, barWidth, barHeight, 0x68D391); this.fuelBar.setOrigin(0, 0);
      }

      setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(window.Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.input.on('pointerdown', (pointer) => {
          if (this.gameState === 'GAME_OVER' || this.gameState === 'RESULTS') return;
          this.jetpackActive = true;
          const rippleSize = Math.max(6, 8 * this.scaleFactor), ripple = this.add.circle(pointer.x, pointer.y, rippleSize, 0x68D391, 0.7);
          this.tweens.add({ targets: ripple, radius: Math.max(30, 40 * this.scaleFactor), alpha: 0, duration: 400, ease: 'Power2', onComplete: () => ripple.destroy() });
        });
        this.input.on('pointerup', () => { this.jetpackActive = false; });
      }

      update() {
        if (this.gameState === 'GAME_OVER' || this.gameState === 'RESULTS') {
          this.player.setVelocityY(0); this.player.rotation = 0; this.player.setTint(0xFFFFFF); this.updateUI(); return;
        }
        if ((this.spaceKey.isDown || this.jetpackActive) && (this.gameState === 'GAME_OVER' || this.gameState === 'RESULTS')) return;

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
            if (Math.abs(diff) > 5) this.player.setVelocityY(diff * 2.5);
            else {
              this.player.setVelocityY(0); this.createHoverParticles(); this.createContinuousFireEffect();
              if (Math.random() < 0.1) this.player.y += Math.sin(this.time.now * 0.005) * 0.5;
            }
          } else this.player.setVelocityY(80);
          this.jetpackFuel = Math.min(this.maxJetpackFuel, this.jetpackFuel + this.fuelRechargeRate);
          this.player.rotation = Math.min(0.3, this.player.body.velocity.y * 0.001); this.player.setTint(0xFFFFFF);
        }

        this.updateFuelBar();
        if (this.gameState === 'PLAYING') { this.scrollSpeed = this.normalScrollSpeed; this.scrollBackground(); this.distance += 0.12; }
        else if (this.gameState === 'QUESTION_ACTIVE') { this.scrollSpeed = this.questionScrollSpeed; this.scrollBackground(); this.distance += 0.12 / 1.1; }
        this.cleanupObjects();
        if (this.gameState === 'PLAYING') this.checkQuestionTrigger();
        this.updateUI(); this.updateParticles();
        if (this.gameState === 'QUESTION_ACTIVE') { this.updateMovingQuestionCoins(); this.checkCoinCollisions(); }
      }

      createParticles(type) {
        const offsetDistance = Math.max(6, 8 * this.scaleFactor), offsets = [-offsetDistance, offsetDistance];
        const config = type === 'jetpack' ? { count: 2, size: [2, 4], colors: [0xF56565, 0xF6AD55, 0xFED7AA], alpha: 0.8, duration: 400 } :
          type === 'hover' ? { count: 1, size: [1, 2], colors: [0xF6AD55, 0xFED7AA], alpha: 0.4, duration: 600 } :
            { count: 1, size: [1, 2], colors: [0xFF6B35, 0xF56565], alpha: 0.7, duration: 250 };

        if (type === 'hover' && Math.random() >= 0.3) return;
        if (type === 'fire' && Math.random() >= 0.6) return;

        offsets.forEach(offset => {
          for (let i = 0; i < config.count; i++) {
            const particleSize = window.Phaser.Math.Between(Math.max(config.size[0], config.size[0] * this.scaleFactor), Math.max(config.size[1], config.size[1] * this.scaleFactor));
            const particle = this.add.circle(this.player.x + offset + window.Phaser.Math.Between(-3, 3), this.player.y + Math.max(30, 40 * this.scaleFactor), particleSize, window.Phaser.Math.RND.pick(config.colors), config.alpha);
            this[type === 'fire' ? 'jetpackParticles' : type + 'Particles'].push(particle);
            this.tweens.add({
              targets: particle, x: particle.x + window.Phaser.Math.Between(-8, 8),
              y: particle.y + window.Phaser.Math.Between(Math.max(20, 25 * this.scaleFactor), Math.max(35, 45 * this.scaleFactor)),
              alpha: 0, scale: type === 'jetpack' ? 0.2 : 0.1, duration: config.duration, ease: 'Power2',
              onComplete: () => {
                if (particle.active) particle.destroy();
                this[type === 'fire' ? 'jetpackParticles' : type + 'Particles'] = this[type === 'fire' ? 'jetpackParticles' : type + 'Particles'].filter(p => p !== particle);
              }
            });
          }
        });
      }

      createJetpackParticles() { this.createParticles('jetpack'); }
      createHoverParticles() { this.createParticles('hover'); }
      createContinuousFireEffect() { this.createParticles('fire'); }

      updateFuelBar() {
        const fuelPercent = this.jetpackFuel / this.maxJetpackFuel;
        this.fuelBar.displayWidth = fuelPercent * this.sys.canvas.width;
        this.fuelBar.setFillStyle(fuelPercent > 0.6 ? 0x68D391 : fuelPercent > 0.3 ? 0xF6AD55 : 0xF56565);
      }

      scrollBackground() { if (this.background) this.background.tilePositionX += this.scrollSpeed * 0.015; }

      cleanupObjects() {
        this.questionCoins = this.questionCoins.filter(coin => {
          if (coin.sprite.x < -100) { coin.sprite.destroy(); if (coin.label) coin.label.destroy(); return false; }
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
        this.answerProcessed = true; this.lives--; this.wrongAnswers++; this.questionIndex++; this.cameras.main.shake(400, 0.02);
        const fontSize = Math.max(22, 32 * this.scaleFactor);
        const skipText = this.add.text(this.player.x, this.player.y - 50, 'SKIPPED! -1 LIFE', { fontSize: fontSize + 'px', fill: '#F56565', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);
        this.tweens.add({ targets: skipText, y: skipText.y - 60, alpha: 0, duration: 1400, onComplete: () => skipText.destroy() });
        this.nextQuestionDistance = this.distance + this.questionInterval;
        if (this.lives <= 0) { this.gameState = 'GAME_OVER'; this.time.delayedCall(1800, () => this.gameOver()); }
        else this.time.delayedCall(3000, () => this.hideQuestion());
      }

      showStaticQuestionUI(question) {
        const gameWidth = this.sys.canvas.width, gameHeight = this.sys.canvas.height;
        const containerWidth = Math.min(gameWidth * 0.95, this.isMobile ? Math.max(350, gameWidth - 20) : Math.max(450, 900 * this.scaleFactor));
        const maxTextLength = Math.max(...question.answers.map(a => a.length)), useVerticalLayout = maxTextLength > (this.isMobile ? 15 : 20) || this.isMobile;
        const baseHeight = useVerticalLayout ? Math.max(200, 240 * this.scaleFactor) : Math.max(180, 220 * this.scaleFactor);
        const containerHeight = Math.min(gameHeight * 0.65, baseHeight), topMargin = Math.max(10, 20 * this.scaleFactor), containerY = topMargin + containerHeight / 2;

        this.questionContainer = this.add.rectangle(gameWidth / 2, containerY, containerWidth, containerHeight, 0x1A2332, 0.96);
        this.questionContainer.setStrokeStyle(Math.max(2, 3 * this.scaleFactor), 0x68D391, 0.9);
        const glowEffect = this.add.rectangle(gameWidth / 2, containerY, containerWidth + Math.max(4, 6 * this.scaleFactor), containerHeight + Math.max(4, 6 * this.scaleFactor), 0x68D391, 0.15);
        glowEffect.setStrokeStyle(1, 0x68D391, 0.3);

        const questionFontSize = Math.max(this.isMobile ? 15 : 17, Math.min(this.isMobile ? 22 : 26, 22 * this.scaleFactor));
        const questionY = containerY - containerHeight / 2 + Math.max(25, 35 * this.scaleFactor);
        this.questionText = this.add.text(gameWidth / 2, questionY, question.question, {
          fontSize: questionFontSize + 'px', fill: '#E2E8F0', align: 'center', fontWeight: 'bold',
          wordWrap: { width: containerWidth * 0.90 }, fontFamily: 'Arial, sans-serif', lineSpacing: Math.max(3, 5 * this.scaleFactor)
        }).setOrigin(0.5);

        const answerLabels = ['A', 'B', 'C', 'D'], answerElements = [];
        const answerWidth = Math.min(containerWidth * 0.40, Math.max(180, 220 * this.scaleFactor)), answerHeight = Math.max(40, 50 * this.scaleFactor);
        const horizontalGap = Math.max(25, 35 * this.scaleFactor), verticalGap = Math.max(20, 30 * this.scaleFactor);
        const positions = [
          { x: gameWidth / 2 - answerWidth / 2 - horizontalGap / 2, y: containerY - verticalGap / 2 + Math.max(10, 15 * this.scaleFactor) },
          { x: gameWidth / 2 + answerWidth / 2 + horizontalGap / 2, y: containerY - verticalGap / 2 + Math.max(10, 15 * this.scaleFactor) },
          { x: gameWidth / 2 - answerWidth / 2 - horizontalGap / 2, y: containerY + answerHeight / 2 + verticalGap / 2 + Math.max(10, 15 * this.scaleFactor) },
          { x: gameWidth / 2 + answerWidth / 2 + horizontalGap / 2, y: containerY + answerHeight / 2 + verticalGap / 2 + Math.max(10, 15 * this.scaleFactor) }
        ];

        for (let i = 0; i < question.answers.length; i++) {
          const pos = positions[i];
          const optionBg = this.add.rectangle(pos.x, pos.y, answerWidth, answerHeight, 0x2D3748, 0.85);
          optionBg.setStrokeStyle(Math.max(1, 2 * this.scaleFactor), 0x4A5568, 0.7);
          const labelFontSize = Math.max(14, Math.min(22, 18 * this.scaleFactor));
          const label = this.add.text(pos.x - answerWidth * 0.35, pos.y, answerLabels[i], { fontSize: labelFontSize + 'px', fill: '#F6AD55', fontWeight: 'bold', fontFamily: 'Arial, sans-serif', stroke: '#1A202C', strokeThickness: 1 }).setOrigin(0.5);
          const answerFontSize = Math.max(12, Math.min(18, 14 * this.scaleFactor));
          const answerText = this.add.text(pos.x + Math.max(10, 15 * this.scaleFactor), pos.y, question.answers[i], { fontSize: answerFontSize + 'px', fill: '#E2E8F0', align: 'center', fontWeight: '600', wordWrap: { width: answerWidth * 0.65 }, fontFamily: 'Arial, sans-serif', lineSpacing: 1 }).setOrigin(0.5);
          answerElements.push({ bg: optionBg, label, text: answerText, index: i, answer: question.answers[i] });
        }

        this.currentQuestionElements = [glowEffect, this.questionContainer, this.questionText, ...answerElements.flatMap(e => [e.bg, e.label, e.text])];
        this.currentAnswerElements = answerElements;
        this.tweens.add({ targets: [this.questionContainer, glowEffect], alpha: { from: 0, to: this.questionContainer.alpha }, scaleX: { from: 0.95, to: 1 }, scaleY: { from: 0.95, to: 1 }, duration: 500, ease: 'Back.easeOut' });
      }

      spawnMovingCoins(question) {
        this.questionCoins = []; const coinSpeed = -180, answerLabels = ['A', 'B', 'C', 'D'];
        const verticalSpacing = Math.max(60, 80 * this.scaleFactor), horizontalOffset = Math.max(80, 120 * this.scaleFactor);
        const baseY = this.sys.canvas.height * 0.65;
        const staircaseOffsets = [
          { x: 0, y: -verticalSpacing * 1.2 },                    // A
          { x: horizontalOffset * 0.7, y: -verticalSpacing * 0.3 }, // B  
          { x: horizontalOffset * 1.4, y: verticalSpacing * 0.7 },   // C
          { x: horizontalOffset * 2.1, y: verticalSpacing * 1.7 }    // D
        ];

        for (let i = 0; i < question.answers.length; i++) {
          const startX = this.sys.canvas.width + 150 + staircaseOffsets[i].x, yPos = baseY + staircaseOffsets[i].y;
          const clampedY = Math.max(80, Math.min(this.sys.canvas.height - 80, yPos));
          const coinSprite = this.add.sprite(startX, clampedY, 'question-coin'); coinSprite.setScale(Math.max(0.8, 1.1 * this.scaleFactor));
          const coinLabelFontSize = Math.max(16, Math.min(28, 24 * this.scaleFactor));
          const coinLabel = this.add.text(startX, clampedY, answerLabels[i], { fontSize: coinLabelFontSize + 'px', fill: '#A16207', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);
          const coinData = { sprite: coinSprite, label: coinLabel, answerIndex: i, answerText: question.answers[i], speed: coinSpeed, isActive: true };
          this.questionCoins.push(coinData);
          this.tweens.add({ targets: coinSprite, scaleX: Math.max(0.9, 1.2 * this.scaleFactor), scaleY: Math.max(0.9, 1.2 * this.scaleFactor), duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        }
        
        // CRITICAL FIX: Set hover target to D coin level (lowest coin position)
        const dCoinY = baseY + staircaseOffsets[3].y; // Index 3 is D coin
        this.hoverTargetY = Math.max(80, Math.min(this.sys.canvas.height - 80, dCoinY));
        
        this.time.delayedCall(800, () => this.showCleanInstruction());
      }

      updateMovingQuestionCoins() {
        if (this.gameState !== 'QUESTION_ACTIVE') return;
        const dt = this.game.loop.delta / 1000;
        this.questionCoins.forEach(coin => {
          if (!coin.isActive) return; coin.sprite.x += coin.speed * dt; coin.label.x += coin.speed * dt;
          if (coin.sprite.x < 50) { this.animateAllCoinsDisappear(); return; }
        });
      }

      // CRITICAL FIX: Replace faulty getBounds() collision with direct coordinate collision
      checkCoinCollisions() {
        if (this.gameState !== 'QUESTION_ACTIVE' || !this.player || this.answerProcessed) return;
        
        // Use direct coordinates instead of getBounds()
        const playerX = this.player.x;
        const playerY = this.player.y;
        const playerWidth = 40 * this.player.scaleX; // Player hitbox width
        const playerHeight = 50 * this.player.scaleY; // Player hitbox height
        
        this.questionCoins.forEach((coin, index) => {
          if (!coin.isActive) return;
          
          const coinX = coin.sprite.x;
          const coinY = coin.sprite.y;
          const coinRadius = 25 * coin.sprite.scaleX; // Coin radius including scale
          
          // Distance-based collision detection (more reliable)
          const distanceX = Math.abs(playerX - coinX);
          const distanceY = Math.abs(playerY - coinY);
          const collisionDistance = (playerWidth / 2) + coinRadius;
          
          // Check if collision occurred
          if (distanceX < collisionDistance && distanceY < collisionDistance) {
            this.selectCoinAnswer(index);
            return;
          }
        });
      }

      selectCoinAnswer(coinIndex) {
        if (this.answerProcessed) return;
        const coinData = this.questionCoins[coinIndex];
        if (!coinData || !coinData.isActive) return;
        this.answerProcessed = true;
        if (this.questionTimeout) { this.questionTimeout.remove(); this.questionTimeout = null; }
        const question = this.questions[this.questionIndex], selectedAnswer = coinData.answerText, isCorrect = selectedAnswer === question.correctAnswer;
        this.animateAllCoinsDisappear();
        if (isCorrect) this.handleCorrectAnswer(coinIndex);
        else this.handleWrongAnswer(coinIndex, question.correctAnswer);
      }

      animateAllCoinsDisappear() {
        this.questionCoins.forEach(coin => {
          if (coin.isActive && coin.sprite.active && coin.label.active) this.animateCoinDisappear(coin);
        });
      }

      animateCoinDisappear(coinData) {
        if (window.gsap) {
          window.gsap.to([coinData.sprite, coinData.label], { duration: 0.8, scale: 0, rotation: Math.PI * 3, alpha: 0, ease: "elastic.out(1, 0.3)", onComplete: () => { if (coinData.sprite.active) coinData.sprite.destroy(); if (coinData.label.active) coinData.label.destroy(); } });
          const sparkleCount = 8;
          for (let i = 0; i < sparkleCount; i++) {
            const angle = (i / sparkleCount) * Math.PI * 2, distance = 40, sparkle = this.add.circle(coinData.sprite.x, coinData.sprite.y, 3, 0xFFD700, 0.8);
            window.gsap.to(sparkle, { duration: 0.6, x: coinData.sprite.x + Math.cos(angle) * distance, y: coinData.sprite.y + Math.sin(angle) * distance, alpha: 0, scale: 0.2, ease: "power2.out", onComplete: () => { if (sparkle.active) sparkle.destroy(); } });
          }
        } else {
          this.tweens.add({ targets: [coinData.sprite, coinData.label], scaleX: 0, scaleY: 0, rotation: Math.PI * 2, alpha: 0, duration: 600, ease: 'Back.easeIn', onComplete: () => { if (coinData.sprite.active) coinData.sprite.destroy(); if (coinData.label.active) coinData.label.destroy(); } });
        }
        coinData.isActive = false;
      }

      handleAnswer(coinIndex, isCorrect) {
        if (this.currentAnswerElements && this.currentAnswerElements[coinIndex]) this.currentAnswerElements[coinIndex].bg.setFillStyle(isCorrect ? 0x68D391 : 0xF56565, 0.8);
        if (isCorrect) {
          this.createSuccessEffect(this.player.x, this.player.y); this.score += 25; this.correctAnswers++;
          const scoreFontSize = Math.max(24, Math.min(44, 40 * this.scaleFactor));
          const scorePopup = this.add.text(this.player.x, this.player.y - 50, '+25', { fontSize: scoreFontSize + 'px', fill: '#68D391', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);
          this.tweens.add({ targets: scorePopup, y: scorePopup.y - 50, alpha: 0, scale: 1.5, duration: 1400, ease: 'Power2', onComplete: () => scorePopup.destroy() });
          this.time.delayedCall(2500, () => this.hideQuestion());
        } else {
          this.cameras.main.shake(400, 0.02); this.lives--; this.wrongAnswers++;
          const damageFontSize = Math.max(20, Math.min(36, 32 * this.scaleFactor));
          const damageText = this.add.text(this.player.x, this.player.y - 50, '-1 LIFE', { fontSize: damageFontSize + 'px', fill: '#F56565', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);
          this.tweens.add({ targets: damageText, y: damageText.y - 60, alpha: 0, duration: 1400, onComplete: () => damageText.destroy() });
          if (this.lives <= 0) { this.gameState = 'GAME_OVER'; this.time.delayedCall(1800, () => this.gameOver()); }
          else this.time.delayedCall(3000, () => this.hideQuestion());
        }
        this.questionIndex++; this.nextQuestionDistance = this.distance + this.questionInterval;
      }

      handleCorrectAnswer(coinIndex) { this.handleAnswer(coinIndex, true); }
      handleWrongAnswer(coinIndex, correctAnswer) {
        this.highlightCorrectAnswer(correctAnswer); this.handleAnswer(coinIndex, false);
      }

      highlightCorrectAnswer(correctAnswer) {
        if (!this.currentAnswerElements) return;
        this.currentAnswerElements.forEach((element, idx) => {
          if (element.answer === correctAnswer) this.tweens.add({ targets: element.bg, alpha: 0.9, duration: 300, yoyo: true, repeat: 3, onStart: () => { element.bg.setFillStyle(0x68D391); } });
        });
      }

      createSuccessEffect(x, y) {
        const colors = [0x68D391, 0x90CDF4, 0xF6AD55, 0xFED7AA], particleCount = Math.max(8, 12 * this.scaleFactor);
        for (let i = 0; i < particleCount; i++) {
          const particleSize = window.Phaser.Math.Between(Math.max(3, 4 * this.scaleFactor), Math.max(6, 8 * this.scaleFactor));
          const p = this.add.circle(x, y, particleSize, colors[i % colors.length]);
          const angle = (i / particleCount) * Math.PI * 2, dist = (Math.max(60, 80) + Math.random() * Math.max(30, 40)) * this.scaleFactor;
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
        const instructionFontSize = Math.max(12, Math.min(24, 20 * this.scaleFactor));
        const instructionY = this.sys.canvas.height - Math.max(30, 50 * this.scaleFactor);
        const instruction = this.add.text(this.sys.canvas.width / 2, instructionY, 'Fly through the correct coin to answer!', { fontSize: instructionFontSize + 'px', fill: '#FED7D7', align: 'center', fontWeight: 'bold', fontFamily: 'Arial, sans-serif', stroke: '#1A202C', strokeThickness: Math.max(1, 2 * this.scaleFactor) }).setOrigin(0.5);
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
        const container = this.add.container(this.sys.canvas.width / 2, this.sys.canvas.height / 2);
        const overlay = this.add.rectangle(0, 0, this.sys.canvas.width, this.sys.canvas.height, 0x0B1426, 0.95);
        const cardWidth = Math.min(this.sys.canvas.width * 0.85, Math.max(280, 440 * this.scaleFactor));
        const cardHeight = Math.min(this.sys.canvas.height * 0.8, Math.max(400, 600 * this.scaleFactor));
        const cardBg = this.add.rectangle(0, 0, cardWidth, cardHeight, 0x1A202C, 1);
        cardBg.setStrokeStyle(Math.max(3, 6 * this.scaleFactor), passed ? 0x68D391 : 0xF56565, 1);

        const titleFontSize = Math.max(18, Math.min(40, 36 * this.scaleFactor));
        const title = this.add.text(0, -cardHeight / 2 + Math.max(40, 60 * this.scaleFactor), passed ? 'MISSION COMPLETED' : 'MISSION FAILED', { fontSize: titleFontSize + 'px', fill: '#E2E8F0', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);
        const scoreLabelFontSize = Math.max(14, Math.min(26, 22 * this.scaleFactor));
        const scoreLabel = this.add.text(0, -cardHeight / 2 + Math.max(80, 120 * this.scaleFactor), 'FINAL SCORE', { fontSize: scoreLabelFontSize + 'px', fill: '#9CA3AF', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);
        const scoreValueFontSize = Math.max(28, Math.min(60, 52 * this.scaleFactor));
        const scoreValue = this.add.text(0, -cardHeight / 2 + Math.max(110, 155 * this.scaleFactor), `${this.score}`, { fontSize: scoreValueFontSize + 'px', fill: '#68D391', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);

        const statsBgHeight = Math.max(80, 120 * this.scaleFactor);
        const statsBg = this.add.rectangle(0, -cardHeight / 2 + Math.max(180, 250 * this.scaleFactor), cardWidth - Math.max(20, 40 * this.scaleFactor), statsBgHeight, 0x2C3A50, 1);
        statsBg.setStrokeStyle(Math.max(1, 2 * this.scaleFactor), 0x4A5568, 1);
        const statFontSize = Math.max(16, Math.min(32, 28 * this.scaleFactor)), labelFontSize = Math.max(12, Math.min(20, 16 * this.scaleFactor)), statSpacing = cardWidth / 4;
        const correctStat = this.add.text(-statSpacing, -cardHeight / 2 + Math.max(170, 240 * this.scaleFactor), `${this.correctAnswers}`, { fontSize: statFontSize + 'px', fill: '#68D391', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);
        const correctLabel = this.add.text(-statSpacing, -cardHeight / 2 + Math.max(190, 265 * this.scaleFactor), 'CORRECT', { fontSize: labelFontSize + 'px', fill: '#68D391', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);
        const wrongStat = this.add.text(statSpacing, -cardHeight / 2 + Math.max(170, 240 * this.scaleFactor), `${this.wrongAnswers}`, { fontSize: statFontSize + 'px', fill: '#F56565', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);
        const wrongLabel = this.add.text(statSpacing, -cardHeight / 2 + Math.max(190, 265 * this.scaleFactor), 'WRONG', { fontSize: labelFontSize + 'px', fill: '#F56565', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);

        const progressBarWidth = cardWidth - Math.max(40, 80 * this.scaleFactor), progressBarHeight = Math.max(12, 20 * this.scaleFactor);
        const progressBg = this.add.rectangle(0, -cardHeight / 2 + Math.max(240, 330 * this.scaleFactor), progressBarWidth, progressBarHeight, 0x24314C, 1);
        const progressWidth = Math.max(10, (this.questionIndex / this.questions.length) * progressBarWidth);
        const progressFill = this.add.rectangle(-progressBarWidth / 2 + progressWidth / 2, -cardHeight / 2 + Math.max(240, 330 * this.scaleFactor), progressWidth, progressBarHeight, 0x68D391, 1);
        const progressTextFontSize = Math.max(12, Math.min(24, 20 * this.scaleFactor));
        const progressText = this.add.text(0, -cardHeight / 2 + Math.max(270, 360 * this.scaleFactor), `${this.questionIndex} / ${this.questions.length} QUESTIONS`, { fontSize: progressTextFontSize + 'px', fill: '#E2E8F0', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);
        const statusFontSize = Math.max(14, Math.min(28, 24 * this.scaleFactor));
        const statusText = this.add.text(0, -cardHeight / 2 + Math.max(310, 400 * this.scaleFactor), passed ? 'EXCELLENT WORK' : 'KEEP PRACTICING', { fontSize: statusFontSize + 'px', fill: passed ? '#68D391' : '#F6AD55', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);

        const buttonWidth = Math.min(cardWidth / 2, Math.max(140, 200 * this.scaleFactor)), buttonHeight = Math.max(35, 50 * this.scaleFactor), buttonFontSize = Math.max(12, Math.min(20, 18 * this.scaleFactor));
        const restartBtn = this.add.container(0, cardHeight / 2 - Math.max(50, 80 * this.scaleFactor));
        const restartBg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, passed ? 0x68D391 : 0xF56565, 1);
        restartBg.setStrokeStyle(Math.max(2, 3 * this.scaleFactor), passed ? 0x5BB585 : 0xE04848, 1);
        const restartTxt = this.add.text(0, 0, 'PLAY AGAIN', { fontSize: buttonFontSize + 'px', fill: passed ? '#132618' : '#FFFFFF', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);
        restartBtn.add([restartBg, restartTxt]);
        restartBtn.setInteractive(new window.Phaser.Geom.Rectangle(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight), window.Phaser.Geom.Rectangle.Contains);

        restartBtn.on('pointerover', () => { this.tweens.add({ targets: restartBtn, scaleX: 1.05, scaleY: 1.05, duration: 200 }); restartBg.setFillStyle(passed ? 0x5BB585 : 0xE04848); });
        restartBtn.on('pointerout', () => { this.tweens.add({ targets: restartBtn, scaleX: 1, scaleY: 1, duration: 200 }); restartBg.setFillStyle(passed ? 0x68D391 : 0xF56565); });
        restartBtn.on('pointerdown', () => { if (this.setPauseVisibilityCallback) this.setPauseVisibilityCallback(true); this.scene.restart({ questions: this.questions }); });

        container.add([overlay, cardBg, title, scoreLabel, scoreValue, statsBg, correctStat, correctLabel, wrongStat, wrongLabel, progressBg, progressFill, progressText, statusText, restartBtn]);
        container.setAlpha(0); container.setScale(0.8);
        this.tweens.add({ targets: container, alpha: 1, scaleX: 1, scaleY: 1, duration: 800, ease: 'Back.easeOut' });
        this.tweens.addCounter({ from: 0, to: this.score, duration: 1500, delay: 500, ease: 'Power2', onUpdate: (tween) => { scoreValue.setText(Math.floor(tween.getValue())); } });
      }
    };
  };

  const RotatePrompt = () => React.createElement('div', { style: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #0B1426, #0F1B35, #1A2547)', zIndex: 9999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white', fontFamily: 'Arial, sans-serif', textAlign: 'center', padding: '20px' } }, [
    React.createElement('svg', { key: 'rotate-icon', width: '64', height: '64', viewBox: '0 0 24 24', fill: 'currentColor', style: { marginBottom: '20px', color: '#68D391', animation: 'spin 2s linear infinite' } }, React.createElement('path', { d: 'M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zM12.1 18.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z' })),
    React.createElement('h2', { key: 'rotate-title', style: { fontSize: '1.5rem', marginBottom: '15px', color: '#68D391' } }, 'Please Rotate Your Device'),
    React.createElement('p', { key: 'rotate-desc', style: { fontSize: '1.1rem', opacity: 0.8, maxWidth: '300px', lineHeight: 1.5 } }, 'This game is optimized for landscape orientation. Please rotate your device for the best experience.'),
    React.createElement('style', { key: 'rotate-styles' }, '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(90deg); } }')
  ]);

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

  const styles = `.pencil{width:150px!important;height:150px!important;display:block}.pencil__body1,.pencil__body2,.pencil__body3,.pencil__eraser,.pencil__eraser-skew,.pencil__point,.pencil__rotate,.pencil__stroke{animation-duration:3s;animation-timing-function:linear;animation-iteration-count:infinite}.pencil__body1,.pencil__body2,.pencil__body3{transform:rotate(-90deg)}.pencil__body1{animation-name:pencilBody1}.pencil__body2{animation-name:pencilBody2}.pencil__body3{animation-name:pencilBody3}.pencil__eraser{animation-name:pencilEraser;transform:rotate(-90deg) translate(49px,0)}.pencil__eraser-skew{animation-name:pencilEraserSkew;animation-timing-function:ease-in-out}.pencil__point{animation-name:pencilPoint;transform:rotate(-90) translate(49px,-30px)}.pencil__rotate{animation-name:pencilRotate}.pencil__stroke{animation-name:pencilStroke;transform:translate(100px,100px) rotate(-113deg)}@keyframes pencilBody1{from,to{stroke-dashoffset:351.86;transform:rotate(-90deg)}50%{stroke-dashoffset:150.8;transform:rotate(-225deg)}}@keyframes pencilBody2{from,to{stroke-dashoffset:406.84;transform:rotate(-90deg)}50%{stroke-dashoffset:174.36;transform:rotate(-225deg)}}@keyframes pencilBody3{from,to{stroke-dashoffset:296.88;transform:rotate(-90deg)}50%{stroke-dashoffset:127.23;transform:rotate(-225deg)}}@keyframes pencilEraser{from,to{transform:rotate(-45deg) translate(49px,0)}50%{transform:rotate(0deg) translate(49px,0)}}@keyframes pencilEraserSkew{from,32.5%,67.5%,to{transform:skewX(0)}35%,65%{transform:skewX(-4deg)}37.5%,62.5%{transform:skewX(8deg)}40%,45%,50%,55%,60%{transform:skewX(-15deg)}42.5%,47.5%,52.5%,57.5%{transform:skewX(15deg)}}@keyframes pencilPoint{from,to{transform:rotate(-90deg) translate(49px,-30px)}50%{transform:rotate(-225deg) translate(49px,-30px)}}@keyframes pencilRotate{from{transform:translate(100px,100px) rotate(0)}to{transform:translate(100px,100px) rotate(720deg)}}@keyframes pencilStroke{from{stroke-dashoffset:439.82;transform:translate(100px,100px) rotate(-113deg)}50%{stroke-dashoffset:164.93;transform:translate(100px,100px) rotate(-113deg)}75%,to{stroke-dashoffset:439.82;transform:translate(100px,100px) rotate(112deg)}}.container{--color:white;--size:45px;display:flex;justify-content:center;align-items:center;position:relative;cursor:pointer;font-size:var(--size);user-select:none}.container .pause{display:block}.container .play{display:none}.container input{position:absolute;opacity:0;cursor:pointer;height:0;width:0}.container input:checked~.pause{display:none}.container input:checked~.play{display:block}.pause rect{fill:var(--color)}.play polygon{fill:var(--color)}`;

  if (showRotatePrompt) return React.createElement(RotatePrompt);

  return React.createElement('div', { style: { width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', position: 'relative', background: 'linear-gradient(135deg, #0B1426, #0F1B35, #1A2547, #243759)', fontFamily: 'Arial, sans-serif' } }, [
    React.createElement('style', { key: 'styles', dangerouslySetInnerHTML: { __html: styles } }),
    React.createElement('div', { key: 'game-area', ref: gameRef, style: { width: '100%', height: '100%', position: 'relative' } }),
    
    isLoading && React.createElement('div', { key: 'loading', style: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #0B1426, #0F1B35, #1A2547, #243759)', zIndex: 1000, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#E2E8F0' } }, [
      React.createElement(LoaderSVG, { key: 'loader-svg' }),
      React.createElement('div', { key: 'loading-text', style: { marginTop: '30px', fontSize: '1.3rem', fontWeight: 'bold', color: '#68D391' } }, 'Loading Jetpack Quiz Adventure...'),
      React.createElement('div', { key: 'loading-subtext', style: { marginTop: '10px', fontSize: '0.95rem', opacity: 0.7, textAlign: 'center', maxWidth: '300px', lineHeight: 1.4 } }, 'Preparing your quiz adventure with enhanced graphics and smooth gameplay')
    ]),
    
    error && React.createElement('div', { key: 'error', style: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #1A202C, #2D3748)', zIndex: 1000, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#E2E8F0', padding: '20px', textAlign: 'center' } }, [
      React.createElement('svg', { key: 'error-icon', width: '64', height: '64', viewBox: '0 0 24 24', fill: '#F56565', style: { marginBottom: '20px' } }, React.createElement('path', { d: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z' })),
      React.createElement('h2', { key: 'error-title', style: { fontSize: '1.5rem', marginBottom: '15px', color: '#F56565' } }, 'Oops! Something went wrong'),
      React.createElement('p', { key: 'error-message', style: { fontSize: '1rem', marginBottom: '30px', opacity: 0.8, maxWidth: '400px', lineHeight: 1.5 } }, error),
      React.createElement('button', { key: 'reload-button', onClick: handleReloadClick, style: { padding: '12px 24px', fontSize: '1rem', fontWeight: 'bold', backgroundColor: '#68D391', color: '#1A202C', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s ease' }, onMouseOver: (e) => { e.target.style.backgroundColor = '#5BB585'; e.target.style.transform = 'translateY(-2px)'; }, onMouseOut: (e) => { e.target.style.backgroundColor = '#68D391'; e.target.style.transform = 'translateY(0)'; } }, 'Reload Game')
    ]),
    
    gameLoaded && isPauseVisible && React.createElement('div', { key: 'controls', style: { position: 'fixed', top: '20px', right: '20px', zIndex: 100, display: 'flex', gap: '15px', alignItems: 'center' } }, [
      React.createElement('div', { key: 'pause-container', className: 'container', style: { '--color': isPaused ? '#68D391' : '#F6AD55', '--size': '20px', padding: '12px', backgroundColor: 'rgba(26, 32, 50, 0.9)', borderRadius: '12px', border: `2px solid ${isPaused ? '#68D391' : '#F6AD55'}`, backdropFilter: 'blur(10px)', transition: 'all 0.3s ease' }, onClick: handlePauseToggle, onMouseOver: (e) => { e.target.style.transform = 'scale(1.1)'; e.target.style.backgroundColor = 'rgba(26, 32, 50, 1)'; }, onMouseOut: (e) => { e.target.style.transform = 'scale(1)'; e.target.style.backgroundColor = 'rgba(26, 32, 50, 0.9)'; } }, [
        React.createElement('input', { key: 'pause-input', type: 'checkbox', checked: isPaused }),
        React.createElement('svg', { key: 'pause-svg', className: 'pause', viewBox: '0 0 24 24', width: '20', height: '20' }, [React.createElement('rect', { key: 'pause-1', x: '6', y: '4', width: '4', height: '16' }), React.createElement('rect', { key: 'pause-2', x: '14', y: '4', width: '4', height: '16' })]),
        React.createElement('svg', { key: 'play-svg', className: 'play', viewBox: '0 0 24 24', width: '20', height: '20' }, React.createElement('polygon', { key: 'play-poly', points: '5,3 19,12 5,21' }))
      ])
    ]),
    
    isPaused && gameLoaded && React.createElement('div', { key: 'pause-overlay', style: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(11, 20, 38, 0.85)', zIndex: 50, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#E2E8F0', backdropFilter: 'blur(8px)' } }, [
      React.createElement('div', { key: 'pause-content', style: { textAlign: 'center', padding: '40px', backgroundColor: 'rgba(26, 32, 50, 0.9)', borderRadius: '20px', border: '2px solid #68D391', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)', maxWidth: '400px', width: '90%' } }, [
        React.createElement('svg', { key: 'pause-icon', width: '64', height: '64', viewBox: '0 0 24 24', fill: '#68D391', style: { marginBottom: '20px' } }, [React.createElement('rect', { x: '6', y: '4', width: '4', height: '16' }), React.createElement('rect', { x: '14', y: '4', width: '4', height: '16' })]),
        React.createElement('h2', { key: 'pause-title', style: { fontSize: '2rem', marginBottom: '15px', color: '#68D391', fontWeight: 'bold' } }, 'Game Paused'),
        React.createElement('p', { key: 'pause-message', style: { fontSize: '1.1rem', marginBottom: '30px', opacity: 0.8, lineHeight: 1.5 } }, 'Take a break! Click the pause button or press anywhere to continue your jetpack adventure.'),
        React.createElement('button', { key: 'resume-btn', onClick: handlePauseToggle, style: { padding: '15px 30px', fontSize: '1.1rem', fontWeight: 'bold', backgroundColor: '#68D391', color: '#1A202C', border: 'none', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto' }, onMouseOver: (e) => { e.target.style.backgroundColor = '#5BB585'; e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 4px 12px rgba(104, 211, 145, 0.4)'; }, onMouseOut: (e) => { e.target.style.backgroundColor = '#68D391'; e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; } }, [
          React.createElement('svg', { key: 'resume-icon', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'currentColor' }, React.createElement('polygon', { points: '5,3 19,12 5,21' })),
          React.createElement('span', { key: 'resume-text' }, 'Resume Game')
        ])
      ])
    ])
  ]);
};

export default MainGameFile;
