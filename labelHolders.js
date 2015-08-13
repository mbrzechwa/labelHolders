(function($) {
/*
//	labelHolders.js jQuery Plugin version 1.8
//	Copyright 2015 Marek Brzechwa-White
//	Allows for proper semantic markup of labels for form inputs with the design trend of inline Labels/Placeholders for cleaner looking forms.
//	Does not interfere with actual Placeholder text when present.
*/

/*
		This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
	$.fn.labelHolders = function(options) {
		
		var defaults = {
			input: ':input:not(:checkbox, :radio, :button, :submit, :reset)',	// input types to apply logic to. DEFAULT all inputs except buttons, check boxes and radio buttons
			offset: {left: 0, top: 0},				// offset of label when input has value/placeholder
			active_class: 'label',						// css after animation for active state
			inactive_class: 'placeholder',		// css after animation for inactive state
			scale: 1,													// label scale difference
			speed: 150,												// speed of animation
			position: 'top-center',						// active label position (top-left, bottom-right, etc.)
			align: 'left',										// active label text-alignment
			hideOnBlur: false,								// hide label on blur when in active state
			hideOnFocus: false,								// why are you even using this plugin?? Oh yeah, proper semantic markup and it works in IE...
			disableDate: false								// disable labelHolders on date inputs?
		};
		
		var stored = $(this).data('labelHolders') || '';
		var conf = $.extend(defaults, options, stored);
		var filterDate = conf.disableDate ? ':not([type=date])' : '*';
		
		// Test if the Firefox Legend positioning bug is an issue
		var testForm = $('<form><fieldset><legend>testing</legend><input type="text"/></fieldset></form>');
		$('body').append(testForm);
		testForm.css({'position':'absolute','left':'-10000em','top':'0'});
		testForm.find('input').css({'top':0,'position':'absolute'});
		var legendAdjust = testForm.find('input').position().top > 0;
		testForm.remove();
		
		$(this).data('labelHolders',conf);
		
		function setState(form,input,state,speedOveride) {
			var label	= form.find('label[for='+input.attr('id')+']'),
			lineHeight = parseInt(input.css('line-height').replace('px',''),10) || Math.floor(parseInt(input.css('font-size').replace('px','')) * 1.5,10),
			lineHeight = lineHeight+'px',
			iheight		= parseInt(input.height(),10),
			iwidth		= parseInt(input.width(),10),
			osize			= parseInt(input.css('font-size'),10),
			nsize			= osize * conf.scale,
			lheight		= parseInt(label.height(),10),
			nheight		= lheight * conf.scale,
			lwidth		= parseInt(label.width(),10),
			nwidth		= (lwidth * conf.scale)+30,
			offset		= input.position(),
			margin		= {top: parseInt(input.css('marginTop'),10)||0, bottom: parseInt(input.css('marginBottom'),10)||0,left: parseInt(input.css('marginLeft'),10)||0,right: parseInt(input.css('marginRight'),10)||0},
			padding		= {top: parseInt(input.css('padding-top'),10)||0, bottom: parseInt(input.css('padding-bottom'),10)||0,left: parseInt(input.css('padding-left'),10)||0,right: parseInt(input.css('padding-right'),10)||0},
			border 		= {top: parseInt(input.css('border-top-width'),10)||0, bottom: parseInt(input.css('border-bottom-width'),10)||0, left: parseInt(input.css('border-left-width'),10)||0,right: parseInt(input.css('border-right-width'),10)||0},
			adjust		= legendAdjust && input.offsetParent().is('fieldset') && input.offsetParent().find('legend').length > 0 ? input.offsetParent().find('legend').outerHeight() : 0,
			start 		= {top: offset.top + padding.top + margin.top - adjust, left: offset.left + padding.left + margin.left},
			top				= conf.position.indexOf('top') != -1 ? start.top - nheight - conf.offset.top : conf.position.indexOf('bottom') != -1 ? start.top + padding.bottom + border.bottom + border.top + iheight + conf.offset.top - adjust : start.top + conf.offset.top,
			left 			= conf.position.indexOf('left') != -1 ? start.left - nwidth - conf.offset.left : conf.position.indexOf('right') != -1 ? start.left + border.right + border.left + padding.right + iwidth + conf.offset.left : conf.align == 'right' ? start.left + conf.offset.left + iwidth - lwidth : start.left + conf.offset.left,
			speed			= speedOveride ? 0 : conf.speed;
			
			label.css({'line-height':lineHeight});
			
			if (state == 'active') {
				label
					.css({'position':'absolute','text-align':conf.align,'display':'block'})
					.animate({'top':top,'left':left,'font-size':nsize,'line-height':lineHeight}, speed, function() {
						$(this)
							.addClass(conf.active_class)
							.removeClass(conf.inactive_class);
						input
							.addClass(conf.active_class)
							.removeClass(conf.inactive_class);
					});
			} else {
				label
					.css({position:'absolute','text-align':input.css('text-align'),display:'block'})
					.animate({'top':start.top,'left':start.left,'font-size':osize,'line-height':lineHeight}, speed, function() {
						$(this)
							.css('opacity',1)
							.removeClass(conf.active_class)
							.addClass(conf.inactive_class);
						
						input
							.removeClass(conf.active_class)
							.addClass(conf.inactive_class);
					});
			}
			
		}
		
		 function checkInputState($form,e,m) {
			$e = $form.find('#'+$(e).attr('for'));
			if (!$e.is('select') && $e.is(conf.input) && $e.is(filterDate) && !$e.is(':hidden')) {
				$(e).css({'position':'absolute'});
				if(!$e.is('[placeholder]') && $e.val().length == 0) {
					if(conf.hideOnFocus) {
						$(e).css('opacity',1);
					}
					setState($form,$e,'inactive',1);
				}
				else if($e.is('[placeholder]') || $e.val().length != 0) {
					if(conf.hideOnFocus || conf.hideOnBlur) {
						$(e).css('opacity',0);
					}
					setState($form,$e,'active',1);
				}
			}
			else if($e.is(conf.input) && $e.is('select') && !$e.is(':hidden')) {
				$(e).css({'position':'absolute'});
				if($e.find(':selected').val() == '' && $e.find(':selected').text() == '') {
					if(conf.hideOnFocus) {
						$(e).css('opacity',1);
					}
					setState($form,$e,'inactive',1);
				}
				else if($e.find(':selected').val() != '' || $e.find(':selected').text() != '') {
					if(conf.hideOnFocus || conf.hideOnBlur) {
						$(e).css('opacity',0);
					}
					setState($form,$e,'active',1);
				}
			}
		}
		
		return this.each(function() {
			$form = $(this);
			$form.find(conf.input).filter(filterDate)
				.focus(function() {
					if(!$(this).is('[placeholder]')) {
						if(conf.hideOnFocus) {
							$form.find('label[for='+$(this).attr('id')+']').animate({opacity:0},(conf.speed)/2);
						} else {
							setState($form,$(this),'active');
						}
					}
					if (conf.hideOnBlur) {
						$form.find('label[for='+$(this).attr('id')+']').animate({opacity:1},conf.speed);
					}
				})
				.blur(function() {
					if(!$(this).is('select')) {
						if($(this).val().length == 0 && !$(this).is('[placeholder]')) {
							if(conf.hideOnFocus) {
								$form.find('label[for='+$(this).attr('id')+']').animate({opacity:1},(conf.speed)/2);
							}
							setState($form,$(this),'inactive');
						} else if ($(this).val().length != 0 && conf.hideOnBlur) {
							$form.find('label[for='+$(this).attr('id')+']').animate({opacity:0},conf.speed);
						}
					} else {
						if($(this).find(':selected').val() == '' && $(this).find(':selected').text() == '') {
							if(conf.hideOnFocus) {
								$form.find('label[for='+$(this).attr('id')+']').animate({opacity:1},(conf.speed)/2);
							}
							setState($form,$(this),'inactive');
						} else if ($(this).find(':selected').val() != '' && conf.hideOnBlur) {
							$form.find('label[for='+$(this).attr('id')+']').animate({opacity:0},conf.speed);
						}
					}
				});
				
				
				$form.find('label')
					.click(function(e) {
						$e = $form.find('#'+$(this).attr('for'));
						if ($e.is(conf.input) && $e.is(filterDate)) {
							e.preventDefault();
							$form.find(conf.input).filter(function(){
								if ($(this).attr('id') == $(e.target).attr('for')) {return true} else {return false}
							})
							.focus();
						}
					})
					.each(function(){
						checkInputState($form,this,1);
					})
					
				var currentHeight = $(window).height();
				var currentWidth = $(window).width();
  
				$(window).resize(function(){
					var windowHeight = $(window).height();
					var windowWidth = $(window).width();
					
					// did the window really just resize? (I'm looking at your IE 8-)
					if (currentHeight == undefined || currentHeight != windowHeight || currentWidth == undefined || currentWidth != windowWidth) {
						$form.find('label')
						.each(function(){
							checkInputState($form,this,1);
						})
					}
					
					currentHeight = windowHeight;
					currentWidth = windowWidth;
				})
		});
		
	};
})(jQuery);