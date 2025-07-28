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

// GSAP 플러그인 등록
if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const app = {
    // Private state management
    _state: {
        scrollTimer: null,
        progress: 0,
        isActive: null,
        version: '1.0.17',
        updateProgressCallCount: 0  // 호출 횟수 카운터
    },

    // Configuration constants
    _config: {
        activationThreshold: 50,
        scrollDebounceDelay: 150,
        stickyHeightMultiplier: 1.75,
        clipPathConfig: {
            initialRadius: 10,
            padding: 4,
            animationBreakpoints: [10, 90]
        }
    },
    
    // Utility functions
    _utils: {
        easeOutSine: t => Math.sin(t * Math.PI / 2),
        
        validateGSAP() {
            if (typeof gsap === 'undefined') {
                console.error('GSAP not loaded - include gsap.min.js');
                return false;
            }
            if (typeof ScrollTrigger === 'undefined') {
                console.error('ScrollTrigger not loaded or registered');
                return false;
            }
            return true;
        },

        emitEvent(eventName, detail) {
            document.dispatchEvent(new CustomEvent(eventName, { detail }));
        }
    },

    init() {
        console.log(this._state.version);
        
        if (!this._utils.validateGSAP()) return;
        
        this._initVisualSection();
        this._initStickyWrapper();
    },

    _initVisualSection() {
        const section = document.querySelector('#visual-section');
        
        if (!section) {
            console.warn('Visual section not found');
            return;
        }

        this._createScrollTrigger(section);
        this._initializeSection(section);
    },

    _createScrollTrigger(section) {
        ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            onUpdate: (self) => {
                const progress = self.progress * 100;
                this._updateProgress(progress, section);
            },
        });
    },

    _updateProgress(progress, section) {
        this._state.progress = progress;
        this._state.updateProgressCallCount++;
        
        this._renderVisualEffects(progress, section);
        this._scheduleActivationUpdate(section);
    },

    _scheduleActivationUpdate(section) {
        clearTimeout(this._state.scrollTimer);
        
        this._state.scrollTimer = setTimeout(() => {
            this._updateActivationState(section);
        }, this._config.scrollDebounceDelay);
    },

    _updateActivationState(section) {
        const shouldActivate = this._state.progress >= this._config.activationThreshold;
        
        if (this._state.isActive === shouldActivate) return;
        
        this._state.isActive = shouldActivate;
        this._applyActivationClasses(section, shouldActivate);
        this._emitStateChangeEvent(section, shouldActivate);
    },

    _applyActivationClasses(section, isActive) {
        const [activeClass, inactiveClass] = isActive 
            ? ['active', 'inactive'] 
            : ['inactive', 'active'];
        
        section.classList.remove(inactiveClass);
        section.classList.add(activeClass);
        
    },

    _emitStateChangeEvent(section, isActive) {
        this._utils.emitEvent('visualSectionStateChange', {
            isActive,
            progress: this._state.progress,
            element: section
        });
    },

    _initializeSection(section) {
        this._renderVisualEffects(0, section);
        this._updateActivationState(section);
    },

    _renderVisualEffects(progress, section) {
        const background = section.querySelector('.sticky-element-background');
        if (!background) return;

        const clipPathValue = this._calculateClipPath(progress, section);
        gsap.set(background, { clipPath: clipPathValue });

        this._utils.emitEvent('visualSectionProgress', {
            progress,
            element: section
        });
    },

    _calculateClipPath(progress, section) {
        const dimensions = this._getDimensions(section);
        const startSize = this._getInitialSize(dimensions);
        const { size, padding, radius } = this._getAnimationValues(progress, startSize);
        
        const { padding: paddingMultiplier } = this._config.clipPathConfig;
        
        return `inset(${paddingMultiplier * padding}rem ${50 - size / 2}% ${paddingMultiplier * padding}rem ${50 - size / 2}% round max(${radius}lvh, ${radius}lvw))`;
    },

    _getDimensions(section) {
        const content = section.querySelector('.sticky-element-content');
        const background = section.querySelector('.sticky-element-background');
        
        return {
            contentWidth: content?.getBoundingClientRect().width || 1,
            containerWidth: background?.getBoundingClientRect().width || 1,
            viewportWidth: window.innerWidth
        };
    },

    _getInitialSize({ contentWidth, containerWidth, viewportWidth }) {
        const effectiveWidth = Math.min(contentWidth, viewportWidth);
        return (effectiveWidth / containerWidth) * 100;
    },

    _getAnimationValues(progress, startSize) {
        const { animationBreakpoints, initialRadius } = this._config.clipPathConfig;
        const [firstBreakpoint, secondBreakpoint] = animationBreakpoints;

        if (progress < firstBreakpoint) {
            return { size: startSize, padding: 1, radius: initialRadius };
        }

        if (progress < secondBreakpoint) {
            const localProgress = (progress - firstBreakpoint) / (secondBreakpoint - firstBreakpoint);
            const easedProgress = this._utils.easeOutSine(localProgress);
            
            return {
                size: startSize + (100 - startSize) * easedProgress,
                padding: 1 - easedProgress,
                radius: initialRadius * (1 - localProgress)
            };
        }

        return { size: 100, padding: 0, radius: 0 };
    },

    _initStickyWrapper() {
        const wrapper = document.querySelector('.sticky-wrapper');
        const element = wrapper?.querySelector('.sticky-element');
        
        if (!wrapper || !element) return;

        this._observeStickyResize(wrapper, element);
    },

    _observeStickyResize(wrapper, element) {
        const observer = new ResizeObserver(() => {
            const height = element.getBoundingClientRect().height;
            wrapper.style.height = `${height * this._config.stickyHeightMultiplier}px`;
        });

        observer.observe(element);
    },

    // Legacy method for backward compatibility
    initVisualSectionScroll() {
        return this._initVisualSection();
    },

    // Legacy method for backward compatibility  
    initStickyWrapper() {
        return this._initStickyWrapper();
    },

    // Legacy method for backward compatibility
    handleScrollProgress(progress, element) {
        return this._renderVisualEffects(progress, element);
    },

    // Legacy method for backward compatibility
    handleScrollStop(element) {
        return this._scheduleActivationUpdate(element);
    },

    // Legacy method for backward compatibility
    easeOutSine(t) {
        return this._utils.easeOutSine(t);
    }
};

export default app;