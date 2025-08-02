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

}

export default app;


document.addEventListener('DOMContentLoaded', () => {

    const rectScrollTrigger = document.querySelector('#scroll-trigger');
    const stickyElement = document.querySelector('.sticky-element');
    const title = stickyElement.querySelector('.title');
    function minVwVh(value) {
        const vw = window.innerWidth * (value / 100);
        const vh = window.innerHeight * (value / 100);
        return Math.min(vw, vh);
    }


    const createTimeline = (options = {}) => {
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
    };
    

    const yOffset = minVwVh(10); 

    // 초기 위치 세팅
    if (title) gsap.set(title, { y: yOffset * 3, x: 0  });

    createTimeline().to(title, {
        y: "0",
        ease: "ease",
        opacity:1,
        filter: "",
        duration: 0.5
    }, 0);

    createTimeline({
        start: "bottom bottom",
        end: "bottom top",
    }).to(title, {
        y: "0",
        ease: "ease",
        opacity:0,
        filter: "",
        duration: 0.5
    }, 0);

    gsap.to("body", {
        scrollBehavior: "smooth"
    });
});
