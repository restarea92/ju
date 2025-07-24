// app.js (ES6 모듈)

const options = {
    FRAME_COUNT: 125,
    FRAME_BASE_URL: 'https://raw.githubusercontent.com/restarea92/ju/main/media',
};

const elements = {
    canvas: document.getElementById('hero-lightpass'),
    context: document.getElementById('hero-lightpass').getContext('2d'),
    centerText: document.getElementById('center-svg'),
    canvasWrapper: document.getElementById('canvas-wrapper'),
    canvasContainer: document.querySelector('.canvas-container'),
    maskLayer: document.getElementById('maskLayer')
};

const alertRemover = {
    init() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(({ addedNodes }) => {
                addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.getAttribute('role') === 'alert') {
                        node.remove();
                    }
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
        document.querySelectorAll('[role="alert"]').forEach(el => el.remove());
    }
};

const frameManager = {
    images: [],
    getFrameUrl(index) {
        return `${options.FRAME_BASE_URL}/dframe_${index.toString().padStart(4, '0')}.jpg`;
    },
    setCanvasSize(img) {
        elements.canvas.width = img.naturalWidth;
        elements.canvas.height = img.naturalHeight;
    },
    drawImage(img) {
        elements.context.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
        elements.context.drawImage(img, 0, 0);
    },
    updateImage(index) {
        const img = this.images[index - 1];
        if (img && img.complete) {
            this.drawImage(img);
        }
    },
    preloadImages() {
        for (let i = 1; i <= options.FRAME_COUNT; i++) {
            const img = new Image();
            img.src = this.getFrameUrl(i);
            this.images.push(img);
        }
    },
    init() {
        const firstFrame = new Image();
        firstFrame.src = this.getFrameUrl(1);
        firstFrame.onload = () => {
            this.setCanvasSize(firstFrame);
            this.drawImage(firstFrame);
        };
        this.preloadImages();
    }
};

const animations = {
    easeOutSine(t) {
        return Math.sin(t * Math.PI / 2);
    },
    updateTextIn(scrollFraction) {
        const MIN_SCALE = 0.04;
        const MAX_SCALE = 0.06;
        const easedT = this.easeOutSine(scrollFraction);
        const opacity = 0.25 + (1 - 0.25) * easedT;
        const scale = MIN_SCALE + (MAX_SCALE - MIN_SCALE) * easedT;
        elements.centerText.style.opacity = opacity;
        elements.centerText.style.transform = `translateX(-50%) translateY(-50%) scale(${scale})`;
        elements.centerText.style.webkitTransform = `translateX(-50%) translateY(-50%) scale(${scale})`;
    },
    updateTextOut(scrollFraction) {
        const MIN_SCALE = 0.06;
        const MAX_SCALE = 1;
        const easedT = this.easeOutSine(scrollFraction);
        const opacity = 1;
        const scale = MIN_SCALE + (MAX_SCALE - MIN_SCALE) * easedT;
        elements.centerText.style.opacity = opacity;
        elements.centerText.style.transform = `translateX(-50%) translateY(-50%) scale(${scale})`;
        elements.centerText.style.webkitTransform = `translateX(-50%) translateY(-50%) scale(${scale})`;
    }
};

const scrollCalculator = {
    getTextInScrollFraction() {
        const wrapperRect = elements.canvasWrapper.getBoundingClientRect();
        const wrapperHeight = elements.canvasWrapper.offsetHeight;
        const viewportHeight = window.innerHeight;
        const scrollableDistance = wrapperHeight - viewportHeight;
        const currentScroll = Math.max(0, -wrapperRect.top);
        return Math.min(1, Math.max(0, currentScroll / scrollableDistance));
    },
    getTextOutScrollFraction() {
        const wrapperRect = elements.canvasWrapper.getBoundingClientRect();
        const wrapperHeight = elements.canvasWrapper.offsetHeight;
        const viewportHeight = window.innerHeight;
        const stickyEndPoint = -(wrapperHeight - viewportHeight);
        if (wrapperRect.top > stickyEndPoint) return 0;
        const outScrollDistance = viewportHeight;
        const currentOutScroll = Math.abs(wrapperRect.top - stickyEndPoint);
        return Math.min(1, currentOutScroll / outScrollDistance);
    },
    getVideoScrollFraction() {
        const wrapperRect = elements.canvasWrapper.getBoundingClientRect();
        const wrapperHeight = elements.canvasWrapper.offsetHeight;
        const canvasHeight = elements.canvasContainer.offsetHeight;
        const totalHeight = wrapperHeight + canvasHeight;
        const viewportHeight = window.innerHeight;
        const scrollableDistance = totalHeight - viewportHeight;
        const currentScroll = Math.max(0, -wrapperRect.top);
        return Math.min(1, Math.max(0, currentScroll / scrollableDistance));
    }
};

const scrollHandler = {
    ticking: false,
    handleScroll() {
        if (!this.ticking) {
            requestAnimationFrame(() => {
                const videoScrollFraction = scrollCalculator.getVideoScrollFraction();
                const frameIndex = Math.min(options.FRAME_COUNT - 1, Math.ceil(videoScrollFraction * options.FRAME_COUNT));
                frameManager.updateImage(frameIndex + 1);
                const textOutFraction = scrollCalculator.getTextOutScrollFraction();
                if (textOutFraction > 0) {
                    animations.updateTextOut(textOutFraction);
                } else {
                    const textInFraction = scrollCalculator.getTextInScrollFraction();
                    animations.updateTextIn(textInFraction);
                }
                this.ticking = false;
            });
            this.ticking = true;
        }
    },
    handleScrollMask() {
        const target = elements.canvasWrapper;
        const targetRect = target.getBoundingClientRect();
        const targetBottom = targetRect.bottom + window.pageYOffset;
        const viewportHeight = window.innerHeight;
        const viewportBottom = window.pageYOffset + viewportHeight;
        let scrollProgress = (viewportBottom - targetBottom) / (viewportHeight * 2);
        scrollProgress = Math.min(Math.max(scrollProgress, 0), 1);
        const insetValue = scrollProgress * 20;
        elements.maskLayer.style.clipPath = `inset(${insetValue}% ${insetValue}% ${insetValue}% ${insetValue}% round ${insetValue}vw)`;
    },
    init() {
        window.addEventListener('scroll', () => this.handleScroll());
        window.addEventListener('scroll', () => this.handleScrollMask());
    }
};

export function initApp() {
    alertRemover.init();
    frameManager.init();
    scrollHandler.init();
    scrollHandler.handleScroll();
}
