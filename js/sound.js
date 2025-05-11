// Check if SoundManager is already defined
if (typeof window.SoundManager === 'undefined') {
    /**
     * RADICAL SUDOKU EXTREME - Sound Manager
     * Handles all game sound effects and music
     */
    window.SoundManager = class {
        constructor() {
            this.sounds = {};
            this.soundEnabled = true;
            this.musicEnabled = true;
            this.backgroundMusicStarted = false;
            this.soundsInitialized = false;
            
            // Create audio elements
            this.createAudioElements();
            
            // Make the sound manager globally accessible
            window.soundManager = this;
            
            // Load sound effects
            this.loadSoundEffects();
            
            // Start background music when possible
            document.addEventListener('click', () => {
                if (this.musicEnabled && !this.backgroundMusicStarted) {
                    this.startBackgroundMusic();
                }
            }, { once: true });
        }

        /**
         * Create audio elements for all sound effects
         */
        createAudioElements() {
            const soundNames = [
                'start', 'click', 'select', 'correct', 'error', 
                'erase', 'hint', 'solve', 'victory', 
                'shootingStar', 'leaf', 'background', 'pause', 'resume'
            ];
            
            soundNames.forEach(name => {
                this.sounds[name] = this.createAudioElement(name);
            });
        }

        /**
         * Create an audio element for a sound effect
         * @param {string} name - Sound name
         * @returns {HTMLAudioElement} - Audio element
         */
        createAudioElement(name) {
            const audio = document.createElement('audio');
            audio.id = `sound-${name}`;
            audio.preload = 'auto';
            document.body.appendChild(audio);
            return audio;
        }

        /**
         * Load all sound effects using Web Audio API
         */
        loadSoundEffects() {
            try {
                // Create AudioContext but don't initialize it yet
                this.audioContext = null;
                
                // Add event listener for first user interaction
                document.addEventListener('click', () => {
                    if (!this.soundsInitialized) {
                        this.initializeAudio();
                    }
                }, { once: true });
                
            } catch (error) {
                console.error("Error setting up audio:", error);
                this.soundEnabled = false;
            }
        }
        
        /**
         * Initialize audio after user interaction
         */
        initializeAudio() {
            if (this.soundsInitialized) return;
            
            try {
                // Create AudioContext
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                
                // Generate sound effects
                this.generateSoundEffects();
                
                this.soundsInitialized = true;
                console.log("Audio initialized after user interaction");
            } catch (error) {
                console.error("Error initializing audio:", error);
                this.soundEnabled = false;
            }
        }

        /**
         * Generate retro sound effects using Web Audio API
         */
        generateSoundEffects() {
            // Generate basic sound effects
            this.generateBasicSounds();
            
            // Generate nature sounds
            this.generateNatureSounds();
            
            // Generate background music
            this.generateBackgroundMusic();
        }
        
        /**
         * Generate basic game sound effects
         */
        generateBasicSounds() {
            // Click sound (menu selection)
            this.generateSimpleTone('click', 800, 0.1, 0.5);
            
            // Select cell sound (short blip)
            this.generateSimpleTone('select', 600, 0.08, 0.3, true);
            
            // Correct number sound (positive feedback)
            this.generateSimpleTone('correct', 440, 0.3, 0.2, true);
            
            // Error sound (negative feedback)
            this.generateSimpleTone('error', 220, 0.3, 0.2, false);
            
            // Erase sound (quick swoosh)
            this.generateSimpleTone('erase', 2000, 0.15, 0.1, false, true);
            
            // Hint sound (magical reveal)
            this.generateSimpleTone('hint', 880, 0.5, 0.15, true);
            
            // Solve sound (completion)
            this.generateSimpleTone('solve', 660, 1.0, 0.2);
            
            // Victory sound (celebration)
            this.generateSimpleTone('victory', 440, 2.0, 0.2, true);
            
            // Start game sound (triumphant jingle)
            this.generateSimpleTone('start', 330, 1.5, 0.2, true);
            
            // Pause/resume sounds
            this.generateSimpleTone('pause', 440, 0.3, 0.2, false);
            this.generateSimpleTone('resume', 440, 0.3, 0.2, true);
        }
        
        /**
         * Generate a simple tone
         * @param {string} name - Sound name
         * @param {number} frequency - Base frequency
         * @param {number} duration - Duration in seconds
         * @param {number} volume - Volume (0-1)
         * @param {boolean} ascending - Whether tone should ascend (true) or descend (false)
         * @param {boolean} noise - Whether to add noise
         */
        generateSimpleTone(name, frequency, duration, volume, ascending = false, noise = false) {
            try {
                const sound = this.sounds[name];
                const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
                const data = buffer.getChannelData(0);
                
                for (let i = 0; i < buffer.length; i++) {
                    const t = i / this.audioContext.sampleRate;
                    const envelope = Math.max(0, 1 - t * (1/duration));
                    
                    // Calculate frequency with pitch bend
                    let freq = frequency;
                    if (ascending) {
                        freq = frequency * (1 + t * 0.5);
                    } else if (ascending === false) { // explicitly false, not just falsy
                        freq = frequency * (1 - t * 0.5);
                    }
                    
                    // Generate tone
                    let sample = Math.sin(2 * Math.PI * freq * t) * volume * envelope;
                    
                    // Add noise if requested
                    if (noise) {
                        sample += (Math.random() * 2 - 1) * 0.2 * envelope;
                    }
                    
                    data[i] = sample;
                }
                
                this.saveAudioToElement(sound, buffer);
            } catch (error) {
                console.error(`Error generating ${name} sound:`, error);
            }
        }
        
        /**
         * Generate nature sounds
         */
        generateNatureSounds() {
            // Bird chirping sound for leaves
            this.generateBirdChirpSound();
            
            // Forest ambience for shooting star
            this.generateForestAmbienceSound();
        }
        
        /**
         * Generate bird chirp sound
         */
        generateBirdChirpSound() {
            try {
                const sound = this.sounds.leaf;
                const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.5, this.audioContext.sampleRate);
                const data = buffer.getChannelData(0);
                
                // Create a gentle bird chirping sound
                for (let i = 0; i < buffer.length; i++) {
                    const t = i / this.audioContext.sampleRate;
                    
                    // Bird chirp pattern
                    let chirp = 0;
                    
                    // Create multiple short chirps
                    if (t < 0.1) {
                        const chirpEnvelope = Math.pow(Math.sin(Math.PI * t / 0.1), 2) * 0.3;
                        chirp = Math.sin(2 * Math.PI * 2000 * t) * chirpEnvelope;
                    } else if (t > 0.15 && t < 0.2) {
                        const chirpT = t - 0.15;
                        const chirpEnvelope = Math.pow(Math.sin(Math.PI * chirpT / 0.05), 2) * 0.2;
                        chirp = Math.sin(2 * Math.PI * 2200 * chirpT) * chirpEnvelope;
                    } else if (t > 0.3 && t < 0.4) {
                        const chirpT = t - 0.3;
                        const chirpEnvelope = Math.pow(Math.sin(Math.PI * chirpT / 0.1), 2) * 0.25;
                        chirp = Math.sin(2 * Math.PI * 1800 * chirpT) * chirpEnvelope;
                    }
                    
                    data[i] = chirp;
                }
                
                this.saveAudioToElement(sound, buffer);
            } catch (error) {
                console.error("Error generating bird chirp sound:", error);
            }
        }
        
        /**
         * Generate forest ambience sound
         */
        generateForestAmbienceSound() {
            try {
                const sound = this.sounds.shootingStar;
                const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 1.0, this.audioContext.sampleRate);
                const data = buffer.getChannelData(0);
                
                // Create a gentle forest ambience sound
                for (let i = 0; i < buffer.length; i++) {
                    const t = i / this.audioContext.sampleRate;
                    
                    // Base ambient sound - gentle wind
                    const wind = 0.05 * (Math.random() * 2 - 1) * Math.pow(Math.sin(Math.PI * t), 2);
                    
                    // Distant owl hoot
                    let owl = 0;
                    if (t > 0.3 && t < 0.6) {
                        const owlT = t - 0.3;
                        const owlEnvelope = Math.pow(Math.sin(Math.PI * owlT / 0.3), 2) * 0.2;
                        owl = Math.sin(2 * Math.PI * 300 * owlT) * owlEnvelope;
                    }
                    
                    // Distant cricket chirps
                    let cricket = 0;
                    if (t > 0.1 && t < 0.9) {
                        const cricketFreq = 800 + 200 * Math.sin(2 * Math.PI * 10 * t);
                        const cricketAmp = 0.05 * Math.pow(Math.sin(2 * Math.PI * 8 * t), 8);
                        cricket = Math.sin(2 * Math.PI * cricketFreq * t) * cricketAmp;
                    }
                    
                    data[i] = wind + owl + cricket;
                }
                
                this.saveAudioToElement(sound, buffer);
            } catch (error) {
                console.error("Error generating forest ambience sound:", error);
            }
        }
        
        /**
         * Generate background music
         */
        generateBackgroundMusic() {
            try {
                const sound = this.sounds.background;
                const duration = 10; // 10 seconds loop
                const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
                const data = buffer.getChannelData(0);
                
                // Create forest ambience background music
                for (let i = 0; i < buffer.length; i++) {
                    const t = i / this.audioContext.sampleRate;
                    
                    // Gentle wind base
                    const windFreq = 0.1 + 0.05 * Math.sin(2 * Math.PI * 0.05 * t);
                    const wind = 0.03 * Math.sin(2 * Math.PI * windFreq * t);
                    
                    // Distant bird calls
                    let birds = 0;
                    
                    // Multiple bird species with different patterns
                    if (Math.random() < 0.001) {
                        const birdLength = Math.floor(this.audioContext.sampleRate * 0.3); // 0.3 seconds
                        if (i + birdLength < buffer.length) {
                            const birdType = Math.floor(Math.random() * 3);
                            let birdFreq;
                            
                            switch (birdType) {
                                case 0: birdFreq = 1200 + Math.random() * 300; break; // Small bird
                                case 1: birdFreq = 800 + Math.random() * 200; break;  // Medium bird
                                case 2: birdFreq = 500 + Math.random() * 100; break;  // Large bird
                            }
                            
                            for (let k = 0; k < birdLength; k++) {
                                const birdT = k / this.audioContext.sampleRate;
                                const birdEnvelope = Math.pow(Math.sin(Math.PI * birdT / 0.3), 2) * 0.1;
                                const birdPattern = Math.sin(2 * Math.PI * birdFreq * birdT);
                                
                                // Add some frequency modulation for more natural sound
                                const modulation = 1 + 0.1 * Math.sin(2 * Math.PI * 20 * birdT);
                                
                                if (i + k < buffer.length) {
                                    data[i + k] += birdPattern * birdEnvelope * modulation;
                                }
                            }
                        }
                    }
                    
                    // Distant water sounds
                    const water = 0.01 * (Math.random() * 2 - 1) * Math.pow(Math.sin(Math.PI * t / duration), 2);
                    
                    // Occasional rustling leaves
                    let leaves = 0;
                    if (Math.random() < 0.002) {
                        leaves = 0.05 * (Math.random() * 2 - 1);
                    }
                    
                    data[i] = wind + birds + water + leaves;
                }
                
                this.saveAudioToElement(sound, buffer);
            } catch (error) {
                console.error("Error generating background music:", error);
            }
        }
        
        /**
         * Start playing background music
         */
        startBackgroundMusic() {
            if (!this.soundsInitialized || !this.musicEnabled) return;
            
            try {
                const music = this.sounds.background;
                if (music) {
                    music.loop = true;
                    music.volume = 0.3; // Lower volume for background music
                    
                    const playPromise = music.play();
                    
                    // Handle the promise returned by play()
                    if (playPromise !== undefined) {
                        playPromise.catch(e => {
                            console.log('Error playing background music:', e);
                        });
                    }
                    
                    this.backgroundMusicStarted = true;
                }
            } catch (error) {
                console.error("Error playing background music:", error);
            }
        }

        /**
         * Save audio buffer to an audio element
         * @param {HTMLAudioElement} element - Audio element
         * @param {AudioBuffer} buffer - Audio buffer
         */
        saveAudioToElement(element, buffer) {
            try {
                // Convert buffer to WAV format
                const wav = this.bufferToWav(buffer);
                const blob = new Blob([wav], { type: 'audio/wav' });
                const url = URL.createObjectURL(blob);
                
                // Set the source of the audio element
                element.src = url;
            } catch (error) {
                console.error("Error saving audio to element:", error);
            }
        }

        /**
         * Convert audio buffer to WAV format
         * @param {AudioBuffer} buffer - Audio buffer
         * @returns {ArrayBuffer} - WAV file as ArrayBuffer
         */
        bufferToWav(buffer) {
            const numChannels = buffer.numberOfChannels;
            const sampleRate = buffer.sampleRate;
            const format = 1; // PCM
            const bitDepth = 16;
            
            const bytesPerSample = bitDepth / 8;
            const blockAlign = numChannels * bytesPerSample;
            
            const data = this.getChannelData(buffer);
            const dataLength = data.length * bytesPerSample;
            const fileLength = 44 + dataLength;
            
            const arrayBuffer = new ArrayBuffer(fileLength);
            const view = new DataView(arrayBuffer);
            
            // RIFF chunk descriptor
            this.writeString(view, 0, 'RIFF');
            view.setUint32(4, fileLength - 8, true);
            this.writeString(view, 8, 'WAVE');
            
            // fmt sub-chunk
            this.writeString(view, 12, 'fmt ');
            view.setUint32(16, 16, true); // fmt chunk size
            view.setUint16(20, format, true);
            view.setUint16(22, numChannels, true);
            view.setUint32(24, sampleRate, true);
            view.setUint32(28, sampleRate * blockAlign, true); // byte rate
            view.setUint16(32, blockAlign, true);
            view.setUint16(34, bitDepth, true);
            
            // data sub-chunk
            this.writeString(view, 36, 'data');
            view.setUint32(40, dataLength, true);
            
            // Write the PCM samples
            const offset = 44;
            for (let i = 0; i < data.length; i++) {
                const sample = Math.max(-1, Math.min(1, data[i]));
                const value = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
                view.setInt16(offset + i * bytesPerSample, value, true);
            }
            
            return arrayBuffer;
        }

        /**
         * Get channel data from audio buffer
         * @param {AudioBuffer} buffer - Audio buffer
         * @returns {Float32Array} - Channel data
         */
        getChannelData(buffer) {
            const numChannels = buffer.numberOfChannels;
            const length = buffer.length;
            const result = new Float32Array(length);
            
            // Mix all channels down to mono
            for (let channel = 0; channel < numChannels; channel++) {
                const channelData = buffer.getChannelData(channel);
                for (let i = 0; i < length; i++) {
                    result[i] += channelData[i] / numChannels;
                }
            }
            
            return result;
        }

        /**
         * Write a string to a DataView
         * @param {DataView} view - DataView to write to
         * @param {number} offset - Offset to write at
         * @param {string} string - String to write
         */
        writeString(view, offset, string) {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        }

        /**
         * Play a sound effect
         * @param {string} name - Sound name
         */
        play(name) {
            if (!this.soundEnabled) return;
            
            try {
                // Check if audio is initialized
                if (!this.soundsInitialized) {
                    // Try to initialize on demand
                    this.initializeAudio();
                    // If still not initialized, return silently
                    if (!this.soundsInitialized) return;
                }
                
                const sound = this.sounds[name];
                if (sound) {
                    // Reset the current time to start from the beginning
                    if (sound.readyState >= 2) { // HAVE_CURRENT_DATA or higher
                        sound.currentTime = 0;
                    }
                    
                    // Play the sound with error handling
                    const playPromise = sound.play();
                    
                    // Handle the promise returned by play()
                    if (playPromise !== undefined) {
                        playPromise.catch(e => {
                            console.log('Error playing sound:', e);
                        });
                    }
                }
            } catch (error) {
                console.error("Error playing sound:", error);
            }
        }

        /**
         * Toggle sound on/off
         */
        toggleSound() {
            this.soundEnabled = !this.soundEnabled;
            
            // Update the sound button icon
            const soundButton = document.getElementById('sound-toggle');
            if (soundButton) {
                soundButton.textContent = this.soundEnabled ? '🔊' : '🔇';
            }
            
            // Try to initialize audio if not already done
            if (this.soundEnabled && !this.soundsInitialized) {
                this.initializeAudio();
            }
            
            // Toggle background music
            if (this.soundEnabled && this.soundsInitialized) {
                if (!this.backgroundMusicStarted) {
                    this.startBackgroundMusic();
                } else if (this.sounds.background) {
                    const playPromise = this.sounds.background.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(e => console.log('Error resuming background music:', e));
                    }
                }
                this.play('click');
            } else {
                if (this.sounds.background) {
                    this.sounds.background.pause();
                }
            }
        }
    };
}
