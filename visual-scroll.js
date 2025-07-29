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
        VERSION: '1.0.66',
        ACTIVATION_THRESHOLD: 15,
        SCROLL_DEBOUNCE_DELAY: 150,
        STICKY_HEIGHT_MULTIPLIER: 2,
        INITIAL_RADIUS: 5,
        ANIMATION_START: 10,
        ANIMATION_END: 60
    },

    // ========== 변수 (STATE) ==========
    state: {
        scrollTimer: null,
        progress: 0,
        isActive: null,
        resizeObserver: null
    },

    // ========== DOM Elements Cache ==========
    elements: {
        visualSection: document.querySelector('#visual-section'),
        stickyWrapper: document.querySelector('.sticky-wrapper'),
        get background() { return this.visualSection?.querySelector('.sticky-element-background'); },
        get stickyElement() { return this.stickyWrapper?.querySelector('.sticky-element'); }
    },

    // ========== 초기화 ==========
    init() {
        console.log(this.CONFIG.VERSION);
        
        if (!this.validateGSAP()) return;
        
        this.initializeVisualSection();
        this.initializeStickyWrapper();
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
            trigger: this.elements.visualSection,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            onUpdate: (self) => {
                this.updateProgress(self.progress * 100);
            },
        });

        this.renderVisualEffects(0);
        this.updateActivationState();
    },

    initializeStickyWrapper() {
        if (!this.elements.stickyWrapper || !this.elements.stickyElement) return;

        this.state.resizeObserver = new ResizeObserver(() => {
            const height = this.elements.stickyElement.getBoundingClientRect().height;
            this.elements.stickyWrapper.style.height = `${height * this.CONFIG.STICKY_HEIGHT_MULTIPLIER}px`;
        });

        this.state.resizeObserver.observe(this.elements.stickyElement);
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
        gsap.set(this.elements.background, { clipPath });

        const easeInOutSined = this.easeInOutSine(progress);
        this.elements.visualSection.style.setProperty('--scroll-percentage', `${easeInOutSined}`);

        this.emitEvent('visualSectionProgress', {
            progress,
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
    easeInOutSine : (t) => 0.5 - 0.5 * Math.cos(t * Math.PI),

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