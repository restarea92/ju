/**
 * Horizontal Scroll Animation Module
 * Handles horizontal scroll animations with GSAP and ScrollTrigger
 */

if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

const horizontalApp = {
    init() {
        this.initializeHorizontalScroll();
        gsap.to("body", { scrollBehavior: "smooth" });
    },

    initializeHorizontalScroll() {
        const horizontalSections = gsap.utils.toArray(".horizontal-spacer");

        horizontalSections.forEach((container) => {
            this.setupHorizontalContainer(container);
        });
    },

    setupHorizontalContainer(container) {
        const sections = container.querySelectorAll(".multi-scroll-item");
        const elements = this.getHorizontalElements();
        const { yOffset, xOffset } = this.calculateOffsets();
        const debugElements = this.getDebugElements();

        this.setInitialPositions(elements, yOffset, xOffset);
        this.createHorizontalTimelines(container, elements, yOffset, xOffset, debugElements);
        this.createMainHorizontalTimeline(container, sections, debugElements);
    },

    getHorizontalElements() {
        const multiScrollItem1 = document.querySelector("#multi-scroll-item1");
        const multiScrollItem2 = document.querySelector("#multi-scroll-item2");

        return {
            text: multiScrollItem1?.querySelector('.content-text'),
            image: multiScrollItem1?.querySelector('.content-image'),
            title: multiScrollItem1?.querySelector('.content-title'),
            text2: multiScrollItem2?.querySelector('.content-text'),
            image2: multiScrollItem2?.querySelector('.content-image'),
            title2: multiScrollItem2?.querySelector('.content-title')
        };
    },

    getDebugElements() {
        return {
            progressEl: document.getElementById('progress-element'),
            progressEl2: document.getElementById('progress-element2'),
            stateEl: document.querySelector('#state-el')
        };
    },

    calculateOffsets() {
        const minVwVh = (value) => {
            const vw = window.innerWidth * (value / 100);
            const vh = window.innerHeight * (value / 100);
            return Math.min(vw, vh);
        };

        return {
            yOffset: minVwVh(10),
            xOffset: minVwVh(20)
        };
    },

    setInitialPositions(elements, yOffset, xOffset) {
        const { text, image, title, text2, image2, title2 } = elements;

        if (text) gsap.set(text, { y: yOffset * 3, x: 0 });
        if (image) gsap.set(image, { y: yOffset * 1.5, x: 0 });
        if (title) gsap.set(title, { y: yOffset * 1, x: 0 });

        if (text2) gsap.set(text2, { x: xOffset * 3, y: 0 });
        if (image2) gsap.set(image2, { x: xOffset * 1.5, y: 0 });
        if (title2) gsap.set(title2, { x: xOffset * 1, y: 0 });
    },

    createHorizontalTimelines(container, elements, yOffset, xOffset, debugElements) {
        const { text, image, title, text2, image2, title2 } = elements;
        const { progressEl, progressEl2 } = debugElements;

        const timelineOptions = this.getTimelineOptions(progressEl, progressEl2);
        const createTimeline = this.createTimelineFactory(container);

        this.createFirstSectionAnimations(createTimeline, timelineOptions, text, image, title);
        this.createSecondSectionAnimations(createTimeline, timelineOptions, text2, image2, title2);
    },

    getTimelineOptions(progressEl, progressEl2) {
        return {
            firstIn: {
                start: "top center",
                end: "center bottom",
                onUpdate: self => {
                    const progressPercent = (self.progress * 100).toFixed(0);
                    if (progressEl) progressEl.textContent = 'For debug: ' + progressPercent + '%';
                },
            },
            firstOut: {
                start: "center bottom",
                end: "center top",
            },
            secondIn: {
                start: "center center",
                end: "center top",
                onUpdate: self => {
                    const progressPercent = (self.progress * 100).toFixed(0);
                    if (progressEl2) progressEl2.textContent = 'For debug: ' + progressPercent + '%';
                }
            },
            secondOut: {
                start: "bottom bottom",
                end: "bottom top",
            }
        };
    },

    createTimelineFactory(container) {
        return (options = {}) => {
            return gsap.timeline({
                scrollTrigger: {
                    trigger: container,
                    start: "top bottom",
                    end: "center top",
                    scrub: 1,
                    ...options,
                }
            });
        };
    },

    createFirstSectionAnimations(createTimeline, timelineOptions, text, image, title) {
        createTimeline(timelineOptions.firstIn).to([text, image, title], {
            y: "0%",
            ease: "ease",
            duration: 0.5
        }, 0);

        const firstOutTimeline = createTimeline(timelineOptions.firstOut);

        firstOutTimeline.to(text, {
            x: "-200%",
            ease: "ease",
            opacity: 0,
            filter: "blur(16px)",
            duration: 0.5
        }, 0);

        firstOutTimeline.to(image, {
            x: "-300%",
            ease: "ease",
            opacity: 0,
            duration: 0.5
        }, 0);

        firstOutTimeline.to(title, {
            x: "-100%",
            ease: "ease",
            filter: "blur(16px)",
            opacity: 0,
            duration: 0.5
        }, 0);
    },

    createSecondSectionAnimations(createTimeline, timelineOptions, text2, image2, title2) {
        createTimeline(timelineOptions.secondIn).to([text2, image2, title2], {
            x: "0%",
            ease: "ease",
            duration: 0.5
        }, 0);

        const secondOutTimeline = createTimeline(timelineOptions.secondOut);

        secondOutTimeline.to(text2, {
            y: "-200%",
            ease: "ease",
            opacity: 0,
            filter: "blur(16px)",
            duration: 0.5
        }, 0);

        secondOutTimeline.to(image2, {
            y: "-300%",
            ease: "ease",
            opacity: 0,
            duration: 0.5
        }, 0);

        secondOutTimeline.to(title2, {
            y: "-100%",
            ease: "ease",
            filter: "blur(16px)",
            opacity: 0,
            duration: 0.5
        }, 0);
    },

    createMainHorizontalTimeline(container, sections, debugElements) {
        const { stateEl, progressEl2 } = debugElements;

        const timeline = gsap.timeline({
            scrollTrigger: {
                trigger: container,
                pin: false,
                scrub: 0.5,
                start: "center bottom",
                end: "center top",
                onUpdate: self => {
                    if (stateEl) stateEl.textContent = 'For debug: SCROLLING';
                    const progressPercent = (self.progress * 100).toFixed(0);
                    if (progressEl2) progressEl2.textContent = 'For debug: ' + progressPercent + '%';
                },
                onLeave: () => {
                    if (stateEl) stateEl.textContent = 'For debug: END';
                },
                onLeaveBack: () => {
                    if (stateEl) stateEl.textContent = 'For debug: END (back)';
                }
            },
        });

        this.createSectionTimeline(timeline, sections);
    },

    createSectionTimeline(timeline, sections) {
        sections.forEach((section, index) => {
            if (index === 0) {
                timeline.to(sections, {
                    xPercent: 0,
                    duration: 0.5,
                    ease: "none"
                });
            } else {
                timeline.to(sections, {
                    xPercent: -100 * index,
                    duration: 3,
                    ease: "power2.inOut"
                })
                .to(sections, {
                    xPercent: -100 * index,
                    duration: 0.5,
                    ease: "none"
                });
            }
        });
    },
};

export default horizontalApp;
