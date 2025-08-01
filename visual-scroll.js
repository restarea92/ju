/**
 * Visual Scroll Animation Module
 * Handles scroll-triggered visual effects with GSAP and ScrollTrigger
 * @version 1.1.44
 */

if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

const app = {
    // ========== Configuration ==========
    CONFIG: {
        VERSION: '1.1.45',
        ACTIVATION_THRESHOLD: 0.15,
        SCROLL_DEBOUNCE_DELAY: 16,
        STICKY_HEIGHT_MULTIPLIER: 2,
        INITIAL_RADIUS: 5,
        ANIMATION_START: 0.1,
        ANIMATION_END: 0.6
    },

    // ========== State Management ==========
    state: {
        scrollTimer: null,
        progress: 0,
        verticalProgress: 0,
        horizontalProgress: 0,
        isActive: null,
        resizeObserver: null
    },

    // ========== DOM Elements Cache ==========
    elements: {
        visualSection: document.querySelector('#visual-section'),
        stickyWrapper: document.querySelector('.sticky-wrapper'),
        title: document.querySelector('.title'),
        trigger: document.querySelector('#scroll-trigger'),
        get background() { return this.visualSection?.querySelector('.sticky-element-background'); },
        get stickyElement() { return this.stickyWrapper?.querySelector('.sticky-element'); },
    },

    // ========== Initialization ==========
    /**
     * Initialize the application
     */
    init() {
        console.log(this.CONFIG.VERSION);

        if (!this.validateGSAP()) return;

        this.setupHeaderHeight();
        this.initializeVisualSection();
        this.initializeStickyWrapper();
        this.initializeHorizontalScroll();
        this.renderVisualEffects(this.state.progress);
        this.setupResizeHandler();
    },

    /**
     * Validate GSAP dependencies
     * @returns {boolean} Whether GSAP is properly loaded
     */
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

    /**
     * Setup header height CSS variable
     */
    setupHeaderHeight() {
        const header = document.getElementById('s2025072923c95d7545c67');
        const headerHeight = header ? header.getBoundingClientRect().height : 0;
        document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    },

    /**
     * Setup resize event handler
     */
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

    // ========== Visual Section ==========
    /**
     * Initialize visual section scroll trigger
     */
    initializeVisualSection() {
        if (!this.elements.visualSection) {
            console.warn('Visual section not found');
            return;
        }

        ScrollTrigger.create({
            trigger: this.elements.trigger,
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

    /**
     * Initialize sticky wrapper with resize observer
     */
    initializeStickyWrapper() {
        if (!this.elements.stickyWrapper || !this.elements.stickyElement) return;

        this.state.resizeObserver = new ResizeObserver(() => {
            const height = this.elements.stickyElement.getBoundingClientRect().height;
            this.elements.stickyWrapper.style.minHeight = `${height * this.CONFIG.STICKY_HEIGHT_MULTIPLIER}px`;
        });

        this.state.resizeObserver.observe(this.elements.stickyElement);
    },

    // ========== Horizontal Scroll ==========
    /**
     * Initialize horizontal scroll animations
     */
    initializeHorizontalScroll() {
        const horizontalSections = gsap.utils.toArray(".horizontal-spacer");
        
        horizontalSections.forEach((container) => {
            this.setupHorizontalContainer(container);
        });

        gsap.to("body", { scrollBehavior: "smooth" });
    },

    /**
     * Setup individual horizontal container
     * @param {Element} container - The horizontal container element
     */
    
    setupHorizontalContainer(container) {
        const sections = container.querySelectorAll(".multi-scroll-item");
        const elements = this.getHorizontalElements();
        const { yOffset, xOffset } = this.calculateOffsets();
        const debugElements = this.getDebugElements();
        
        this.setInitialPositions(elements, yOffset, xOffset);
        this.createHorizontalTimelines(container, elements, yOffset, xOffset, debugElements);
        this.createMainHorizontalTimeline(container, sections, debugElements);
    },

    /**
     * Get horizontal scroll elements
     * @returns {Object} Object containing element references
     */
    getHorizontalElements() {
        const multiScrollItem1 = document.querySelector("#multi-scroll-item1");
        const multiScrollItem2 = document.querySelector("#multi-scroll-item2");

        return {
            text: multiScrollItem1?.querySelector('.content-text'),
            image: multiScrollItem1?.querySelector('.content-image'),
            title: multiScrollItem1?.querySelector('.content-title'),
            text2: multiScrollItem2?.querySelector('.content-text'),
            image2: multiScrollItem2?.querySelector('.content-image'),
            title2: multiScrollItem2?.querySelector('.content-title')
        };
    },

    /**
     * Get debug elements
     * @returns {Object} Object containing debug element references
     */
    getDebugElements() {
        return {
            progressEl: document.getElementById('progress-element'),
            progressEl2: document.getElementById('progress-element2'),
            stateEl: document.querySelector('#state-el')
        };
    },

    /**
     * Calculate viewport-based offsets
     * @returns {Object} Object containing calculated offsets
     */
    calculateOffsets() {
        const minVwVh = (value) => {
            const vw = window.innerWidth * (value / 100);
            const vh = window.innerHeight * (value / 100);
            return Math.min(vw, vh);
        };

        return {
            yOffset: minVwVh(10),
            xOffset: minVwVh(20)
        };
    },

    /**
     * Set initial positions for horizontal elements
     * @param {Object} elements - Element references
     * @param {number} yOffset - Vertical offset
     * @param {number} xOffset - Horizontal offset
     */
    setInitialPositions(elements, yOffset, xOffset) {
        const { text, image, title, text2, image2, title2 } = elements;

        if (text) gsap.set(text, { y: yOffset * 3, x: 0 });
        if (image) gsap.set(image, { y: yOffset * 1.5, x: 0 });
        if (title) gsap.set(title, { y: yOffset * 1, x: 0 });

        if (text2) gsap.set(text2, { x: xOffset * 3, y: 0 });
        if (image2) gsap.set(image2, { x: xOffset * 1.5, y: 0 });
        if (title2) gsap.set(title2, { x: xOffset * 1, y: 0 });
    },

    /**
     * Create horizontal animation timelines
     * @param {Element} container - Container element
     * @param {Object} elements - Element references
     * @param {number} yOffset - Vertical offset
     * @param {number} xOffset - Horizontal offset
     * @param {Object} debugElements - Debug element references
     */
    createHorizontalTimelines(container, elements, yOffset, xOffset, debugElements) {
        const { text, image, title, text2, image2, title2 } = elements;
        const { progressEl, progressEl2 } = debugElements;

        const timelineOptions = this.getTimelineOptions(progressEl, progressEl2);
        const createTimeline = this.createTimelineFactory(container);

        // First section animations
        this.createFirstSectionAnimations(createTimeline, timelineOptions, text, image, title);
        
        // Second section animations
        this.createSecondSectionAnimations(createTimeline, timelineOptions, text2, image2, title2);
    },

    /**
     * Get timeline options configuration
     * @param {Element} progressEl - First progress element
     * @param {Element} progressEl2 - Second progress element
     * @returns {Object} Timeline options
     */
    
    getTimelineOptions(progressEl, progressEl2) {
        return {
            firstIn: {
                start: "top center",
                end: "center bottom",
                onUpdate: self => {
                    const progressPercent = (self.progress * 100).toFixed(0);
                    if (progressEl) progressEl.textContent = 'For debug: ' + progressPercent + '%';
                },
            },
            firstOut: {
                start: "center bottom",
                end: "center top",
            },
            secondIn: {
                start: "center center",
                end: "center top",
                onUpdate: self => {
                    const progressPercent = (self.progress * 100).toFixed(0);
                    if (progressEl2) progressEl2.textContent = 'For debug: ' + progressPercent + '%';
                }
            },
            secondOut: {
                start: "bottom bottom",
                end: "bottom top",
            }
        };
    },

    /**
     * Create timeline factory function
     * @param {Element} container - Container element
     * @returns {Function} Timeline creation function
     */
    createTimelineFactory(container) {
        return (options = {}) => {
            return gsap.timeline({
                scrollTrigger: {
                    trigger: container,
                    start: "top bottom",
                    end: "center top",
                    scrub: 1,
                    onUpdate: self => {
                        const progressPercent = (self.progress * 100).toFixed(0);
                    },
                    ...options,
                }
            });
        };
    },

    /**
     * Create first section animations
     * @param {Function} createTimeline - Timeline creation function
     * @param {Object} timelineOptions - Timeline options
     * @param {Element} text - Text element
     * @param {Element} image - Image element
     * @param {Element} title - Title element
     */
    createFirstSectionAnimations(createTimeline, timelineOptions, text, image, title) {
        // First in animation
        createTimeline(timelineOptions.firstIn).to([text, image, title], {
            y: "0%",
            ease: "ease",
            duration: 0.5
        }, 0);

        // First out animations
        const firstOutTimeline = createTimeline(timelineOptions.firstOut);
        
        firstOutTimeline.to(text, {
            x: "-200%",
            ease: "ease",
            opacity: 0,
            filter: "blur(16px)",
            duration: 0.5
        }, 0);
        
        firstOutTimeline.to(image, {
            x: "-300%",
            ease: "ease",
            opacity: 0,
            duration: 0.5
        }, 0);
        
        firstOutTimeline.to(title, {
            x: "-100%",
            ease: "ease",
            filter: "blur(16px)",
            opacity: 0,
            duration: 0.5
        }, 0);
    },

    /**
     * Create second section animations
     * @param {Function} createTimeline - Timeline creation function
     * @param {Object} timelineOptions - Timeline options
     * @param {Element} text2 - Second text element
     * @param {Element} image2 - Second image element
     * @param {Element} title2 - Second title element
     */
    createSecondSectionAnimations(createTimeline, timelineOptions, text2, image2, title2) {
        // Second in animation
        createTimeline(timelineOptions.secondIn).to([text2, image2, title2], {
            x: "0%",
            ease: "ease",
            duration: 0.5
        }, 0);

        // Second out animations
        const secondOutTimeline = createTimeline(timelineOptions.secondOut);
        
        secondOutTimeline.to(text2, {
            y: "-200%",
            ease: "ease",
            opacity: 0,
            filter: "blur(16px)",
            duration: 0.5
        }, 0);
        
        secondOutTimeline.to(image2, {
            y: "-300%",
            ease: "ease",
            opacity: 0,
            duration: 0.5
        }, 0);
        
        secondOutTimeline.to(title2, {
            y: "-100%",
            ease: "ease",
            filter: "blur(16px)",
            opacity: 0,
            duration: 0.5
        }, 0);
    },

    /**
     * Create main horizontal timeline
     * @param {Element} container - Container element
     * @param {NodeList} sections - Section elements
     * @param {Object} debugElements - Debug elements
     */
    createMainHorizontalTimeline(container, sections, debugElements) {
        const { stateEl, progressEl2 } = debugElements;

        const timeline = gsap.timeline({
            scrollTrigger: {
                trigger: container,
                pin: false,
                scrub: 0.5,
                start: "center bottom",
                end: "center top",
                onUpdate: self => {
                    if (stateEl) stateEl.textContent = 'For debug: SCROLLING';
                    const progressPercent = (self.progress * 100).toFixed(0);
                    if (progressEl2) progressEl2.textContent = 'For debug: ' + progressPercent + '%';
                },
                onLeave: self => {
                    if (stateEl) stateEl.textContent = 'For debug: END';
                },
                onLeaveBack: self => {
                    if (stateEl) stateEl.textContent = 'For debug: END (back)';
                }
            },
        });

        this.createSectionTimeline(timeline, sections);
    },

    /**
     * Create section timeline animations
     * @param {Object} timeline - GSAP timeline
     * @param {NodeList} sections - Section elements
     */
    createSectionTimeline(timeline, sections) {
        sections.forEach((section, index) => {
            if (index === 0) {
                timeline.to(sections, {
                    xPercent: 0,
                    duration: 0.5,
                    ease: "none"
                });
            } else {
                timeline.to(sections, {
                    xPercent: -100 * index,
                    duration: 3,
                    ease: "power2.inOut"
                })
                .to(sections, {
                    xPercent: -100 * index,
                    duration: 0.5,
                    ease: "none"
                });
            }
        });
    },

    // ========== State Management ==========
    /**
     * Update scroll progress
     * @param {number} progress - Progress value (0-1)
     */
    updateProgress(progress) {
        this.state.progress = progress;
        this.renderVisualEffects(progress);
        
        clearTimeout(this.state.scrollTimer);
        this.state.scrollTimer = setTimeout(() => {
            this.updateActivationState();
        }, this.CONFIG.SCROLL_DEBOUNCE_DELAY);
    },

    /**
     * Update activation state based on threshold
     */
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

    // ========== Rendering ==========
    /**
     * Render visual effects based on progress
     * @param {number} progress - Progress value (0-1)
     */
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

    /**
     * Update CSS custom properties
     * @param {number} easedProgress - Eased progress value
     * @param {number} peakProgress - Peak progress value
     */
    updateCSSProperties(easedProgress, peakProgress) {
        this.elements.visualSection.style.setProperty('--scroll-percentage', `${easedProgress}`);
        this.elements.visualSection.style.setProperty('--scroll-peak-percentage', `${peakProgress}`);
    },

    /**
     * Update background effects based on progress
     * @param {number} progress - Progress value (0-1)
     */
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

    /**
     * Emit progress event
     * @param {number} progress - Raw progress value
     * @param {number} easedProgress - Eased progress value
     */
    emitProgressEvent(progress, easedProgress) {
        this.emitEvent('visualSectionProgress', {
            progress,
            easedProgress,
            element: this.elements.visualSection
        });
    },

    /**
     * Calculate clip path based on progress
     * @param {number} progress - Progress value (0-1)
     * @returns {string} CSS clip-path value
     */
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

    /**
     * Get animation values based on progress
     * @param {number} progress - Progress value (0-1)
     * @returns {Object} Animation values
     */
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

    /**
     * Get initial size based on content dimensions
     * @returns {number} Initial size percentage
     */
    getInitialSize() {
        const content = this.elements.visualSection?.querySelector('.sticky-element-content');
        
        if (!content || !this.elements.background) return 50;
        
        const contentWidth = content.getBoundingClientRect().width;
        const containerWidth = this.elements.background.getBoundingClientRect().width;
        const effectiveWidth = Math.min(contentWidth, window.innerWidth);
        
        return (effectiveWidth / containerWidth) * 100;
    },

    // ========== Utility Functions ==========
    /**
     * Ease out sine function
     * @param {number} t - Input value (0-1)
     * @returns {number} Eased value
     */
    easeOutSine: (t) => Math.sin(t * Math.PI / 2),
    
    /**
     * Ease in-out sine function
     * @param {number} t - Input value (0-1)
     * @returns {number} Eased value
     */
    easeInOutSine: (t) => {
        t = Math.max(0, Math.min(1, t));
        return -(Math.cos(Math.PI * t) - 1) / 2;
    },

    /**
     * Ease in-out peak function
     * @param {number} t - Input value (0-1)
     * @returns {number} Eased value with peak shape
     */
    easeInOutPeak: (t) => {
        t = Math.max(0, Math.min(1, t));
        const peak = 0.6;
        const sharpness = 2.5;

        const a = Math.pow(t, sharpness);
        const b = Math.pow(1 - t, sharpness);
        const peakShape = a * b;

        return peakShape / Math.pow(peak * (1 - peak), sharpness);
    },

    /**
     * Emit custom event
     * @param {string} eventName - Event name
     * @param {Object} detail - Event detail data
     */
    emitEvent: (eventName, detail) => {
        document.dispatchEvent(new CustomEvent(eventName, { detail }));
    },

    // ========== Cleanup ==========
    /**
     * Destroy and cleanup resources
     */
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