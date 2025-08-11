// gsapUtils.js

/**
 * GSAP 플러그인 초기화 및 등록 함수
 * @returns {boolean} GSAP 및 ScrollTrigger, ScrollToPlugin이 정상 등록됐는지 여부
 */
export function initGSAP() {
    if (typeof gsap === 'undefined') {
        console.error('GSAP not loaded - include gsap.min.js');
        return false;
    }
    if (typeof ScrollTrigger === 'undefined' || typeof ScrollToPlugin === 'undefined') {
        console.error('ScrollTrigger or ScrollToPlugin not loaded');
        return false;
    }

    // 중복 등록 방지
    if (!gsap.plugins || !gsap.plugins.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, CustomEase, DrawSVGPlugin);
    }
 
    return true;
}
