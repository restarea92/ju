// app.js
import { initGSAP } from './gsapUtils.js';
// import { initGSAP } from 'https://restarea92.github.io/ju/modules/gsapUtils.js';

const app = {
    options: {
        FRAME_COUNT: 125,
        FRAME_BASE_URL: 'https://raw.githubusercontent.com/restarea92/ju/main/media/webp_frames',
    },

    elements: {},

    frameManager: {
        images: [],
        currentFrame: 0,
        targetFrame: 0,
        rafId: null,

        getFrameUrl(index) {
            return `${app.options.FRAME_BASE_URL}/rdframe_${index.toString().padStart(4, '0')}.webp`;
        },

        setCanvasSize(img) {
            app.elements.canvas.width = img.naturalWidth;
            app.elements.canvas.height = img.naturalHeight;
        },

        drawImage(index) {
            const img = this.images[index];
            if (img && img.complete) {
                app.elements.context.clearRect(0, 0, app.elements.canvas.width, app.elements.canvas.height);
                app.elements.context.drawImage(img, 0, 0);
            }
        },

        preloadImages(onComplete) {
            let loaded = 0;
            for (let i = 0; i < app.options.FRAME_COUNT; i++) {
                const img = new Image();
                img.src = this.getFrameUrl(i + 1);
                img.onload = () => {
                    loaded++;
                    if (loaded === app.options.FRAME_COUNT && onComplete) {
                        onComplete();
                    }
                };
                this.images.push(img);
            }
        },

        animateFrames() {
            if (this.currentFrame === this.targetFrame) {
                cancelAnimationFrame(this.rafId);
                this.rafId = null;
                return;
            }
            const step = this.currentFrame < this.targetFrame ? 1 : -1;
            this.currentFrame += step;
            this.drawImage(this.currentFrame);
            this.rafId = requestAnimationFrame(() => this.animateFrames());
        },

        init() {
            if (!initGSAP()) return;

            const firstFrame = new Image();
            firstFrame.src = this.getFrameUrl(1);
            firstFrame.onload = () => {
                this.setCanvasSize(firstFrame);
                this.drawImage(0);
            };

            this.preloadImages(() => {
                this.setupScrollAnimation();
            });
        },

        setupScrollAnimation() {
            ScrollTrigger.create({
                trigger: app.elements.canvasWrapper,
                start: "top top",
                end: "bottom bottom",
                scrub: true,
                onUpdate: (self) => {
                    const frame = Math.round(self.progress * (this.images.length - 1));
                    console.log(frame);
                    if (frame !== this.targetFrame) {
                        this.targetFrame = frame;
                        if (!this.rafId) this.animateFrames();
                    }
                }
            });
        }
    },

    initElements() {
        this.elements = {
            canvas: document.getElementById('hero-lightpass'),
            context: document.getElementById('hero-lightpass').getContext('2d'),
            canvasWrapper: document.getElementById('canvas-wrapper')
        };
    },

    init() {
        this.initElements();
        this.frameManager.init();
    }
};

export default app;
