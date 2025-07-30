/**
 * END USER LICENSE AGREEMENT (EULA) FOR CSS/JS MODULE
 * 
 * This Software is licensed by HScomm Web dev Team ("Licensor") to the end user ("Licensee").
 * 
 * 1. License Grants
 *    1.1 Licensee is granted a non-exclusive, non-transferable license to use one copy of the Software
 *        solely on a single website domain owned or controlled by Licensee.
 *    1.2 Third-party library components included are subject to their respective open source licenses
 *        (e.g., GPL, LGPL, MIT, Apache), which take precedence as applicable.
 *    1.3 However, GSAP library components are subject to the GSAP Standard "No Charge" License by Webflow.
 *        Licensee agrees to comply with the GSAP license terms (https://greensock.com/licensing/).
 *    1.4 For any matters not explicitly covered by third-party licenses, this EULA applies as the final
 *        governing license, except when conflicting with third-party licenses which take precedence.
 * 
 * 2. Usage Restrictions
 *    - No reproduction, distribution, sale, sublicensing, or transfer of Licensor's original Software parts
 *      to third parties.
 *    - No modification, adaptation, or derivative works of Licensor's original Software parts for redistribution.
 *    - Use limited to one domain; additional licenses required for multiple domains or projects.
 *    - No third-party use of Licensor's Software components allowed.
 *    - Proprietary notices or branding of third-party components must not be removed or altered.
 * 
 * 3. Ownership
 *    - Licensor retains all intellectual property rights in original code (excluding third-party components).
 *    - Third-party components remain property of their respective owners.
 * 
 * 4. Limitation of Liability
 *    - Licensor is not liable for damages from use or inability to use the Software, including third-party parts.
 * 
 * 5. Termination
 *    - License terminates immediately upon violation; Licensee must cease use and delete all copies.
 * 
 * 6. Governing Law
 *    - Governed by the laws of [Jurisdiction].
 * 
 * HScomm Web dev Team
 * Date: 07/25/2025
 */

// GSAP 플러그인 등록
if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const app = {
    // ========== 상수 (CONFIG) ==========
    CONFIG: {
        VERSION: '1.1.21',
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
        
        this.initializeVisualSection();
        this.initializeStickyWrapper();
        this.initHorizontalScroll(); 
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
        // 가로 스크롤 컨테이너 찾기
        let horizontalSections = gsap.utils.toArray(".horizontal-spacer");
        
        horizontalSections.forEach((container) => {
            let sections = container.querySelectorAll(".multi-scroll-item");
            
            // 각 섹션별 멈춤 효과를 위한 타임라인 생성
            let tl = gsap.timeline({
                scrollTrigger: {
                    trigger: container,
                    pin: false,
                    scrub: 1,
                    start: "top+=20% top",  
                    end: "bottom-=20% bottom",
                    // markers: true, // 개발 시에만 사용
                }
            });

            // 각 섹션마다 이동과 멈춤을 추가
            sections.forEach((section, index) => {
                if (index === 0) {
                    // 첫 번째 섹션에서 잠시 멈춤
                    tl.to(sections, { 
                        xPercent: 0, 
                        duration: 1, 
                        ease: "none" 
                    });
                } else {
                    // 다음 섹션으로 이동
                    tl.to(sections, { 
                        xPercent: -100 * index, 
                        duration: 1, 
                        ease: "power2.inOut" 
                    })
                    // 해당 섹션에서 잠시 멈춤
                    .to(sections, { 
                        xPercent: -100 * index, 
                        duration: 1, 
                        ease: "none" 
                    });
                }
            });
        });

        // 부드러운 스크롤 효과
        gsap.to("body", {
            scrollBehavior: "smooth"
        });
        // horizontalSections.forEach((container) => {
        //     let sections = container.querySelectorAll(".multi-scroll-item");
            
            
        //     gsap.to(sections, {
        //         xPercent: -100 * (sections.length - 1),
        //         ease: "none",
        //         scrollTrigger: {
        //             trigger: container,
        //             pin: false,
        //             scrub: 1,
        //             start: "top+=20% top",  
        //             end: "bottom-=20% bottom", 
        //             markers: true,
        //         }
        //     });
        // });
    },


    // ========== 상태 관리 ==========
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
            gsap.set(this.elements.background, { filter: `brightness(${brightness})` });
        } else {
            gsap.set(this.elements.background, { filter: `brightness(1)` });
        }

        this.emitEvent('visualSectionProgress', {
            progress,
            easedProgress,
            element: this.elements.visualSection
        });
    },

    calculateClipPath(progress) {
        const { size, padding, radius } = this.getAnimationValues(progress);
        
        return `inset(calc(${padding} * var(--h2-font-size)) ${50 - size / 2}% calc(${padding} * var(--h2-font-size)) ${50 - size / 2}% round max(${radius}lvh, ${radius}lvw))`;
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