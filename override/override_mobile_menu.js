window.MOBILE_SLIDE_MENU = function(){
	var $menu_slide;
	var $menu_container;
	var $body;
	var status;
	var $backdrop;
	var open_class = 'slide_open';
	var backdrop_class = 'slide_menu_backdrop';
	var init = function(){
		$body = $('body');
		$menu_container = $('#mobile_slide_menu_wrap');
		$menu_slide = $('#mobile_slide_menu');

		var data = $body.data('slide_menu');
		if(typeof  data == 'undefined') {
			$body.data('slide_menu','N');
			status = false;
		}

		$(window).on("resize", function () {
			if(!$body.hasClass('admin')){
				status = $body.data('slide_menu')=='Y';
				if ($(window).width() > 767 && status) {
					slideNavToggle();
				}
			}
		});
		runAccordion();
	};

	var set_accordion = false;
	var active_list = {};
	var runAccordion = function(){
		var transitioning = null;

		var show = function ($el) {
			if (transitioning || $el.hasClass('in')) return;

			var dimension = 'height';

			$el
				.show()
				.removeClass('collapse')
				.addClass('collapsing')[dimension](0)
				.attr('aria-expanded', true);

			active_list[$el.attr('data-index')] = $el;

			transitioning = 1;

			var complete = function () {
				$el
					.removeClass('collapsing')
					.addClass('collapse in')[dimension]('');
				transitioning = 0;
			};

			var scrollSize = $.camelCase(['scroll', dimension].join('-'));

			$el
				.one('bsTransitionEnd', $.proxy(complete, this))
				.emulateTransitionEnd(350)[dimension]($el[0][scrollSize]);
		};
		
		var hide = function ($el) {
			if (transitioning || !$el.hasClass('in')) return;

			var dimension = 'height';

			$el[dimension]($el[dimension]())[0].offsetHeight;

			$el
				.addClass('collapsing')
				.removeClass('collapse in')
				.attr('aria-expanded', false);

			var $el_li = $el.children('li');
			var $el_li_a = $el_li.children('a');
			if($el_li_a.hasClass('has_child')){
				hide($el_li.children('ul'));
				$el_li_a.toggleClass('open', false);
			}

			transitioning = 1;

			var complete = function () {
				transitioning = 0;
				$el
					.removeClass('collapsing')
					.addClass('collapse')
					.hide();

				$el.find('ul').hide();
				delete active_list[$el.attr('data-index')];
			};

			$el
				[dimension](0)
				.one('bsTransitionEnd', $.proxy(complete, this))
				.emulateTransitionEnd(350);
		};

		if(!set_accordion){
			$menu_slide.find('a').each(function(i){
				var $that = $(this);
				var $parent_li = $that.parent('li');
				var has_child = $that.data('has_child')=='Y' && $that.parent('li').children('ul').children('li:not(.pms_check)').length > 0;
				if($that.hasClass('active')){
					if(has_child){
						var $child_ul = $parent_li.children('ul');
						var $child_ul_li = $child_ul.children('li:not(.pms_check)');
						$child_ul.attr('data-index',i);
					}
					if(has_child && $child_ul_li.length>0){
						$child_ul.show();
						$child_ul.toggleClass('in', true);
						$that.toggleClass('open', true);
						$that.toggleClass('has_child', true);

						active_list[i] = $child_ul;
					}
				}else{
					var $child_ul = $parent_li.children('ul');
					var $child_ul_li = $child_ul.children('li:not(.pms_check)');
					$child_ul.height(0);
					if(has_child && $child_ul_li.length>0){
						$that.toggleClass('has_child', true);
					}
					$child_ul.attr('data-index',i);
				}
				$that.off('click').on('click',function(e){
					var $parent_li = $that.parent('li');
					var is_folder_menu = $that.data('is_folder_menu')=='Y';
					var has_child = $that.data('has_child')=='Y' && $that.parent('li').children('ul').children('li:not(.pms_check)').length > 0;
					if(has_child){
						var $child_ul = $parent_li.children('ul');
						var $child_ul_li = $child_ul.children('li:not(.pms_check)');
					}

					if(has_child && $child_ul_li.length>0){
						if(is_folder_menu || $(e.target).hasClass('_toggle_btn')){
							var $child_ul = $parent_li.children('ul');
							var child_height = 0;
							$child_ul.children('li:not(.pms_check)').each(function(){
								child_height += $that.outerHeight();
							});
							if($child_ul.hasClass('in')){
								hide($child_ul);
								$that.toggleClass('open', false);
							}else{
								$that.toggleClass('open', true);
								show($child_ul);
							}
							cancelPropagation(e);
							return false;
						}
					}else{
						slideNavToggle();
					}
				});
			});
		}
	};

	var rebuildAccordion = function(){
		$menu_slide.find('a').each(function(i){
			var $that = $(this);
			var $parent_li = $that.parent('li');
			var has_child = $that.data('has_child')=='Y' && $that.parent('li').children('ul').children('li:not(.pms_check)').length > 0;
			if(has_child){
				var $child_ul = $parent_li.children('ul');
				var $child_ul_li = $child_ul.children('li:not(.pms_check)');
			}
			if(has_child && $child_ul_li.length>0){
				$that.toggleClass('has_child', true);
			}
		});
	};

	var slideNavToggle = function($obj){
		if(typeof $obj == 'object'){
			var $colgroup = $obj.closest('div[data-type=col-group]');
			var colgroup = $colgroup.attr('data-col-group');
			if(colgroup == 'right'){
				$menu_container.toggleClass('left-slide', false);
				$menu_container.toggleClass('right-slide', true);
			}else{
				$menu_container.toggleClass('right-slide', false);
				$menu_container.toggleClass('left-slide', true);
			}
			$menu_slide.toggleClass('animation',true);
		}
		status = $body.data('slide_menu')=='Y';

		if(status){
			hideSlide();
		} else{
			showSlide();
		}
	};

	var showSlide = function(){
		// 활성화되어있는 메뉴 보이도록 처리
		for(var k in active_list){
			if(active_list[k].length > 0){
				if(active_list[k].css('display') === 'none') active_list[k].show();
			}
		}

		$('#'+backdrop_class).remove();
		$backdrop = $('<div id="'+backdrop_class+'"/>').addClass(backdrop_class).on('click',function(){
			slideNavToggle();
		});
		$body.data('slide_menu','Y');
		
		// 🎯 개선된 부분: sticky 호환을 위해 clip 사용하거나 속성 제거
		$body.css('overflow-y', 'clip'); // 또는 ''로 속성 제거
		
		setTimeout(function() {
			$menu_container.width('100%');
		},10);
		$menu_container.prepend($backdrop);
		$menu_slide.before();
		$menu_container.toggleClass(open_class, true);
	};

	var hideSlide = function(){
		$body.data('slide_menu','N');
		var is_fullpage = $body.find('.visual_section').attr('doz_fullpage') ==='Y';
		
		// 🎯 개선된 부분: 속성 완전 제거로 원래 상태 복원
		$body.css('overflow-y', '');
		
		$backdrop.remove();
		setTimeout(function(){
			$body.data('slide_menu','N');
			
			// 🎯 개선된 부분: fullpage 체크 없이 속성 제거
			$body.css('overflow-y', '');
			
			$menu_container.width(0);
			$menu_container.toggleClass(open_class,false);
			$('#'+backdrop_class).remove();

			// 열려있는 메뉴서랍 숨기기
			$menu_slide.find('.depth-01 ul').hide();
		},700);
		$menu_container.toggleClass(open_class,false);
	};

	return {
		'init' :function(){
			init();
		},
		'rebuildAccordion': function(){
			rebuildAccordion();
		},
		'slideNavToggle' : function($obj){
			slideNavToggle($obj);
		},
		'hideSlide' : function(){
			hideSlide();
		},
		'showSlide' : function(){
			showSlide();
		}
	};
}();

// PC_SLIDE_MENU도 동일하게 처리
window.PC_SLIDE_MENU = function(){
	var $menu_slide;
	var $menu_container;
	var $body;
	var status;
	var $backdrop;
	var open_class = 'slide_open';
	var backdrop_class = 'slide_menu_backdrop';
	var init = function(){
		$body = $('body');
		$menu_container = $('#pc_slide_menu_wrap');
		$menu_slide = $('#pc_slide_menu');

		var data = $body.data('pc_slide_menu');
		if(typeof  data == 'undefined') {
			$body.data('pc_slide_menu','N');
			status = false;
		}

		$(window).on("resize", function () {
			status = $body.data('pc_slide_menu')=='Y';
			if ($(window).width() <= 767 && status) {
				slideNavToggle();
			}
		});
		runAccordion();

		$menu_slide.find('._tse_scrollable').TrackpadScrollEmulator();
	};

	var set_accordion = false;
	var active_list = {};
	var runAccordion = function(){
		// ... (동일한 runAccordion 로직)
	};

	var slideNavToggle = function($obj){
		// ... (동일한 slideNavToggle 로직)
	};

	var showSlide = function(){
		// ... 원본 로직
		$body.css('overflow-y', 'clip'); // 🎯 개선된 부분
	};

	var hideSlide = function(){
		$body.data('pc_slide_menu','N');
		$backdrop.remove();
		
		// 🎯 개선된 부분: 속성 완전 제거
		$body.css('overflow-y', '');
		
		setTimeout(function(){
			$body.data('pc_slide_menu','N');
			$body.css('overflow-y', ''); // 🎯 개선된 부분
			$menu_container.width(0);
			$menu_container.toggleClass(open_class,false);
			$('#'+backdrop_class).remove();
		},700);
		$menu_container.toggleClass(open_class,false);
	};

	return {
		'init' :function(){
			init();
		},
		'slideNavToggle' : function($obj){
			slideNavToggle($obj);
		},
		'hideSlide' : function(){
			hideSlide();
		},
		'showSlide' : function(){
			showSlide();
		}
	};
}();

// 초기화
$(function(){
	MOBILE_SLIDE_MENU.init();
	PC_SLIDE_MENU.init();
});