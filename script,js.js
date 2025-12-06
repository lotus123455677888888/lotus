    function togglePause() {
      state.paused = !state.paused;
      if (state.paused) {
        clearInterval(state.timer);
        document.getElementById('pauseOverlay').classList.remove('hidden');
        playSound('pause');
      } else {
        startTimer();
        document.getElementById('pauseOverlay').classList.add('hidden');
      }
      saveGameState();
    }

    function resumeGame() {
      state.paused = false;
      startTimer();
      document.getElementById('pauseOverlay').classList.add('hidden');
      playSound('resume');
    }

    function toggleSound() {
      state.soundEnabled = !state.soundEnabled;
      const soundIcon = document.getElementById('soundIcon');
      soundIcon.textContent = state.soundEnabled ? '🔊' : '🔇';
      playSound('toggle');
      
      // Save sound preference
      localStorage.setItem('lotus_sound_enabled', state.soundEnabled.toString());
    }

    function playSound(type) {
      if (!state.soundEnabled) return;
      
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        switch(type) {
          case 'correct':
            // Play a pleasant chime sound
            playTone(523.25, 0.3, 'sine'); // C5
            setTimeout(() => playTone(659.25, 0.3, 'sine'), 100); // E5
            break;
            
          case 'wrong':
            // Play a low error sound
            playTone(220, 0.5, 'sawtooth'); // A3
            break;
            
          case 'pause':
            // Short pause sound
            playTone(392, 0.2, 'square'); // G4
            break;
            
          case 'resume':
            // Resume sound
            playTone(440, 0.2, 'sine'); // A4
            break;
            
          case 'toggle':
            // Toggle sound
            playTone(349.23, 0.1, 'sine'); // F4
            break;
        }
        
        function playTone(frequency, duration, waveType) {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = frequency;
          oscillator.type = waveType;
          
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + duration);
        }
      } catch (e) {
        console.log('Audio not supported or disabled');
      }
    }

    function saveGameState() {
      if (!state.gameActive) return;
      
      const saveData = {
        level: state.level,
        mistakes: state.mistakes,
        totalMistakes: state.totalMistakes,
        timeLeft: state.timeLeft,
        targetFlower: state.targetFlower,
        grid: state.grid,
        selected: state.selected,
        totalTargets: state.totalTargets,
        foundTargets: state.foundTargets,
        soundEnabled: state.soundEnabled,
        gameActive: state.gameActive,
        score: state.score,
        highScore: state.highScore,
        timestamp: Date.now()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    }

    function clearSavedGame() {
      localStorage.removeItem(STORAGE_KEY);
    }

    // Load sound preference on startup
    function loadSoundPreference() {
      const savedSound = localStorage.getItem('lotus_sound_enabled');
      if (savedSound !== null) {
        state.soundEnabled = savedSound === 'true';
        const soundIcon = document.getElementById('soundIcon');
        soundIcon.textContent = state.soundEnabled ? '🔊' : '🔇';
      }
    }

    // Initialize sound preference
    loadSoundPreference();

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(event) {
      if (!state.gameActive || state.paused) return;
      
      switch(event.key) {
        case 'Escape':
          togglePause();
          break;
        case ' ':
          event.preventDefault();
          // Space bar could be used for quick restart or other action
          break;
        case 'm':
        case 'M':
          toggleSound();
          break;
      }
    });

    // Prevent right-click menu in game
    document.addEventListener('contextmenu', function(event) {
      if (state.gameActive && !state.paused) {
        event.preventDefault();
      }
    });
  </script>
</body>
</html>