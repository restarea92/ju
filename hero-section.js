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

const app = {
    options: {
        FRAME_COUNT: 125,
        FRAME_BASE_URL: 'https://raw.githubusercontent.com/restarea92/ju/main/media/webp_frames',
    },

    elements: {},

    alertRemover: {
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
    },

    frameManager: {
        images: [],
        getFrameUrl(index) {
            return `${app.options.FRAME_BASE_URL}/rdframe_${index.toString().padStart(4, '0')}.webp`;
        },
        setCanvasSize(img) {
            app.elements.canvas.width = img.naturalWidth;
            app.elements.canvas.height = img.naturalHeight;
        },
        drawImage(img) {
            app.elements.context.clearRect(0, 0, app.elements.canvas.width, app.elements.canvas.height);
            app.elements.context.drawImage(img, 0, 0);
        },
        updateImage(index) {
            const img = this.images[index - 1];
            if (img && img.complete) {
                this.drawImage(img);
            }
        },
        preloadImages() {
            for (let i = 1; i <= app.options.FRAME_COUNT; i++) {
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
    },

    animations: {
        easeOutSine(t) {
            return Math.sin(t * Math.PI / 2);
        },
        updateTextIn(scrollFraction) {
            const MIN_SCALE = 0.04;
            const MAX_SCALE = 0.06;
            const easedT = this.easeOutSine(scrollFraction);
            const opacity = 0.25 + (1 - 0.25) * easedT;
            const scale = MIN_SCALE + (MAX_SCALE - MIN_SCALE) * easedT;
            app.elements.centerText.style.opacity = opacity;
            app.elements.centerText.style.transform = `translateX(-50%) translateY(-50%) scale(${scale})`;
            app.elements.centerText.style.webkitTransform = `translateX(-50%) translateY(-50%) scale(${scale})`;
        },
        updateTextOut(scrollFraction) {
            const MIN_SCALE = 0.06;
            const MAX_SCALE = 1;
            const easedT = this.easeOutSine(scrollFraction);
            const opacity = 1;
            const scale = MIN_SCALE + (MAX_SCALE - MIN_SCALE) * easedT;
            app.elements.centerText.style.opacity = opacity;
            app.elements.centerText.style.transform = `translateX(-50%) translateY(-50%) scale(${scale})`;
            app.elements.centerText.style.webkitTransform = `translateX(-50%) translateY(-50%) scale(${scale})`;
        }
    },

    scrollCalculator: {
        getTextInScrollFraction() {
            const wrapperRect = app.elements.canvasWrapper.getBoundingClientRect();
            const wrapperHeight = app.elements.canvasWrapper.offsetHeight;
            const viewportHeight = window.innerHeight;
            const scrollableDistance = wrapperHeight - viewportHeight;
            const currentScroll = Math.max(0, -wrapperRect.top);
            return Math.min(1, Math.max(0, currentScroll / scrollableDistance));
        },
        getTextOutScrollFraction() {
            const wrapperRect = app.elements.canvasWrapper.getBoundingClientRect();
            const wrapperHeight = app.elements.canvasWrapper.offsetHeight;
            const viewportHeight = window.innerHeight;
            const stickyEndPoint = -(wrapperHeight - viewportHeight);
            if (wrapperRect.top > stickyEndPoint) return 0;
            const outScrollDistance = viewportHeight;
            const currentOutScroll = Math.abs(wrapperRect.top - stickyEndPoint);
            return Math.min(1, currentOutScroll / outScrollDistance);
        },
        getVideoScrollFraction() {
            const wrapperRect = app.elements.canvasWrapper.getBoundingClientRect();
            const wrapperHeight = app.elements.canvasWrapper.offsetHeight;
            const canvasHeight = app.elements.canvasContainer.offsetHeight;
            const totalHeight = wrapperHeight + canvasHeight;
            const viewportHeight = window.innerHeight;
            const scrollableDistance = totalHeight - viewportHeight;
            const currentScroll = Math.max(0, -wrapperRect.top);
            return Math.min(1, Math.max(0, currentScroll / scrollableDistance));
        }
    },

    scrollHandler: {
        ticking: false,
        handleScroll() {
            if (!this.ticking) {
                requestAnimationFrame(() => {
                    const videoScrollFraction = app.scrollCalculator.getVideoScrollFraction();
                    const frameIndex = Math.min(app.options.FRAME_COUNT - 1, Math.ceil(videoScrollFraction * app.options.FRAME_COUNT));
                    app.frameManager.updateImage(frameIndex + 1);
                    app.elements.canvas.style.filter = `brightness(${1 - videoScrollFraction * 0.5})`;
                    const textOutFraction = app.scrollCalculator.getTextOutScrollFraction();
                    if (textOutFraction > 0) {
                        app.animations.updateTextOut(textOutFraction);
                    } else {
                        const textInFraction = app.scrollCalculator.getTextInScrollFraction();
                        app.animations.updateTextIn(textInFraction);
                    }
                    this.ticking = false;
                });
                this.ticking = true;
            }
        },
        handleScrollMask() {
            const target = app.elements.canvasWrapper;
            const targetRect = target.getBoundingClientRect();
            const targetBottom = targetRect.bottom + window.pageYOffset;
            const viewportHeight = window.innerHeight;
            const viewportBottom = window.pageYOffset + viewportHeight;
            let scrollProgress = (viewportBottom - targetBottom) / (viewportHeight * 2);
            scrollProgress = Math.min(Math.max(scrollProgress, 0), 1);
            const insetValue = scrollProgress * 20;
            app.elements.maskLayer.style.clipPath = `inset(${insetValue}% ${insetValue}% ${insetValue}% ${insetValue}% round ${insetValue}vw)`;
        },
        init() {
            window.addEventListener('scroll', () => this.handleScroll());
            window.addEventListener('scroll', () => this.handleScrollMask());
        }
    },

    initElements() {
        this.elements = {
            canvas: document.getElementById('hero-lightpass'),
            context: document.getElementById('hero-lightpass').getContext('2d'),
            centerText: document.getElementById('center-svg'),
            canvasWrapper: document.getElementById('canvas-wrapper'),
            canvasContainer: document.querySelector('.canvas-container'),
            maskLayer: document.getElementById('maskLayer')
        };
    },

    init() {
        this.initElements();
        this.alertRemover.init();
        this.frameManager.init();
        this.scrollHandler.init();
        this.scrollHandler.handleScroll();
    }
};

export default app;