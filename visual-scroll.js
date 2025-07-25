// GSAP 플러그인 등록
if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const visualScrollApp = {
    init() {
        this.initVisualSectionScroll();
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

    // 스크롤 진행률에 따른 효과를 처리하는 메서드
    handleScrollProgress(progress, element) {
        const background = element.querySelector('.visual-section-background');

        if (background) {
            const defaultWidthPx = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--default-content-width')) + 80;
            const containerWidth = background.offsetWidth || 1;
            const startSizePercent = (defaultWidthPx / containerWidth) * 100;

            let size;
            let radius;

            if (progress < 30) {
                // 초기 상태 유지
                size = startSizePercent;
                radius = 64;
            } else if (progress < 60) {
                // 30~60% 사이에서 size를 확장 (선형 보간)
                const localProgress = (progress - 30) / 30; // 0~1
                size = startSizePercent + (100 - startSizePercent) * localProgress;
                radius = 64 - ( 64 * localProgress);
            } else {
                // 이후 고정 상태 또는 새로운 애니메이션
                size = 100;
                radius = 0;
            }

            gsap.set(background, {
                clipPath: `inset(0% ${50 - size / 2}% 0% ${50 - size / 2}% round ${radius}px)`
            });
        }

        document.dispatchEvent(new CustomEvent('visualSectionProgress', {
            detail: { progress, element }
        }));
    }



};

// DOM 로드 후 실행
document.addEventListener('DOMContentLoaded', () => {
    visualScrollApp.init();
    const stickyWrapper = document.querySelector('.sticky-wrapper');
    const stickyElement = stickyWrapper.querySelector('.sticky-element');;

    if (!stickyWrapper || !stickyElement) return;

    const resizeObserver = new ResizeObserver(() => {
        const height = stickyElement.getBoundingClientRect().height;
        stickyWrapper.style.height = `${height * 2}px`;
    });

    resizeObserver.observe(stickyElement);
});
