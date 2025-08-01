if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

const CONFIG = {
    VERSION: '1.1.42',
    ACTIVATION_THRESHOLD: 0.15,
    SCROLL_DEBOUNCE_DELAY: 16,
    STICKY_HEIGHT_MULTIPLIER: 2,
    INITIAL_RADIUS: 5,
    ANIMATION_START: 0.1,
    ANIMATION_END: 0.6,
};

const state = {
    scrollTimer: null,
    progress: 0,
    verticalProgress: 0,
    horizontalProgress: 0,
    isActive: null,
    resizeObserver: null,
};

const elements = {
    visualSection: document.querySelector('#visual-section'),
    stickyWrapper: document.querySelector('.sticky-wrapper'),
    title: document.querySelector('.title'),
    trigger: document.querySelector('#scroll-trigger'),
    get background() {
        return this.visualSection?.querySelector('.sticky-element-background');
    },
    get stickyElement() {
        return this.stickyWrapper?.querySelector('.sticky-element');
    },
};

/**
 * Check if GSAP and required plugins are loaded.
 * @returns {boolean}
 */
function validateGSAP() {
    if (typeof gsap === 'undefined') {
        console.error('GSAP not loaded - include gsap.min.js');
        return false;
    }
    if (typeof ScrollTrigger === 'undefined') {
        console.error('ScrollTrigger not loaded or registered');
        return false;
    }
    return true;
}

function getInitialSize() {
    const content = elements.visualSection?.querySelector('.sticky-element-content');
    if (!content || !elements.background) return 50;
    const contentWidth = content.getBoundingClientRect().width;
    const containerWidth = elements.background.getBoundingClientRect().width;
    const effectiveWidth = Math.min(contentWidth, window.innerWidth);
    return (effectiveWidth / containerWidth) * 100;
}

function easeOutSine(t) {
    return Math.sin(t * Math.PI / 2);
}

function easeInOutSine(t) {
    t = Math.max(0, Math.min(1, t));
    return -(Math.cos(Math.PI * t) - 1) / 2;
}

function easeInOutPeak(t) {
    t = Math.max(0, Math.min(1, t));
    const peak = 0.6;
    const sharpness = 2.5;
    const a = Math.pow(t, sharpness);
    const b = Math.pow(1 - t, sharpness);
    const peakShape = a * b;
    return peakShape / Math.pow(peak * (1 - peak), sharpness);
}

function emitEvent(eventName, detail) {
    document.dispatchEvent(new CustomEvent(eventName, { detail }));
}

function setHeaderHeightVariable() {
    const header = document.getElementById('s2025072923c95d7545c67');
    const height = header ? header.getBoundingClientRect().height : 0;
    document.documentElement.style.setProperty('--header-height', `${height}px`);
}

function updateActivationState() {
    const shouldActivate = state.progress >= CONFIG.ACTIVATION_THRESHOLD;
    if (state.isActive === shouldActivate) return;
    state.isActive = shouldActivate;

    const section = elements.visualSection;
    section.classList.remove(shouldActivate ? 'inactive' : 'active');
    section.classList.add(shouldActivate ? 'active' : 'inactive');

    emitEvent('visualSectionStateChange', {
        isActive: shouldActivate,
        progress: state.progress,
        element: section,
    });
}

function updateProgress(progress) {
    state.progress = progress;
    renderVisualEffects(progress);
    clearTimeout(state.scrollTimer);
    state.scrollTimer = setTimeout(updateActivationState, CONFIG.SCROLL_DEBOUNCE_DELAY);
}

function calculateClipPath(progress) {
    const { size, padding, radius } = getAnimationValues(progress);
    return `inset(calc(${padding} * var(--h2-font-size) + var(--header-height)) ${50 - size / 2}% calc(${padding} * var(--h2-font-size)) ${50 - size / 2}% round max(${radius}lvh, ${radius}lvw))`;
}

function getAnimationValues(progress) {
    const startSize = getInitialSize();
    const { INITIAL_RADIUS, ANIMATION_START, ANIMATION_END } = CONFIG;
    if (progress < ANIMATION_START) return { size: startSize, padding: 1, radius: INITIAL_RADIUS };
    if (progress >= ANIMATION_END) return { size: 100, padding: 0, radius: 0 };
    const local = (progress - ANIMATION_START) / (ANIMATION_END - ANIMATION_START);
    const eased = easeOutSine(local);
    return {
        size: startSize + (100 - startSize) * eased,
        padding: 1 - eased,
        radius: INITIAL_RADIUS * (1 - local),
    };
}

function renderVisualEffects(progress) {
    if (!elements.background) return;
    const clipPath = calculateClipPath(progress);
    const eased = easeInOutSine(progress);
    const peak = easeInOutPeak(progress);
    const bg = elements.background;

    gsap.set(bg, { clipPath });
    elements.visualSection.style.setProperty('--scroll-percentage', `${eased}`);
    elements.visualSection.style.setProperty('--scroll-peak-percentage', `${peak}`);

    if (progress >= 0.5) {
        const local = (progress - 0.5) / 0.5;
        const brightness = 1 - 0.75 * local;
        const blur = local * 10;
        gsap.set(bg, { filter: `brightness(${brightness}) blur(${blur}px)`, transform: 'translateX(-50%)' });
    } else {
        gsap.set(bg, { filter: 'brightness(1) blur(0)', transform: 'translateX(-50%)' });
    }

    emitEvent('visualSectionProgress', { progress, easedProgress: eased, element: elements.visualSection });
}

function destroy() {
    state.resizeObserver?.disconnect();
    state.resizeObserver = null;
    clearTimeout(state.scrollTimer);
    ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === elements.visualSection) trigger.kill();
    });
}

function init() {
    console.log(CONFIG.VERSION);
    if (!validateGSAP()) return;
    setHeaderHeightVariable();
    // ... initStickyWrapper(), initVisualSection(), initHorizontalScroll() 등 분리 예정
    window.addEventListener('resize', () => {
        clearTimeout(state.scrollTimer);
        state.scrollTimer = setTimeout(() => {
            setHeaderHeightVariable();
            renderVisualEffects(state.progress);
        }, 100);
    });
}

const app = {
    CONFIG,
    state,
    elements,
    init,
    destroy,
};

export default app;
