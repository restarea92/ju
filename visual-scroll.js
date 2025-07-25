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
    isScrollWrapperActive: false, // ← 추가

    init() {
        this.initVisualSectionScroll();
        this.initStickyWrapper();
    },

    initVisualSectionScroll() {
        const visualSection = document.querySelector('#visual-section');
        
        if (!visualSection) {
            console.warn('Visual section not found');
            return;
        }

        // GSAP가 로드되었는지 확인
        if (typeof gsap === 'undefined') {
            console.error('GSAP not loaded - include gsap.min.js');
            return;
        }

        // ScrollTrigger가 등록되었는지 확인
        if (typeof ScrollTrigger === 'undefined') {
            console.error('ScrollTrigger not loaded or registered');
            return;
        }

        // ScrollTrigger를 사용해서 섹션이 하단에 보이기 시작할 때부터 상단에 닿을 때까지 추적
        ScrollTrigger.create({
            trigger: visualSection,
            start: "top bottom", // 섹션의 상단이 뷰포트 하단에 닿을 때 시작
            end: "bottom top",      // 섹션의 상단이 뷰포트 상단에 닿을 때 끝
            scrub: true,         // 스크롤과 동기화
            onUpdate: (self) => {
                // 진행률을 0~100%로 계산
                const progress = self.progress * 100;
                
                // 콘솔에 진행률 출력 (디버깅용)
                console.log(`Visual section progress: ${progress.toFixed(1)}%`);
                
                // 여기서 진행률에 따른 애니메이션 또는 효과를 추가할 수 있습니다
                this.handleScrollProgress(progress, visualSection);
            }
        });
    },

    initStickyWrapper() {
        const stickyWrapper = document.querySelector('.sticky-wrapper');
        const stickyElement = stickyWrapper?.querySelector('.sticky-element');
        if (!stickyWrapper || !stickyElement) return;

        const resizeObserver = new ResizeObserver(() => {
            const height = stickyElement.getBoundingClientRect().height;
            stickyWrapper.style.height = `${height * 2}px`;
        });

        resizeObserver.observe(stickyElement);
    },
    
    easeOutSine(t) {
        return Math.sin(t * Math.PI / 2);
    },

    // 스크롤 진행률에 따른 효과를 처리하는 메서드
    handleScrollProgress(progress, element) {
        const background = element.querySelector('.sticky-element-background');

        if (background) {
            const defaultWidthPx = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--default-container-width'));
            const containerWidth = background.offsetWidth || 1;
            const startSizePercent = (defaultWidthPx / containerWidth) * 100;

            let size;
            let radius;
            let backgroundPadding;

            if (progress < 30) {
                // 초기 상태 유지
                size = startSizePercent;
                backgroundPadding = 0;
                radius = 25;
            } else if (progress < 60) {
                // 30~60% 사이에서 size를 확장 (선형 보간)
                const localProgress = (progress - 30) / 30; // 0~1
                size = startSizePercent + (100 - startSizePercent) * this.easeOutSine(localProgress);;
                backgroundPadding = this.easeOutSine(localProgress);
                radius = 25 - ( 25 * localProgress);
            } else {
                // 이후 고정 상태 또는 새로운 애니메이션
                size = 100;
                backgroundPadding = 1;
                radius = 0;
            }
            console.log({ size, backgroundPadding, radius });

            gsap.set(background, {
                clipPath: `inset(${4 * backgroundPadding}rem ${50 - size / 2}% ${4 * backgroundPadding}rem ${50 - size / 2}% round ${radius}lvw)`
            });
        }

        const wrapper = document.querySelector('.content-wrapper');
        if (wrapper) {
            if (progress >= 50 && !this.isScrollWrapperActive) {
                wrapper.classList.add('active');
                this.isScrollWrapperActive = true;
            } else if (progress < 50 && this.isScrollWrapperActive) {
                wrapper.classList.remove('active');
                this.isScrollWrapperActive = false;
            }
        }

        document.dispatchEvent(new CustomEvent('visualSectionProgress', {
            detail: { progress, element }
        }));
    }
};

export default app;