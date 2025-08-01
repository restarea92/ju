if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

const app = {
    // ========== 상수 (CONFIG) ==========
    CONFIG: {
        VERSION: '1.1.43',
        ACTIVATION_THRESHOLD: 0.15,  // 0~1 범위로 변경
        SCROLL_DEBOUNCE_DELAY: 16,   // 60fps에 맞춰 최적화
        STICKY_HEIGHT_MULTIPLIER: 2,
        INITIAL_RADIUS: 5,
        ANIMATION_START: 0.1,        // 0~1 범위로 변경
        ANIMATION_END: 0.6           // 0~1 범위로 변경
    },

    // ========== 변수 (STATE) ==========
    state: {
        scrollTimer: null,
        progress: 0,
        verticalProgress: 0,     // 새 vertical 별도 progress
        horizontalProgress: 0,    // 가로 스크롤 progress
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

    // ========== 초기화 ==========
    init() {
        console.log(this.CONFIG.VERSION);

        if (!this.validateGSAP()) return;

        this.setHeaderHeightVariable(); // 헤더 높이 → CSS 변수로 반영

        this.initializeVisualSection();
        this.initializeStickyWrapper();
        this.initHorizontalScroll(); 

        this.renderVisualEffects(this.state.progress); // 초기 클립패스 반영

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.setHeaderHeightVariable(); // 리사이즈 시 헤더 높이 갱신
                this.renderVisualEffects(this.state.progress);
            }, 100); // 100ms 후 실행
        });
    },


    validateGSAP: () => {
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
                this.updateProgress(self.progress); // 0~1 그대로 사용
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
    
    initHorizontalScroll() {
        gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

        let horizontalSections = gsap.utils.toArray(".horizontal-spacer");
        function minVwVh(value) {
            const vw = window.innerWidth * (value / 100);
            const vh = window.innerHeight * (value / 100);
            return Math.min(vw, vh);
        }

        horizontalSections.forEach((container, containerIndex) => {
            let sections = container.querySelectorAll(".multi-scroll-item");

            const multiScrollItem1 = document.querySelector("#multi-scroll-item1");
            const text = multiScrollItem1.querySelector('.content-text');
            const image = multiScrollItem1.querySelector('.content-image');
            const title = multiScrollItem1.querySelector('.content-title');

            const multiScrollItem2 = document.querySelector("#multi-scroll-item2");
            const text2 = multiScrollItem2.querySelector('.content-text');
            const image2 = multiScrollItem2.querySelector('.content-image');
            const title2 = multiScrollItem2.querySelector('.content-title');

            const yOffset = minVwVh(10); 
            const xOffset = minVwVh(20); 
            const progressEl = document.getElementById('progress-element');
            const progressEl2 = document.getElementById('progress-element2');

            const timelineOptions = {
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
            }

            const createTimeline = (options = {}) => {
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

            // 초기 위치 세팅
            if (text) gsap.set(text, { y: yOffset * 3, x: 0  });
            if (image) gsap.set(image, { y: yOffset * 1.5, x: 0  });
            if (title) gsap.set(title, { y: yOffset * 1, x: 0  });

            if (text2) gsap.set(text2, { x: xOffset * 3, y: 0  });
            if (image2) gsap.set(image2, { x: xOffset * 1.5, y: 0  });
            if (title2) gsap.set(title2, { x: xOffset * 1, y: 0  });
            

            createTimeline(timelineOptions.firstIn).to([text, image, title], {
                y: "0%",
                ease: "ease",
                duration: 0.5
            }, 0);

            
            createTimeline(timelineOptions.firstOut).to(text, {
                x: "-200%",
                ease: "ease",
                opacity:0,
                filter: "blur(16px)",
                duration: 0.5
            }, 0);
            createTimeline(timelineOptions.firstOut).to(image, {
                x: "-300%",
                ease: "ease",
                opacity:0,
                duration: 0.5
            }, 0);
            createTimeline(timelineOptions.firstOut).to(title, {
                x: "-100%",
                ease: "ease",
                filter: "blur(16px)",
                opacity:0,
                duration: 0.5
            }, 0);
            createTimeline(timelineOptions.secondIn).to([text2, image2, title2], {
                x: "0%",
                ease: "ease",
                duration: 0.5
            }, 0);
            createTimeline(timelineOptions.secondOut).to(text2, {
                y: "-200%",
                ease: "ease",
                opacity:0,
                filter: "blur(16px)",
                duration: 0.5
            }, 0);
            createTimeline(timelineOptions.secondOut).to(image2, {
                y: "-300%",
                ease: "ease",
                opacity:0,
                duration: 0.5
            }, 0);
            createTimeline(timelineOptions.secondOut).to(title2, {
                y: "-100%",
                ease: "ease",
                filter: "blur(16px)",
                opacity:0,
                duration: 0.5
            }, 0);


            const stateEl = document.querySelector('#state-el');
            let tl = gsap.timeline({
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

            sections.forEach((section, index) => {
                if (index === 0) {
                    tl.to(sections, { 
                        xPercent: 0, 
                        duration: 0.5, 
                        ease: "none" 
                    });
                } else {
                    tl.to(sections, { 
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
        });

        gsap.to("body", {
            scrollBehavior: "smooth"
        });
    },


    // ========== 상태 관리 ==========
    setHeaderHeightVariable() {
        const header = document.getElementById('s2025072923c95d7545c67');
        const headerHeight = header ? header.getBoundingClientRect().height : 0;
        document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
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

    // ========== 렌더링 ==========
    renderVisualEffects(progress) {
        if (!this.elements.background) return;

        const clipPath = this.calculateClipPath(progress);

        // progress는 이미 0~1이므로 바로 easing 적용
        const easedProgress = this.easeInOutSine(progress);
        const peakProgress = this.easeInOutPeak(progress);

        //set
        // gsap.set(this.elements.title, { opacity: peakProgress });
        gsap.set(this.elements.background, { clipPath });


        this.elements.visualSection.style.setProperty('--scroll-percentage', `${easedProgress}`);
        this.elements.visualSection.style.setProperty('--scroll-peak-percentage', `${peakProgress}`);

        if (progress >= 0.5) {
            const local = (progress - 0.5) / 0.5; // 0.5~1 → 0~1
            const brightness = 1 - 0.75 * local; // 1 → 0.25
            const blur = local * 10;
            gsap.set(this.elements.background, { filter: `brightness(${brightness}) blur(${blur}px)`, transform: `translateX(-50%))`});
        } else {
            gsap.set(this.elements.background, { filter: `brightness(1) blur(0)`, transform: `translateX(-50%)`});
        }

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

    // ========== 유틸리티 ==========
    easeOutSine: (t) => Math.sin(t * Math.PI / 2),
    
    easeInOutSine: (t) => {
        // 입력값 안전성 보장
        t = Math.max(0, Math.min(1, t));
        return -(Math.cos(Math.PI * t) - 1) / 2;
    },

    easeInOutPeak: (t) => {
    t = Math.max(0, Math.min(1, t));
    const peak = 0.6;
    const sharpness = 2.5; // 클수록 피크가 좁고 양끝이 완만함

    const a = Math.pow(t, sharpness);
    const b = Math.pow(1 - t, sharpness);
    const peakShape = a * b;

    return peakShape / Math.pow(peak * (1 - peak), sharpness); // 정규화
    },


    emitEvent: (eventName, detail) => {
        document.dispatchEvent(new CustomEvent(eventName, { detail }));
    },

    // ========== 정리 ==========
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