// visual-scroll.js
// GSAP 코어와 필요한 플러그인들을 전역 script 태그로 불러와야 합니다:
// <script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
// <script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js"></script>

// GSAP 플러그인 등록
if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export const app = {
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
            end: "top top",      // 섹션의 상단이 뷰포트 상단에 닿을 때 끝
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
        // 예시: 배경 투명도 변화
        const background = element.querySelector('.visual-section-background');
        if (background) {
            gsap.set(background, {
                opacity: progress / 100
            });
        }

        // 예시: 컨텐츠 페이드인 효과
        const contentWrapper = element.querySelector('.content-wrapper');
        if (contentWrapper) {
            gsap.set(contentWrapper, {
                opacity: Math.min(1, (progress - 20) / 60), // 20%부터 80%까지 페이드인
                y: Math.max(0, 50 - (progress * 0.5)) // 위로 이동 효과
            });
        }

        // 커스텀 이벤트 발생 (다른 모듈에서 사용할 수 있도록)
        document.dispatchEvent(new CustomEvent('visualSectionProgress', {
            detail: { progress, element }
        }));
    }
};
