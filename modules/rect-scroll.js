/**
 * Visual Scroll Animation Module
 * Handles scroll-triggered visual effects with GSAP and ScrollTrigger
 * @version 1.0.7
 */

import { initGSAP } from './gsapUtils.js';

const app = {
    // ========== Configuration ==========
    CONFIG: {
        VERSION: '1.0.7',
    },

    // ========== DOM Elements Cache ==========
    elements: {
        trigger: document.querySelector('#scroll-trigger'),
        stickyWrapper: document.querySelector('.sticky-wrapper'),
        stickyElement: document.querySelector('.sticky-element'),
        get title() { return this.stickyElement?.querySelector('.title'); },
        get background() { return this.stickyElement?.querySelector('.sticky-element-background'); },
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
     */
    initRectScroll() {
        const title = this.elements.title;
        const background = this.elements.background;
        const stickyWrapper = this.elements.stickyWrapper;

        const yOffset = this.minVwVh(10); 
        const startSize = this.getInitialSize();

        // 초기 위치 세팅
        if (title) gsap.set(title, { 
            y: yOffset * 2, 
            x: 0,
            filter: "blur(16px)",
            opacity: 0,
        });

        if (stickyWrapper) {
            gsap.set(stickyWrapper, { 
                "--rect-scroll-inverted-progress": 1,
                "--rect-scroll-progress": 0,
                "--rect-scroll-brightness": 0.8,
            });  

            this.createTimeline({
                start:"top 75%",
                end:"top 25%",
                scrub:1,
            }).to(stickyWrapper, {
                "--rect-scroll-inverted-progress": 0,
            }, 0);

            // this.createTimeline({
            //     start:"top 40%",
            //     end:"top top",
            //     scrub:0.1,
            // }).to(stickyWrapper, {
            //     "--rect-scroll-progress": 1,
            // }, 0);

            // this.createTimeline({
            //     start:"top bottom",
            //     end:"top top",
            //     scrub:true,
            // }).to(background, {
            //     "--rect-scroll-brightness": 0.7,
            // }, 0);

            // this.createTimeline({
            //     start:"top top",
            //     end:"bottom top",
            //     scrub:1,
            // }).to(background, {
            //     "--rect-scroll-brightness": 0.25,
            // }, 0);

        }

        if (background) {
            gsap.set(background, { 
                "--clip-path-start-size": `${50 - startSize / 2}%`,
                clipPath: `inset(
                    calc( (var(--h2-font-size) + var(--header-height)) * var(--rect-scroll-inverted-progress) )
                    calc( var(--clip-path-start-size) * var(--rect-scroll-inverted-progress) )
                    calc( var(--h2-font-size) * var(--rect-scroll-inverted-progress) )
                    calc( var(--clip-path-start-size) * var(--rect-scroll-inverted-progress) )
                    round calc( max(5lvh, 5lvw) * var(--rect-scroll-inverted-progress) )
                )`,
                filter: "brightness(var(--rect-scroll-brightness))",
            });
        } 
        
    
        this.createTimeline({
            start: "top 80%",
            end: "bottom center",
            scrub:1,
        }).to(title, {
            y: yOffset * -2,
            ease: CustomEase.create("custom", "M0,0 C0,0 0,0.4 0.2,0.45 0.4,0.5 0.6,0.5 0.8,0.55 1,0.6 1,1 1,1 "),
        }, 0);

                
        this.createTimeline({
            start:"top 75%",
            end:"top 25%",
            scrub:0.5,
        }).to(title, {
            opacity:1,
            filter: "blur(0px)",
            duration: 0.5
        }, 0);

        this.createTimeline({
            start: "bottom 75%",
            end: "bottom 25%",
            scrub:0.5,
        }).to(title, {
            opacity:0,
            filter: "blur(16px)",
            duration: 0.5,
            duration: 0.5
        }, 0);


    },
    
    getInitialSize() {
        const content = this.elements.stickyElement?.querySelector('.sticky-element-content');

        if (!content || !this.elements.background) {
            return 50
        };

        const contentWidth = content.getBoundingClientRect().width;
        const containerWidth = this.elements.background.getBoundingClientRect().width;
        const effectiveWidth = Math.min(contentWidth, window.innerWidth);
        
        const result = (effectiveWidth / containerWidth) * 100;
        console.log({contentWidth, containerWidth, effectiveWidth, result})
        return result;
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

    createTimeline(options = {}) {
        return gsap.timeline({
            scrollTrigger: {
                trigger: this.elements.trigger, 
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

