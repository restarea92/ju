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

// infinite-scroll.js 
const app = {
  options: {
    itemsPerView: 5,
    flowScrollPadding: '0.75rem',
    mobile: { itemsPerView: 2, flowScrollPadding: '0.25rem' },
    tablet: { itemsPerView: 3, flowScrollPadding: '0.5rem' }
  },

  init() {
    this.cacheElements();
    this.setOptionsByWidth();
    this.bindEvents();
    this.render();
  },

  cacheElements() {
    this.$menu = document.querySelector('#slide-container');
    this.$items = document.querySelectorAll('.slide');
    this.$links = document.querySelectorAll('.slide figure a');
    this.menuWidth = this.$menu.clientWidth;
    this.itemWidth = this.$items[0].clientWidth;
    this.wrapWidth = this.$items.length * this.itemWidth;

    this.scrollSpeed = 0;
    this.oldScrollY = 0;
    this.scrollY = 0;
    this.y = 0;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragEndX = 0;
  },

  setOptionsByWidth() {
    const w = window.innerWidth;
    let opt = {
      itemsPerView: this.options.itemsPerView,
      flowScrollPadding: this.options.flowScrollPadding,
    };

    if (w < 768 && this.options.mobile) {
      opt = this.options.mobile;
    } else if (w >= 768 && w < 1024 && this.options.tablet) {
      opt = this.options.tablet;
    }

    document.documentElement.style.setProperty('--flow-scroll-items-per-view', opt.itemsPerView);
    document.documentElement.style.setProperty('--flow-scroll-padding', opt.flowScrollPadding);

    const slideContainerWidth = this.$menu.getBoundingClientRect().width;
    document.documentElement.style.setProperty('--slide-container-width', `${slideContainerWidth}px`);

    // 최신 너비 다시 계산
    this.menuWidth = this.$menu.clientWidth;
    this.itemWidth = this.$items[0].clientWidth;
    this.wrapWidth = this.$items.length * this.itemWidth;
  },

  lerp(v0, v1, t) {
    return v0 * (1 - t) + v1 * t;
  },

  dispose(scroll) {
    gsap.set(this.$items, {
      x: i => i * this.itemWidth + scroll,
      modifiers: {
        x: (x) => {
          const s = gsap.utils.wrap(-this.itemWidth, this.wrapWidth - this.itemWidth, parseInt(x));
          return `${s}px`;
        }
      }
    });
  },

  disablePointerEvents() {
    this.$links.forEach(a => a.style.pointerEvents = 'none');
  },

  enablePointerEvents() {
    this.$links.forEach(a => a.style.pointerEvents = 'auto');
  },

  handleTouchStart(e) {
    this.dragStartX = e.clientX || e.touches[0].clientX;
    this.touchStart = this.dragStartX;
    this.isDragging = true;
    this.$menu.classList.add('is-dragging');
  },

  handleTouchMove(e) {
    if (!this.isDragging) return;
    const touchX = (e.clientX !== undefined) ? e.clientX : (e.touches && e.touches[0]?.clientX) || 0;
    this.scrollY += (touchX - this.touchStart) * 2.5;
    this.touchStart = touchX;
    this.disablePointerEvents();
  },

  handleTouchEnd(e) {
    this.dragEndX = e.clientX || (e.changedTouches && e.changedTouches[0]?.clientX) || 0;
    const distance = Math.abs(this.dragEndX - this.dragStartX);
    if (distance < 5) {
      // 클릭 처리 가능
      console.log("Click");
    } else {
      console.log("Drag");
    }
    this.isDragging = false;
    this.$menu.classList.remove('is-dragging');
    this.enablePointerEvents();
  },

  bindEvents() {
    window.addEventListener('resize', () => this.setOptionsByWidth());

    this.$menu.addEventListener('touchstart', e => this.handleTouchStart(e));
    this.$menu.addEventListener('touchmove', e => this.handleTouchMove(e));
    this.$menu.addEventListener('touchend', e => this.handleTouchEnd(e));
    this.$menu.addEventListener('mousedown', e => this.handleTouchStart(e));
    this.$menu.addEventListener('mousemove', e => this.handleTouchMove(e));
    this.$menu.addEventListener('mouseleave', e => this.handleTouchEnd(e));
    this.$menu.addEventListener('mouseup', e => this.handleTouchEnd(e));
    this.$menu.addEventListener('selectstart', e => e.preventDefault());

    this.$links.forEach(a => {
      a.addEventListener('click', e => {
        if (this.isDragging) e.preventDefault();
      });
    });
  },

  render() {
    requestAnimationFrame(() => this.render());
    this.scrollY -= 1; // 속도 조절
    this.y = this.lerp(this.y, this.scrollY, 0.1);
    this.dispose(this.y);
    this.scrollSpeed = this.y - this.oldScrollY;
    this.oldScrollY = this.y;
  }
};

export default app;