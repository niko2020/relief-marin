class ReliefMarinApp {
    constructor() {
        this.config = null;
        this.images = {
            satellite: null,
            relief: null,
            maps: null
        };
        this.currentBase = 'satellite'; // satellite ou maps
        this.reliefOpacity = 0.5;
        this.currentPosition = null;
        
        // DOM Elements
        this.elements = {
            baseLayer: document.getElementById('baseLayer'),
            overlayLayer: document.getElementById('overlayLayer'),
            gpsMarker: document.getElementById('gpsMarker'),
            transparencySlider: document.getElementById('transparencySlider'),
            satelliteBtn: document.getElementById('satelliteBtn'),
            mapsBtn: document.getElementById('mapsBtn'),
            gpsButton: document.getElementById('gpsButton'),
            resetButton: document.getElementById('resetButton')
        };
        
        this.initializeApp();
    }
    
    async initializeApp() {
        try {
            this.showLoadingOverlay('Initialisation...');
            this.updateStatus('Initialisation...');
            
            // Load configuration
            await this.loadConfiguration();
            this.updateLoadingOverlay('Configuration chargée...');
            
            // Load images with progress
            await this.loadImages();
            this.updateLoadingOverlay('Images chargées...');
            
            // Initialize event listeners
            this.initializeEventListeners();
            this.initializeKeyboardNavigation();
            
            // Initialize touch controls
            this.initializeTouchControls();
            
            // Handle orientation changes
            this.handleOrientationChange();
            
            // Register service worker
            this.registerServiceWorker();
            
            // Display initial state
            this.displayImages();
            
            // Show version badge
            this.showVersionBadge();
            
            this.hideLoadingOverlay();
            this.updateStatus('Prêt');
            this.showNotification('Application prête', 'success');
            
        } catch (error) {
            console.error('Erreur d\'initialisation:', error);
            this.hideLoadingOverlay();
            this.updateStatus('Erreur de chargement');
            this.showNotification('Erreur lors du chargement', 'error');
        }
    }
    
    async loadConfiguration() {
        try {
            const response = await fetch('config/map-config.json');
            this.config = await response.json();
            console.log('✅ Configuration chargée:', this.config);
        } catch (error) {
            console.warn('⚠️ Configuration non trouvée, utilisation des valeurs par défaut');
            this.config = {
                bounds: { north: 43.3000, south: 43.2500, west: 5.3500, east: 5.4000 },
                center: { lat: 43.2750, lon: 5.3750 },
                name: "Zone Relief Marin",
                images: {
                    satellite: "media/satellite.jpg",
                    relief: "media/relief.jpg",
                    maps: "media/maps.jpg"
                }
            };
        }
    }
    
    async loadImages() {
        const imageTypes = ['satellite', 'relief', 'maps'];
        
        this.updateStatus('Chargement des images...');
        
        for (const type of imageTypes) {
            try {
                await this.loadImage(type);
            } catch (error) {
                console.warn(`Erreur chargement ${type}:`, error);
                this.images[type] = this.generatePlaceholderImage(type);
            }
        }
        
        this.updateStatus('Images chargées');
    }
    
    loadImage(type) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            const timeout = setTimeout(() => {
                console.warn(`Timeout pour ${type}, utilisation placeholder`);
                reject(new Error('Timeout'));
            }, 5000);
            
            img.onload = () => {
                clearTimeout(timeout);
                this.images[type] = img.src;
                console.log(`✅ Image ${type} chargée`);
                resolve();
            };
            
            img.onerror = () => {
                clearTimeout(timeout);
                console.warn(`❌ Image ${type} non trouvée`);
                reject(new Error('Image not found'));
            };
            
            const imagePath = this.config.images[type] || `media/${type}.jpg`;
            const timestamp = Date.now();
            img.src = `${imagePath}?v=${timestamp}`;
        });
    }
    
    generatePlaceholderImage(type) {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        
        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, 800, 600);
        if (type === 'satellite') {
            gradient.addColorStop(0, '#0ea5e9');
            gradient.addColorStop(0.5, '#0284c7');
            gradient.addColorStop(1, '#0369a1');
        } else if (type === 'relief') {
            gradient.addColorStop(0, '#10b981');
            gradient.addColorStop(0.5, '#059669');
            gradient.addColorStop(1, '#047857');
        } else {
            gradient.addColorStop(0, '#8b5cf6');
            gradient.addColorStop(0.5, '#7c3aed');
            gradient.addColorStop(1, '#6d28d9');
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 600);
        
        // Add some pattern/texture
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * 800;
            const y = Math.random() * 600;
            const radius = Math.random() * 40 + 10;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Title
        ctx.fillStyle = 'white';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        const titles = {
            satellite: 'VUE SATELLITE',
            relief: 'RELIEF SOUS-MARIN', 
            maps: 'CARTE MARINE'
        };
        
        ctx.fillText(titles[type] || type.toUpperCase(), 400, 280);
        
        // Subtitle
        ctx.font = '18px Arial';
        ctx.fillText('Image de démonstration', 400, 320);
        
        return canvas.toDataURL('image/jpeg', 0.8);
    }
    
    displayImages() {
        // Base layer (satellite ou maps)
        this.elements.baseLayer.style.backgroundImage = `url("${this.images[this.currentBase]}")`;
        
        // Overlay layer (toujours relief)
        this.elements.overlayLayer.style.backgroundImage = `url("${this.images.relief}")`;
        this.elements.overlayLayer.style.opacity = this.reliefOpacity;
        
        // Update controls
        this.updateToggleButtons();
        const valueDisplay = document.getElementById('transparencyValue');
        if (valueDisplay) {
            valueDisplay.textContent = `${Math.round(this.reliefOpacity * 100)}%`;
        }
        this.elements.transparencySlider.value = Math.round(this.reliefOpacity * 100);
        
        console.log('✅ Images affichées - Base:', this.currentBase, 'Relief opacity:', this.reliefOpacity);
    }
    
    initializeEventListeners() {
        // Transparency slider
        this.elements.transparencySlider.addEventListener('input', (e) => {
            this.updateTransparency(e.target.value);
        });
        
        // Base layer toggle buttons
        this.elements.satelliteBtn.addEventListener('click', () => {
            this.switchBase('satellite');
        });
        
        this.elements.mapsBtn.addEventListener('click', () => {
            this.switchBase('maps');
        });
        
        // GPS button
        this.elements.gpsButton.addEventListener('click', () => {
            this.getCurrentPosition();
        });

        // Reset button
        if (this.elements.resetButton) {
            this.elements.resetButton.addEventListener('click', () => {
                this.resetMapView();
            });
        }

    }
    
    updateTransparency(value) {
        this.reliefOpacity = value / 100;
        this.elements.overlayLayer.style.opacity = this.reliefOpacity;
        const valueDisplay = document.getElementById('transparencyValue');
        if (valueDisplay) {
            valueDisplay.textContent = `${value}%`;
        }
    }
    
    switchBase(baseType) {
        if (this.currentBase === baseType) return;
        
        this.currentBase = baseType;
        this.elements.baseLayer.style.backgroundImage = `url("${this.images[this.currentBase]}")`;
        this.updateToggleButtons();
        
        const displayName = baseType === 'satellite' ? 'Satellite' : 'Carte Marine';
        this.showNotification(`Couche de base: ${displayName}`);
    }
    
    updateToggleButtons() {
        this.elements.satelliteBtn.classList.toggle('active', this.currentBase === 'satellite');
        this.elements.mapsBtn.classList.toggle('active', this.currentBase === 'maps');
        
        // Update ARIA attributes for accessibility
        this.elements.satelliteBtn.setAttribute('aria-pressed', this.currentBase === 'satellite');
        this.elements.mapsBtn.setAttribute('aria-pressed', this.currentBase === 'maps');
    }
    
    getCurrentPosition() {
        if (!navigator.geolocation) {
            this.showNotification('Géolocalisation non supportée', 'error');
            return;
        }
        
        const button = this.elements.gpsButton;
        button.innerHTML = '📡';
        button.disabled = true;
        
        const options = {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000
        };
        
        navigator.geolocation.getCurrentPosition(
            (position) => this.onLocationSuccess(position),
            (error) => this.onLocationError(error),
            options
        );
    }
    
    onLocationSuccess(position) {
        this.currentPosition = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
        };
        
        this.showGPSMarker();
        
        this.elements.gpsButton.innerHTML = '📍';
        this.elements.gpsButton.disabled = false;
        this.elements.gpsButton.classList.add('active');
        
        setTimeout(() => {
            this.elements.gpsButton.classList.remove('active');
        }, 3000);
        
        this.showNotification('Position GPS obtenue', 'success');
    }
    
    onLocationError(error) {
        console.error('GPS Error:', error);
        
        this.elements.gpsButton.innerHTML = '📍';
        this.elements.gpsButton.disabled = false;
        
        let message = 'Erreur de géolocalisation';
        if (window.location.protocol === 'file:') {
            message = 'GPS nécessite HTTPS - Position simulée';
            this.simulateGPSPosition();
            return;
        }
        
        switch (error.code) {
            case error.PERMISSION_DENIED:
                message = 'Permission GPS refusée';
                break;
            case error.POSITION_UNAVAILABLE:
                message = 'Position GPS indisponible';
                break;
            case error.TIMEOUT:
                message = 'Délai GPS dépassé';
                break;
        }
        
        this.showNotification(message, 'error');
    }
    
    simulateGPSPosition() {
        const bounds = this.config.bounds;
        const lat = bounds.south + Math.random() * (bounds.north - bounds.south);
        const lon = bounds.west + Math.random() * (bounds.east - bounds.west);
        
        const simulatedPosition = {
            coords: {
                latitude: lat,
                longitude: lon,
                accuracy: 10 + Math.random() * 20
            }
        };
        
        this.onLocationSuccess(simulatedPosition);
        this.showNotification('Position simulée (test local)', 'warning');
    }
    
    showGPSMarker() {
        if (!this.currentPosition) return;
        
        const { lat, lon } = this.currentPosition;
        const { x, y, inBounds } = this.calculateGPSPixelPosition(lat, lon);
        
        if (!inBounds) {
            this.elements.gpsMarker.style.display = 'none';
            this.showNotification('Position GPS hors de la carte', 'warning');
            return;
        }
        
        this.elements.gpsMarker.style.left = `${x}px`;
        this.elements.gpsMarker.style.top = `${y}px`;
        this.elements.gpsMarker.style.display = 'block';
        
        this.showNotification('Position GPS affichée', 'success');
    }
    
    calculateGPSPixelPosition(lat, lon) {
        const bounds = this.config.bounds;
        const inBounds = lat >= bounds.south && lat <= bounds.north && 
                        lon >= bounds.west && lon <= bounds.east;
        
        if (!inBounds) {
            return { x: -1, y: -1, inBounds: false };
        }
        
        const viewport = document.querySelector('.map-viewport');
        const rect = viewport.getBoundingClientRect();
        
        const normalizedX = (lon - bounds.west) / (bounds.east - bounds.west);
        const normalizedY = (bounds.north - lat) / (bounds.north - bounds.south);
        
        const x = normalizedX * rect.width;
        const y = normalizedY * rect.height;
        
        return { x, y, inBounds: true };
    }
    
    updateStatus(message) {
        // Status simplifié - log uniquement
        console.log(`📊 Status: ${message}`);
    }
    
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        const isMobile = window.innerWidth <= 768;
        const topPosition = isMobile ? 'calc(max(env(safe-area-inset-top), 10px) + 10px)' : '70px';
        
        notification.style.cssText = `
            position: fixed;
            top: ${topPosition};
            left: 50%;
            transform: translateX(-50%);
            padding: ${isMobile ? '8px 12px' : '10px 16px'};
            background: ${type === 'error' ? 'var(--danger)' : type === 'success' ? 'var(--accent)' : type === 'warning' ? 'var(--warning)' : 'var(--primary)'};
            color: white;
            border-radius: 6px;
            font-size: ${isMobile ? '0.75rem' : '0.8rem'};
            font-weight: 500;
            z-index: 1000;
            box-shadow: var(--shadow);
            animation: slideIn 0.3s ease;
            max-width: ${isMobile ? '85%' : '350px'};
            text-align: center;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 2500);
    }
    
    showLoadingOverlay(message) {
        let overlay = document.getElementById('loadingOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loadingOverlay';
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <div class="loading-text" id="loadingText">${message}</div>
                </div>
            `;
            document.body.appendChild(overlay);
        }
        
        overlay.classList.add('active');
        this.updateLoadingOverlay(message);
    }
    
    updateLoadingOverlay(message) {
        const loadingText = document.getElementById('loadingText');
        if (loadingText) {
            loadingText.textContent = message;
        }
    }
    
    hideLoadingOverlay() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        }
    }
    
    initializeKeyboardNavigation() {
        // Support navigation clavier pour l'accessibilité
        document.addEventListener('keydown', (e) => {
            // Échapper pour réinitialiser la vue
            if (e.key === 'Escape') {
                this.resetMapView();
            }
            
            // Touches 1 et 2 pour changer de couche de base
            if (e.key === '1') {
                this.switchBase('satellite');
            } else if (e.key === '2') {
                this.switchBase('maps');
            }
            
            // Espace pour GPS
            if (e.key === ' ' && e.target === document.body) {
                e.preventDefault();
                this.getCurrentPosition();
            }
            
            // Flèches pour ajuster la transparence
            if (e.target === this.elements.transparencySlider) {
                if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                    const newValue = Math.max(0, parseInt(this.elements.transparencySlider.value) - 5);
                    this.elements.transparencySlider.value = newValue;
                    this.updateTransparency(newValue);
                } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                    const newValue = Math.min(100, parseInt(this.elements.transparencySlider.value) + 5);
                    this.elements.transparencySlider.value = newValue;
                    this.updateTransparency(newValue);
                }
            }
        });
    }
    
    resetMapView() {
        // Réinitialiser la vue de la carte (zoom et position)
        const viewport = document.querySelector('.map-viewport');
        if (viewport) {
            this.elements.baseLayer.style.transform = 'translate(0px, 0px) scale(1)';
            this.elements.overlayLayer.style.transform = 'translate(0px, 0px) scale(1)';
            this.showNotification('Vue réinitialisée', 'info');
        }
    }
    
    updateGPSStatus(message) {
        const gpsStatus = document.getElementById('gps-status');
        if (gpsStatus) {
            gpsStatus.textContent = message;
        }
    }
    
    showDebugInfo() {
        const debugInfo = [
            `📊 État des images:`,
            `• Satellite: ${this.images.satellite ? (this.images.satellite.startsWith('data:') ? '🎨 Démo' : '✅ Réelle') : '❌ Manquante'}`,
            `• Relief: ${this.images.relief ? (this.images.relief.startsWith('data:') ? '🎨 Démo' : '✅ Réelle') : '❌ Manquante'}`,
            `• Maps: ${this.images.maps ? (this.images.maps.startsWith('data:') ? '🎨 Démo' : '✅ Réelle') : '❌ Manquante'}`,
            ``,
            `🔄 État actuel:`,
            `• Base: ${this.currentBase}`,
            `• Relief opacity: ${Math.round(this.reliefOpacity * 100)}%`,
            ``,
            `📍 GPS: ${this.currentPosition ? '✅ Actif' : '⏸️ Inactif'}`,
            `🌍 Zone: ${this.config.name}`,
            ``,
            `⌨️ Raccourcis clavier:`,
            `• Échap: Réinitialiser la vue`,
            `• 1: Vue satellite`,
            `• 2: Carte marine`,
            `• Espace: GPS`
        ].join('\n');
        
        alert(debugInfo);
    }
    
    showVersionBadge() {
        const now = new Date();
        const dateStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        
        const badge = document.createElement('div');
        badge.id = 'versionBadge';
        badge.style.cssText = `
            position: fixed;
            bottom: calc(max(env(safe-area-inset-bottom), 10px) + 10px);
            right: 10px;
            background: rgba(15, 23, 42, 0.95);
            color: var(--text-primary);
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.7rem;
            font-weight: 500;
            z-index: 999;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(148, 163, 184, 0.2);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
            cursor: pointer;
            animation: fadeIn 0.3s ease;
            transition: opacity 0.3s ease;
        `;
        
        badge.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 2px; align-items: flex-end;">
                <span style="color: var(--primary); font-weight: 600;">v2.0</span>
                <span style="color: var(--text-secondary); font-size: 0.65rem;">${dateStr} ${timeStr}</span>
            </div>
        `;
        
        document.body.appendChild(badge);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            badge.style.opacity = '0';
            setTimeout(() => {
                if (badge.parentNode) {
                    badge.parentNode.removeChild(badge);
                }
            }, 300);
        }, 5000);
        
        // Hide on click
        badge.addEventListener('click', () => {
            badge.style.opacity = '0';
            setTimeout(() => {
                if (badge.parentNode) {
                    badge.parentNode.removeChild(badge);
                }
            }, 300);
        });
        
        // Add fadeIn animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }
    
    initializeTouchControls() {
        let scale = 1;
        let translateX = 0;
        let translateY = 0;
        let initialDistance = 0;
        let lastTouchX = 0;
        let lastTouchY = 0;
        let isPinching = false;
        let initialScale = 1;
        let initialTranslateX = 0;
        let initialTranslateY = 0;
        let pinchCenterX = 0;
        let pinchCenterY = 0;

        const viewport = document.querySelector('.map-viewport');
        const MAX_SCALE = 10;
        const MIN_SCALE = 1;
        
        // Get the center point between two touches
        const getTouchCenter = (touch1, touch2) => {
            const rect = viewport.getBoundingClientRect();
            return {
                x: (touch1.clientX + touch2.clientX) / 2 - rect.left,
                y: (touch1.clientY + touch2.clientY) / 2 - rect.top
            };
        };

        // Get distance between two touches
        const getTouchDistance = (touch1, touch2) => {
            return Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
        };
        
        // Constrain translation to keep image covering viewport
        const constrainTranslation = (tx, ty, currentScale) => {
            if (currentScale <= MIN_SCALE) {
                return { x: 0, y: 0 };
            }

            const rect = viewport.getBoundingClientRect();
            const scaledWidth = rect.width * currentScale;
            const scaledHeight = rect.height * currentScale;

            // Maximum translation is half the difference between scaled and viewport size
            const maxTranslateX = (scaledWidth - rect.width) / 2;
            const maxTranslateY = (scaledHeight - rect.height) / 2;

            return {
                x: Math.min(Math.max(tx, -maxTranslateX), maxTranslateX),
                y: Math.min(Math.max(ty, -maxTranslateY), maxTranslateY)
            };
        };
        
        const updateTransform = (applyConstraints = false) => {
            // Only apply strict constraints when requested (on touchend)
            if (applyConstraints) {
                scale = Math.max(MIN_SCALE, Math.min(scale, MAX_SCALE));
                const constrained = constrainTranslation(translateX, translateY, scale);
                translateX = constrained.x;
                translateY = constrained.y;
            }

            const transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
            this.elements.baseLayer.style.transform = transform;
            this.elements.overlayLayer.style.transform = transform;

            // Update GPS marker position if visible
            if (this.elements.gpsMarker.style.display !== 'none' && this.currentPosition) {
                const { x: gpsX, y: gpsY } = this.calculateGPSPixelPosition(
                    this.currentPosition.lat,
                    this.currentPosition.lon
                );

                if (gpsX >= 0 && gpsY >= 0) {
                    const finalX = gpsX * scale + translateX;
                    const finalY = gpsY * scale + translateY;
                    this.elements.gpsMarker.style.left = `${finalX}px`;
                    this.elements.gpsMarker.style.top = `${finalY}px`;
                }
            }
        };
        
        const resetTransform = () => {
            scale = 1;
            translateX = 0;
            translateY = 0;
            updateTransform();
            this.showNotification('Vue réinitialisée', 'info');
        };
        
        viewport.addEventListener('touchstart', (e) => {
            e.preventDefault();

            if (e.touches.length === 2) {
                // Start pinch zoom
                isPinching = true;
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];

                initialDistance = getTouchDistance(touch1, touch2);
                initialScale = scale;
                initialTranslateX = translateX;
                initialTranslateY = translateY;

                const center = getTouchCenter(touch1, touch2);
                pinchCenterX = center.x;
                pinchCenterY = center.y;

            } else if (e.touches.length === 1 && !isPinching) {
                // Start pan
                lastTouchX = e.touches[0].clientX;
                lastTouchY = e.touches[0].clientY;
                initialTranslateX = translateX;
                initialTranslateY = translateY;
            }
        }, { passive: false });
        
        viewport.addEventListener('touchmove', (e) => {
            e.preventDefault();

            if (e.touches.length === 2 && isPinching) {
                // Handle pinch zoom
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];

                const currentDistance = getTouchDistance(touch1, touch2);
                if (initialDistance === 0) return;

                // Calculate new scale
                const scaleChange = currentDistance / initialDistance;
                const newScale = initialScale * scaleChange;

                // Clamp scale during gesture (soft limits)
                scale = Math.max(MIN_SCALE * 0.8, Math.min(newScale, MAX_SCALE * 1.2));

                // Calculate zoom around pinch center
                // The point under pinchCenter should stay under pinchCenter
                const scaleDelta = scale - initialScale;
                translateX = initialTranslateX - (pinchCenterX * scaleDelta);
                translateY = initialTranslateY - (pinchCenterY * scaleDelta);

                updateTransform();

            } else if (e.touches.length === 1 && !isPinching) {
                // Handle pan
                const deltaX = e.touches[0].clientX - lastTouchX;
                const deltaY = e.touches[0].clientY - lastTouchY;

                translateX = initialTranslateX + deltaX;
                translateY = initialTranslateY + deltaY;

                updateTransform();
            }
        }, { passive: false });
        
        viewport.addEventListener('touchend', (e) => {
            // Reset pinching flag when less than 2 touches remain
            if (e.touches.length < 2) {
                isPinching = false;
            }

            // Apply final constraints when all fingers are lifted
            if (e.touches.length === 0) {
                // Enable smooth transition
                this.elements.baseLayer.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                this.elements.overlayLayer.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

                // Apply strict constraints
                updateTransform(true);

                // Remove transition after animation completes
                setTimeout(() => {
                    this.elements.baseLayer.style.transition = '';
                    this.elements.overlayLayer.style.transition = '';
                }, 300);
            }

            // Triple tap to reset (kept for backward compatibility)
            if (e.changedTouches.length === 1 && Date.now() - (this.lastTapTime || 0) < 300) {
                this.tapCount = (this.tapCount || 0) + 1;
                if (this.tapCount >= 3) {
                    resetTransform();
                    this.tapCount = 0;
                }
            } else {
                this.tapCount = 1;
            }
            this.lastTapTime = Date.now();
        });
        
        viewport.addEventListener('dblclick', (e) => {
            e.preventDefault();
            resetTransform();
        });
        
        // Handle window resize to recalculate min scale
        window.addEventListener('resize', () => {
            updateTransform();
        });
    }
    
    handleOrientationChange() {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                if (this.elements.gpsMarker.style.display !== 'none' && this.currentPosition) {
                    this.showGPSMarker();
                }
            }, 200);
        });
        
        window.addEventListener('resize', () => {
            if (this.currentPosition) {
                this.showGPSMarker();
            }
        });
    }
    
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            const swCode = `
                const CACHE_NAME = 'relief-marin-v4';
                const urlsToCache = [
                    './',
                    './index.html',
                    './css/main.css',
                    './css/components.css',
                    './js/app.js',
                    './config/map-config.json',
                    './media/satellite.jpg',
                    './media/relief.jpg',
                    './media/maps.jpg'
                ];
                
                self.addEventListener('install', (event) => {
                    event.waitUntil(
                        caches.open(CACHE_NAME)
                        .then((cache) => cache.addAll(urlsToCache.filter(url => url)))
                        .catch(err => console.log('Cache install error:', err))
                    );
                });
                
                self.addEventListener('fetch', (event) => {
                    event.respondWith(
                        caches.match(event.request)
                        .then((response) => {
                            return response || fetch(event.request);
                        })
                    );
                });
            `;
            
            const blob = new Blob([swCode], { type: 'application/javascript' });
            const swUrl = URL.createObjectURL(blob);
            
            navigator.serviceWorker.register(swUrl)
                .then((registration) => {
                    console.log('ServiceWorker registered:', registration);
                })
                .catch((error) => {
                    console.log('ServiceWorker registration failed:', error);
                });
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.reliefApp = new ReliefMarinApp();
});

// Global error handler
window.addEventListener('error', (e) => {
    console.error('Erreur globale:', e);
});
