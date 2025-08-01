/**
 * Visual Scroll Animation Module
 * Handles vertical scroll-triggered visual effects with GSAP and ScrollTrigger
 * @version 1.1.45
 */

if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

const app = {
    CONFIG: {
        VERSION: '1.1.45',
        ACTIVATION_THRESHOLD: 0.15,
        SCROLL_DEBOUNCE_DELAY: 16,
        STICKY_HEIGHT_MULTIPLIER: 2,
        INITIAL_RADIUS: 5,
        ANIMATION_START: 0.1,
        ANIMATION_END: 0.6
    },

    state: {
        scrollTimer: null,
        progress: 0,
        isActive: null,
        resizeObserver: null
    },

    elements: {
        visualSection: document.querySelector('#visual-section'),
        stickyWrapper: document.querySelector('.sticky-wrapper'),
        get background() { return this.visualSection?.querySelector('.sticky-element-background'); },
        get stickyElement() { return this.stickyWrapper?.querySelector('.sticky-element'); },
    },

    init() {
        console.log(this.CONFIG.VERSION);

        if (!this.validateGSAP()) return;

        this.setupHeaderHeight();
        this.initializeVisualSection();
        this.initializeStickyWrapper();
        this.setupResizeHandler();
    },

    validateGSAP() {
        if (typeof gsap === 'undefined') {
            console.error('GSAP not loaded - include gsap.min.js');
            return false;
        }
        if (typeof ScrollTrigger === 'undefined') {
            console.error('ScrollTrigger not loaded or registered');
            return false;
        }
        return true;
    },

    setupHeaderHeight() {
        const header = document.getElementById('s2025072923c95d7545c67');
        const headerHeight = header ? header.getBoundingClientRect().height : 0;
        document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    },

    setupResizeHandler() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.setupHeaderHeight();
                this.renderVisualEffects(this.state.progress);
            }, 100);
        });
    },

    initializeVisualSection() {
        if (!this.elements.visualSection) {
            console.warn('Visual section not found');
            return;
        }

        ScrollTrigger.create({
            trigger: this.elements.visualSection,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            onUpdate: (self) => {
                this.updateProgress(self.progress);
            },
        });

        this.renderVisualEffects(0);
        this.updateActivationState();
    },

    initializeStickyWrapper() {
        if (!this.elements.stickyWrapper || !this.elements.stickyElement) return;

        this.state.resizeObserver = new ResizeObserver(() => {
            const height = this.elements.stickyElement.getBoundingClientRect().height;
            this.elements.stickyWrapper.style.minHeight = `${height * this.CONFIG.STICKY_HEIGHT_MULTIPLIER}px`;
        });

        this.state.resizeObserver.observe(this.elements.stickyElement);
    },

    updateProgress(progress) {
        this.state.progress = progress;
        this.renderVisualEffects(progress);

        clearTimeout(this.state.scrollTimer);
        this.state.scrollTimer = setTimeout(() => {
            this.updateActivationState();
        }, this.CONFIG.SCROLL_DEBOUNCE_DELAY);
    },

    updateActivationState() {
        const shouldActivate = this.state.progress >= this.CONFIG.ACTIVATION_THRESHOLD;

        if (this.state.isActive === shouldActivate) return;

        this.state.isActive = shouldActivate;

        this.elements.visualSection.classList.remove(shouldActivate ? 'inactive' : 'active');
        this.elements.visualSection.classList.add(shouldActivate ? 'active' : 'inactive');

        this.emitEvent('visualSectionStateChange', {
            isActive: shouldActivate,
            progress: this.state.progress,
            element: this.elements.visualSection
        });
    },

    renderVisualEffects(progress) {
        if (!this.elements.background) return;

        const clipPath = this.calculateClipPath(progress);
        const easedProgress = this.easeInOutSine(progress);
        const peakProgress = this.easeInOutPeak(progress);

        gsap.set(this.elements.background, { clipPath });

        this.updateCSSProperties(easedProgress, peakProgress);
        this.updateBackgroundEffects(progress);
        this.emitProgressEvent(progress, easedProgress);
    },

    updateCSSProperties(easedProgress, peakProgress) {
        this.elements.visualSection.style.setProperty('--scroll-percentage', `${easedProgress}`);
        this.elements.visualSection.style.setProperty('--scroll-peak-percentage', `${peakProgress}`);
    },

    updateBackgroundEffects(progress) {
        if (progress >= 0.5) {
            const local = (progress - 0.5) / 0.5;
            const brightness = 1 - 0.75 * local;
            const blur = local * 10;
            gsap.set(this.elements.background, {
                filter: `brightness(${brightness}) blur(${blur}px)`,
                transform: `translateX(-50%)`
            });
        } else {
            gsap.set(this.elements.background, {
                filter: `brightness(1) blur(0)`,
                transform: `translateX(-50%)`
            });
        }
    },

    emitProgressEvent(progress, easedProgress) {
        this.emitEvent('visualSectionProgress', {
            progress,
            easedProgress,
            element: this.elements.visualSection
        });
    },

    calculateClipPath(progress) {
        const { size, padding, radius } = this.getAnimationValues(progress);

        return `inset(
            calc(${padding} * var(--h2-font-size) + var(--header-height)) 
            ${50 - size / 2}% 
            calc(${padding} * var(--h2-font-size)) 
            ${50 - size / 2}% 
            round max(${radius}lvh, ${radius}lvw)
        )`;
    },

    getAnimationValues(progress) {
        const startSize = this.getInitialSize();
        const { INITIAL_RADIUS, ANIMATION_START, ANIMATION_END } = this.CONFIG;

        if (progress < ANIMATION_START) {
            return { size: startSize, padding: 1, radius: INITIAL_RADIUS };
        }

        if (progress >= ANIMATION_END) {
            return { size: 100, padding: 0, radius: 0 };
        }

        const localProgress = (progress - ANIMATION_START) / (ANIMATION_END - ANIMATION_START);
        const easedProgress = this.easeOutSine(localProgress);

        return {
            size: startSize + (100 - startSize) * easedProgress,
            padding: 1 - easedProgress,
            radius: INITIAL_RADIUS * (1 - localProgress)
        };
    },

    getInitialSize() {
        const content = this.elements.visualSection?.querySelector('.sticky-element-content');

        if (!content || !this.elements.background) return 50;

        const contentWidth = content.getBoundingClientRect().width;
        const containerWidth = this.elements.background.getBoundingClientRect().width;
        const effectiveWidth = Math.min(contentWidth, window.innerWidth);

        return (effectiveWidth / containerWidth) * 100;
    },

    // Easing functions
    easeOutSine: (t) => Math.sin(t * Math.PI / 2),

    easeInOutSine: (t) => {
        t = Math.max(0, Math.min(1, t));
        return -(Math.cos(Math.PI * t) - 1) / 2;
    },

    easeInOutPeak: (t) => {
        t = Math.max(0, Math.min(1, t));
        const peak = 0.6;
        const sharpness = 2.5;

        const a = Math.pow(t, sharpness);
        const b = Math.pow(1 - t, sharpness);
        const peakShape = a * b;

        return peakShape / Math.pow(peak * (1 - peak), sharpness);
    },

    emitEvent(eventName, detail) {
        document.dispatchEvent(new CustomEvent(eventName, { detail }));
    },

    destroy() {
        if (this.state.resizeObserver) {
            this.state.resizeObserver.disconnect();
            this.state.resizeObserver = null;
        }

        clearTimeout(this.state.scrollTimer);

        ScrollTrigger.getAll().forEach(trigger => {
            if (trigger.trigger === this.elements.visualSection) {
                trigger.kill();
            }
        });
    },
};

export default app;