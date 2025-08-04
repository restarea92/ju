/**
 * Visual Scroll Animation Module
 * Handles scroll-triggered visual effects with GSAP and ScrollTrigger
 * @version 1.0.2
 */

import { initGSAP } from './gsapUtils.js';

const app = {

    // ========== Configuration ==========
    CONFIG: {
        VERSION: '1.0.2',
    },

    // ========== Initialization ==========
    /**
     * Initialize the application
     */
    init() {
        console.log(this.CONFIG.VERSION);
        if (!initGSAP()) return;
        this.initializeHorizontalScroll();
    },

    /**
     * Validate GSAP dependencies
     * @returns {boolean} Whether GSAP is properly loaded
     */
    // validateGSAP() {
    //     if (typeof gsap === 'undefined') {
    //         console.error('GSAP not loaded - include gsap.min.js');
    //         return false;
    //     }
    //     if (typeof ScrollTrigger === 'undefined') {
    //         console.error('ScrollTrigger not loaded or registered');
    //         return false;
    //     }
    //     return true;
    // },

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
        const debugElements = this.getDebugElements();
        
        this.setInitialPositions(elements);
        this.createHorizontalTimelines(container, elements, debugElements);
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
     */
    setInitialPositions(elements) {
        const { text, image, title, text2, image2, title2 } = elements;

        if (text)  gsap.set(text,  { xPercent: 0, yPercent: 300 });
        if (image) gsap.set(image, { xPercent: 0, yPercent: 400 });
        if (title) gsap.set(title, { xPercent: 0, yPercent: 200 });

        if (text2)  gsap.set(text2,  { xPercent: 200, yPercent: 0 });
        if (image2) gsap.set(image2, { xPercent: 400, yPercent: 0 });
        if (title2) gsap.set(title2, { xPercent: 300, yPercent: 0 });
    },

    /**
     * Create horizontal animation timelines
     * @param {Element} container - Container element
     * @param {Object} elements - Element references
     * @param {Object} debugElements - Debug element references
     */
    createHorizontalTimelines(container, elements, debugElements) {
        const { text, image, title, text2, image2, title2 } = elements;
        const { progressEl, progressEl2 } = debugElements;

        const timelineOptions = this.getTimelineOptions(progressEl, progressEl2);
        const createTimeline = this.timelineCreator(container);

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
     * 주어진 컨테이너에 맞는 GSAP 타임라인 생성 함수를 반환.
     * 반환된 함수는 옵션 객체를 받아 ScrollTrigger 설정을 커스터마이징.
     * 
     * @param {Element} container - 타임라인의 ScrollTrigger가 작동할 대상 요소
     * @returns {Function} 타임라인 생성 함수 (options 객체를 받아서 gsap.timeline 생성)
     */
    timelineCreator(container) {
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
            immediateRender: false,
            yPercent: 0,
            duration: 1
        }, 0);

        // First out animations
        const firstOutTimeline = createTimeline(timelineOptions.firstOut);
        
        firstOutTimeline.to(text, {
            immediateRender: false,
            xPercent: -200,
            duration: 0.5
        }, 0);
        
        firstOutTimeline.to(image, {
            immediateRender: false,
            xPercent: -300,
            duration: 0.5
        }, 0);
        
        firstOutTimeline.to(title, {
            immediateRender: false,
            xPercent: -100,
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
            immediateRender: false,
            xPercent: 0,
            duration: 1
        }, 0);

        // Second out animations
        const secondOutTimeline = createTimeline(timelineOptions.secondOut);
        
        secondOutTimeline.to(text2, {
            immediateRender: false,
            yPercent: -200,
            duration: 0.5
        }, 0);
        
        secondOutTimeline.to(image2, {
            immediateRender: false,
            yPercent: -300,
            duration: 0.5
        }, 0); 
        
        secondOutTimeline.to(title2, {
            immediateRender: false,
            yPercent: -100,
            ease: "ease",
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
                scrub: 1,
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

        // this.createSectionTimeline(timeline, sections);
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
                    duration: 2,
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

};

export default app;