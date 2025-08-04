/**
 * Visual Scroll Animation Module
 * Handles scroll-triggered visual effects with GSAP and ScrollTrigger
 * @version 1.1.44
 */

import { initGSAP } from './gsapUtils.js';

const app = {
    // ========== Configuration ==========
    CONFIG: {
        VERSION: '1.0.1',
    },

    // ========== DOM Elements Cache ==========
    elements: {
        trigger: document.querySelector('#scroll-trigger'),
        stickyElement: document.querySelector('.sticky-element'),
        title: stickyElement.querySelector('.sticky-element .title'),
        get background() { return this.visualSection?.querySelector('.sticky-element-background'); },
        get stickyElement() { return this.stickyWrapper?.querySelector('.sticky-element'); },

    },
    // ========== Initialization ==========
    /**
     * Initialize the application
     */
    init() {
        console.log(this.CONFIG.VERSION);
        if (!initGSAP()) return;

        this.setHeaderHeightVariable(); // 헤더 높이 → CSS 변수로 반영
        this.initRectScroll();
    },

    // ========== rect Scroll ==========
    /**
     * Initialize rect scroll animations
     * Setup individual rect scroll container
     * @param {Element} trigger - The trigger container element
     */
    initRectScroll() {

    },

    renderEffects() {
        const title = this.elements.title;
        const yOffset = this.minVwVh(10); 
        // 초기 위치 세팅

        if (title) gsap.set(title, { y: yOffset * 3, x: 0  });
            this.createTimeline().to(title, {
                y: "0",
                ease: "ease",
                opacity:1,
                filter: "",
                duration: 0.5
            }, 0);

            this.createTimeline({
                start: "bottom bottom",
                end: "bottom top",
            }).to(title, {
                y: "0",
                ease: "ease",
                opacity:0,
                filter: "",
                duration: 0.5
            }, 0);
    },

    // ========== 상태 관리 ==========
    setHeaderHeightVariable() {
        const header = document.getElementById('s2025072923c95d7545c67');
        const headerHeight = header ? header.getBoundingClientRect().height : 0;
        document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    },



    // ========== 유틸리티 ==========
    minVwVh(value) {
        const vw = window.innerWidth * (value / 100);
        const vh = window.innerHeight * (value / 100);
        return Math.min(vw, vh);
    },

    createTimeline: (options = {}) => {
        return gsap.timeline({
            scrollTrigger: {
                trigger: rectScrollTrigger, 
                start: "top bottom",
                end: "bottom bottom",
                scrub: 1,
                onUpdate: self => {
                    const progressPercent = (self.progress * 100).toFixed(0);
                },
                ...options,
            }
        });
    },
}

export default app;
document.addEventListener('DOMContentLoaded', () => {
    function isLandscape() {
        return window.innerWidth > window.innerHeight;
    }

    function updateVideo() {
        const landscapeVideo = document.getElementById('landscapeVideo');
        const portraitVideo = document.getElementById('portraitVideo');

        if (isLandscape()) {
        landscapeVideo.style.display = 'block';
        portraitVideo.style.display = 'none';
        landscapeVideo.play();
        portraitVideo.pause();
        } else {
        landscapeVideo.style.display = 'none';
        portraitVideo.style.display = 'block';
        portraitVideo.play();
        landscapeVideo.pause();
        }
    }

    updateVideo();

    window.addEventListener('resize', updateVideo);
    window.addEventListener('orientationchange', updateVideo);
});