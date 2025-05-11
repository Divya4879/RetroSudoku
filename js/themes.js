/**
 * RADICAL SUDOKU EXTREME - Theme Manager
 * Handles theme switching and animations
 */

class ThemeManager {
    constructor() {
        this.currentTheme = 'dark'; // Default theme
        this.animationsEnabled = true;
        this.animationElements = [];
        this.soundsEnabled = true;
        
        console.log("ThemeManager initialized");
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Apply the default theme
        this.applyTheme(this.currentTheme);
    }
    
    /**
     * Set up event listeners for theme controls
     */
    setupEventListeners() {
        // Theme toggle button
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            console.log("Theme toggle button found");
            themeToggle.addEventListener('click', () => {
                console.log("Theme toggle clicked");
                this.toggleTheme();
            });
        } else {
            console.error("Theme toggle button not found");
        }
        
        // Animation toggle button
        const animationToggle = document.getElementById('animation-toggle');
        if (animationToggle) {
            console.log("Animation toggle button found");
            animationToggle.addEventListener('click', () => {
                console.log("Animation toggle clicked");
                this.toggleAnimations();
            });
        } else {
            console.error("Animation toggle button not found");
        }
    }
    
    /**
     * Toggle between dark and light themes
     */
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        console.log("Toggling theme to:", this.currentTheme);
        this.applyTheme(this.currentTheme);
        
        // Update the theme toggle button
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.textContent = this.currentTheme === 'dark' ? '🌙' : '☀️';
        }
    }
    
    /**
     * Apply the specified theme
     * @param {string} theme - Theme name ('dark' or 'light')
     */
    applyTheme(theme) {
        console.log("Applying theme:", theme);
        
        // Remove existing theme classes
        document.body.classList.remove('theme-dark', 'theme-light');
        
        // Add the new theme class
        document.body.classList.add(`theme-${theme}`);
        
        // Clear existing animations
        this.clearAnimations();
        
        // Create new animations based on the theme
        if (this.animationsEnabled) {
            if (theme === 'dark') {
                this.createSpaceAnimations();
            } else {
                this.createSunnyAnimations();
            }
        }
    }
    
    /**
     * Toggle animations on/off
     */
    toggleAnimations() {
        this.animationsEnabled = !this.animationsEnabled;
        console.log("Toggling animations:", this.animationsEnabled ? "on" : "off");
        
        // Update the animation toggle button
        const animationToggle = document.getElementById('animation-toggle');
        if (animationToggle) {
            animationToggle.textContent = this.animationsEnabled ? '✨' : '✖️';
        }
        
        // Apply the current theme to update animations
        this.applyTheme(this.currentTheme);
    }
    
    /**
     * Clear all animation elements
     */
    clearAnimations() {
        console.log("Clearing animations");
        
        // Remove existing animation containers
        const containers = document.querySelectorAll('.stars-container, .sun, .cloud, .leaf');
        containers.forEach(container => {
            container.remove();
        });
        
        // Clear the animation elements array
        this.animationElements = [];
    }
    
    /**
     * Create space-themed animations (stars, shooting stars)
     */
    createSpaceAnimations() {
        console.log("Creating space animations");
        
        // Create stars container
        const starsContainer = document.createElement('div');
        starsContainer.className = 'stars-container';
        document.body.appendChild(starsContainer);
        
        // Create twinkling stars with different colors
        this.createTwinklingStars(starsContainer);
        
        // Create shooting stars
        this.createShootingStars(starsContainer);
    }
    
    /**
     * Create twinkling stars
     */
    createTwinklingStars(starsContainer) {
        // Create twinkling stars with different colors - more stars and larger ones
        for (let i = 0; i < 100; i++) { // Increased from 50 to 100 stars
            const star = document.createElement('div');
            star.className = 'star';
            
            // Random position
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            
            // Random size for more star-like appearance - increased size range
            const size = Math.random() * 9 + 1; // Increased from 3+1 to 6+1
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            
            // Random animation delay
            star.style.animationDelay = `${Math.random() * 5}s`;
            
            // Random brightness
            const brightness = Math.random() * 50 + 50;
            star.style.filter = `brightness(${brightness}%)`;
            
            // Random color (silver, gold, light blue)
            const colorType = Math.floor(Math.random() * 3);
            switch (colorType) {
                case 0:
                    star.classList.add('silver');
                    break;
                case 1:
                    star.classList.add('gold');
                    break;
                case 2:
                    star.classList.add('light-blue');
                    break;
            }
            
            // Create star shape for more stars (increased from 20% to 30%)
            if (Math.random() < 0.3) {
                star.classList.add('star-shape');
                // Make shaped stars larger
                star.style.width = `${size * 3}px`;
                star.style.height = `${size * 3}px`;
            }
            
            starsContainer.appendChild(star);
            this.animationElements.push(star);
        }
    }
    
    /**
     * Create shooting stars at random intervals
     * @param {HTMLElement} container - Container element for the stars
     */
    createShootingStars(container) {
        // Create initial shooting stars
        for (let i = 0; i < 2; i++) {
            this.createShootingStar(container);
        }
        
        // Create new shooting stars periodically
        setInterval(() => {
            if (this.currentTheme === 'dark' && this.animationsEnabled) {
                this.createShootingStar(container);
            }
        }, 4000);
    }
    
    /**
     * Create a single shooting star
     * @param {HTMLElement} container - Container element for the star
     */
    createShootingStar(container) {
        const star = document.createElement('div');
        star.className = 'shooting-star';
        
        // Random position
        const startX = Math.random() * window.innerWidth * 0.7;
        const startY = Math.random() * (window.innerHeight / 3);
        
        star.style.left = `${startX}px`;
        star.style.top = `${startY}px`;
        
        // Random angle for the tail
        const angle = Math.random() * 30 - 15; // -15 to 15 degrees
        star.style.transform = `rotate(${angle}deg)`;
        
        // Slower animation duration (4-8 seconds)
        const duration = Math.random() * 4 + 4;
        star.style.animationDuration = `${duration}s`;
        
        // Random size for more impressive comets
        const size = Math.random() * 4 + 3;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // Random tail length
        const tailLength = Math.random() * 60 + 60;
        const tail = star.appendChild(document.createElement('div'));
        tail.style.width = `${tailLength}px`;
        
        // Random color (slight variations of white/blue)
        const hue = Math.random() * 60 + 180; // Blue-ish hues
        const saturation = Math.random() * 30 + 70;
        star.style.background = `hsl(${hue}, ${saturation}%, 90%)`;
        star.style.boxShadow = `0 0 10px hsl(${hue}, ${saturation}%, 90%), 0 0 20px hsl(${hue}, ${saturation}%, 80%)`;
        
        container.appendChild(star);
        this.animationElements.push(star);
        
        // Play shooting star sound
        if (window.soundManager && this.soundsEnabled) {
            window.soundManager.playShootingStar();
        }
        
        // Remove the star after animation completes
        setTimeout(() => {
            if (star.parentNode === container) {
                container.removeChild(star);
                const index = this.animationElements.indexOf(star);
                if (index > -1) {
                    this.animationElements.splice(index, 1);
                }
            }
        }, duration * 1000 + 100);
    }
    
    /**
     * Create sunny-themed animations (sun, clouds, leaves)
     */
    createSunnyAnimations() {
        console.log("Creating sunny animations");
        
        // Create sun
        const sun = document.createElement('div');
        sun.className = 'sun';
        document.body.appendChild(sun);
        this.animationElements.push(sun);
        
        // Create clouds - more clouds with different sizes and speeds
        for (let i = 0; i < 6; i++) {
            this.createCloud();
        }
        
        // Create falling leaves periodically with different types
        setInterval(() => {
            if (this.currentTheme === 'light' && this.animationsEnabled) {
                this.createLeaf();
            }
        }, 2000);
    }
    
    /**
     * Create a cloud element
     */
    createCloud() {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        
        // Random position and size
        const top = Math.random() * (window.innerHeight / 2);
        const width = Math.random() * 150 + 100; // Larger clouds
        const height = width * 0.6;
        
        cloud.style.top = `${top}px`;
        cloud.style.width = `${width}px`;
        cloud.style.height = `${height}px`;
        
        // Faster speed - reduced duration
        const duration = Math.random() * 30 + 20; // 20-50 seconds instead of 40-100
        cloud.style.animationDuration = `${duration}s`;
        
        // Random delay
        cloud.style.animationDelay = `${Math.random() * -30}s`;
        
        // Random opacity
        cloud.style.opacity = (Math.random() * 0.3 + 0.7).toString();
        
        document.body.appendChild(cloud);
        this.animationElements.push(cloud);
    }
    
    /**
     * Create a leaf element
     */
    createLeaf() {
        const leaf = document.createElement('div');
        
        // Random leaf type (1-5)
        const leafType = Math.floor(Math.random() * 5) + 1;
        leaf.className = `leaf leaf-${leafType}`;
        
        // Random position
        const left = Math.random() * window.innerWidth;
        leaf.style.left = `${left}px`;
        
        // Random animation duration
        const duration = Math.random() * 10 + 10;
        leaf.style.animationDuration = `${duration}s`;
        
        // Random size (larger leaves)
        const size = Math.random() * 20 + 15;
        leaf.style.width = `${size}px`;
        leaf.style.height = `${size}px`;
        
        // Random rotation
        const rotation = Math.random() * 360;
        leaf.style.transform = `rotate(${rotation}deg)`;
        
        // Random wobble effect
        leaf.style.animationTimingFunction = `cubic-bezier(${Math.random()}, ${Math.random()}, ${Math.random()}, ${Math.random()})`;
        
        document.body.appendChild(leaf);
        this.animationElements.push(leaf);
        
        // Play leaf sound
        if (window.soundManager && this.soundsEnabled) {
            window.soundManager.playLeaf();
        }
        
        // Remove the leaf after animation completes
        setTimeout(() => {
            if (leaf.parentNode) {
                document.body.removeChild(leaf);
                const index = this.animationElements.indexOf(leaf);
                if (index > -1) {
                    this.animationElements.splice(index, 1);
                }
            }
        }, duration * 1000 + 1000);
    }
}
