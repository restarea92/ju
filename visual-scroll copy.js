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

const CONFIG = {
  ACTIVATION_THRESHOLD: 15,
  SCROLL_DEBOUNCE_DELAY: 150,
  STICKY_HEIGHT_MULTIPLIER: 1.75,
  INITIAL_RADIUS: 5,
  PADDING: 4,
  ANIMATION_START: 10,
  ANIMATION_END: 90
};

const state = {
  scrollTimer: null,
  progress: 0,
  isActive: null,
  version: '1.0.41',
  resizeObserver: null
};

const app = {
  // ========== 유틸리티 ==========
  utils: {
    validateGSAP: () => {
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

    easeOutSine: t => Math.sin(t * Math.PI / 2),

    emitEvent: (eventName, detail) => {
      document.dispatchEvent(new CustomEvent(eventName, { detail }));
    }
  },

  // ========== 애니메이션 계산 ==========
  animation: {
    getInitialSize: section => {
      const content = section.querySelector('.sticky-element-content');
      const background = section.querySelector('.sticky-element-background');

      if (!content || !background) return 50;

      const contentWidth = content.getBoundingClientRect().width;
      const containerWidth = background.getBoundingClientRect().width;
      const effectiveWidth = Math.min(contentWidth, window.innerWidth);

      return (effectiveWidth / containerWidth) * 100;
    },

    getAnimationValues: (progress, section) => {
      const startSize = app.animation.getInitialSize(section);
      const {
        INITIAL_RADIUS,
        PADDING,
        ANIMATION_START,
        ANIMATION_END
      } = CONFIG;

      if (progress < ANIMATION_START) {
        return { size: startSize, padding: 1, radius: INITIAL_RADIUS };
      }

      if (progress >= ANIMATION_END) {
        return { size: 100, padding: 0, radius: 0 };
      }

      const localProgress = (progress - ANIMATION_START) / (ANIMATION_END - ANIMATION_START);
      const eased = app.utils.easeOutSine(localProgress);

      return {
        size: startSize + (100 - startSize) * eased,
        padding: 1 - eased,
        radius: INITIAL_RADIUS * (1 - localProgress)
      };
    },

    calculateClipPath: (progress, section) => {
      const { size, padding, radius } = app.animation.getAnimationValues(progress, section);
      return `inset(calc(${padding} * var(--h2-font-size)) ${50 - size / 2}% calc(${padding} * var(--h2-font-size)) ${50 - size / 2}% round max(${radius}lvh, ${radius}lvw))`;
    }
  },

  // ========== 초기화 ==========
  init: () => {
    console.log(state.version);
    if (!app.utils.validateGSAP()) return;
    app.initScrollTriggerForVisual();
    app.initStickyWrapperHeight();
  },

  // ========== 스크롤 트리거 초기화 ==========
  initScrollTriggerForVisual: () => {
    const section = document.querySelector('#visual-section');
    if (!section) {
      console.warn('Visual section not found');
      return;
    }

    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: self => {
        app.updateScrollProgress(self.progress * 100, section);
      }
    });

    app.renderVisualEffects(0, section);
    app.updateActivationState(section);
  },

  // ========== sticky-wrapper 높이 반응 ==========
  initStickyWrapperHeight: () => {
    const wrapper = document.querySelector('.sticky-wrapper');
    const element = wrapper?.querySelector('.sticky-element');
    if (!wrapper || !element) return;

    const observer = new ResizeObserver(() => {
      const height = element.getBoundingClientRect().height;
      wrapper.style.height = `${height * CONFIG.STICKY_HEIGHT_MULTIPLIER}px`;
    });

    observer.observe(element);
    state.resizeObserver = observer;
  },

  // ========== 상태 관리 ==========
  updateScrollProgress: (progress, section) => {
    state.progress = progress;
    app.renderVisualEffects(progress, section);

    clearTimeout(state.scrollTimer);
    state.scrollTimer = setTimeout(() => {
      app.updateActivationState(section);
    }, CONFIG.SCROLL_DEBOUNCE_DELAY);
  },

  updateActivationState: section => {
    const active = state.progress >= CONFIG.ACTIVATION_THRESHOLD;
    if (state.isActive === active) return;

    state.isActive = active;

    section.classList.remove(active ? 'inactive' : 'active');
    section.classList.add(active ? 'active' : 'inactive');

    app.utils.emitEvent('visualSectionStateChange', {
      isActive: active,
      progress: state.progress,
      element: section
    });
  },

  renderVisualEffects: (progress, section) => {
    const background = section.querySelector('.sticky-element-background');
    if (!background) return;

    const clipPath = app.animation.calculateClipPath(progress, section);
    gsap.set(background, { clipPath });

    app.utils.emitEvent('visualSectionProgress', {
      progress,
      element: section
    });
  },

  // ========== 해제 메서드 ==========
  destroy: () => {
    if (state.resizeObserver) {
      state.resizeObserver.disconnect();
      state.resizeObserver = null;
    }
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  },

  // ========== 레거시 호환 ==========
  initVisualSectionScroll: () => app.initScrollTriggerForVisual(),
  initStickyWrapper: () => app.initStickyWrapperHeight(),
  handleScrollProgress: (progress, element) => app.renderVisualEffects(progress, element),
  handleScrollStop: element => {
    clearTimeout(state.scrollTimer);
    state.scrollTimer = setTimeout(() => {
      app.updateActivationState(element);
    }, CONFIG.SCROLL_DEBOUNCE_DELAY);
  },
  easeOutSine: t => app.utils.easeOutSine(t)
};

export default app;
