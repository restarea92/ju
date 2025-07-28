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
    // 상태 관리
    state: {
        scrollTimer: null,
        progress: 0,
        isActive: null,
        version: '1.0.39'
    },

    // 설정값
    config: {
        activationThreshold: 15,
        scrollDebounceDelay: 150,
        stickyHeightMultiplier: 1.75,
        initialRadius: 5,
        padding: 4,
        animationStart: 10,
        animationEnd: 90
    },

    init() {
        console.log(this.state.version);
        
        if (!this.validateGSAP()) return;
        
        this.initVisualSection();
        this.initStickyWrapper();
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

    initVisualSection() {
        const section = document.querySelector('#visual-section');
        
        if (!section) {
            console.warn('Visual section not found');
            return;
        }

        // ScrollTrigger 생성
        ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            onUpdate: (self) => {
                this.updateProgress(self.progress * 100, section);
            },
        });

        // 초기 상태 설정
        this.renderVisualEffects(0, section);
        this.updateActivationState(section);
    },

    updateProgress(progress, section) {
        this.state.progress = progress;
        this.renderVisualEffects(progress, section);
        
        // 디바운스된 활성화 상태 업데이트
        clearTimeout(this.state.scrollTimer);
        this.state.scrollTimer = setTimeout(() => {
            this.updateActivationState(section);
        }, this.config.scrollDebounceDelay);
    },

    updateActivationState(section) {
        const shouldActivate = this.state.progress >= this.config.activationThreshold;
        
        if (this.state.isActive === shouldActivate) return;
        
        this.state.isActive = shouldActivate;
        
        // 클래스 적용
        section.classList.remove(shouldActivate ? 'inactive' : 'active');
        section.classList.add(shouldActivate ? 'active' : 'inactive');
        
        // 이벤트 발생
        this.emitEvent('visualSectionStateChange', {
            isActive: shouldActivate,
            progress: this.state.progress,
            element: section
        });
    },

    renderVisualEffects(progress, section) {
        const background = section.querySelector('.sticky-element-background');
        if (!background) return;

        const clipPath = this.calculateClipPath(progress, section);
        gsap.set(background, { clipPath });

        this.emitEvent('visualSectionProgress', {
            progress,
            element: section
        });
    },

    calculateClipPath(progress, section) {
        const { size, padding, radius } = this.getAnimationValues(progress, section);
        
        return `inset(calc(${padding} * var(--h2-font-size)) ${50 - size / 2}% calc(${padding} * var(--h2-font-size)) ${50 - size / 2}% round max(${radius}lvh, ${radius}lvw))`;
    },

    getAnimationValues(progress, section) {
        const startSize = this.getInitialSize(section);
        const { initialRadius, padding, animationStart, animationEnd } = this.config;

        // 애니메이션 시작 전
        if (progress < animationStart) {
            return { size: startSize, padding: 1, radius: initialRadius };
        }

        // 애니메이션 완료 후
        if (progress >= animationEnd) {
            return { size: 100, padding: 0, radius: 0 };
        }

        // 애니메이션 진행 중
        const localProgress = (progress - animationStart) / (animationEnd - animationStart);
        const easedProgress = this.easeOutSine(localProgress);
        
        return {
            size: startSize + (100 - startSize) * easedProgress,
            padding: 1 - easedProgress,
            radius: initialRadius * (1 - localProgress)
        };
    },

    getInitialSize(section) {
        const content = section.querySelector('.sticky-element-content');
        const background = section.querySelector('.sticky-element-background');
        
        if (!content || !background) return 50; // 기본값
        
        const contentWidth = content.getBoundingClientRect().width;
        const containerWidth = background.getBoundingClientRect().width;
        const effectiveWidth = Math.min(contentWidth, window.innerWidth);
        
        return (effectiveWidth / containerWidth) * 100;
    },

    initStickyWrapper() {
        const wrapper = document.querySelector('.sticky-wrapper');
        const element = wrapper?.querySelector('.sticky-element');
        
        if (!wrapper || !element) return;

        // ResizeObserver로 높이 자동 조정
        const observer = new ResizeObserver(() => {
            const height = element.getBoundingClientRect().height;
            wrapper.style.height = `${height * this.config.stickyHeightMultiplier}px`;
        });

        observer.observe(element);
    },

    // 유틸리티 함수들
    easeOutSine(t) {
        return Math.sin(t * Math.PI / 2);
    },

    emitEvent(eventName, detail) {
        document.dispatchEvent(new CustomEvent(eventName, { detail }));
    },

    // 하위 호환성을 위한 레거시 메서드들
    initVisualSectionScroll() {
        return this.initVisualSection();
    },

    handleScrollProgress(progress, element) {
        return this.renderVisualEffects(progress, element);
    },

    handleScrollStop(element) {
        clearTimeout(this.state.scrollTimer);
        this.state.scrollTimer = setTimeout(() => {
            this.updateActivationState(element);
        }, this.config.scrollDebounceDelay);
    }
};

export default app;