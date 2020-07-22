// ==UserScript==
// @name         Facebook tweaks
// @namespace    sjorford@gmail.com
// @version      2020.07.22.0
// @author       Stuart Orford
// @match        https://www.facebook.com/*
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// @require      https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// @runat        document-idle
// ==/UserScript==

(function($) {
$(function() {
	
	var attempts = 0;
	var clockWrapper, clockArrow;
	setTimeout(bindArrow, 1000);
	
	function bindArrow() {
		
		$('.sp_j7APfxGlwB9.sx_345883').parents().each((i,e) => {
			clockWrapper = $(e);
			clockArrow = clockWrapper.find('.sp_j7APfxGlwB9.sx_a6d3db');
			if (clockArrow.length > 0) {
				console.log('bindArrow', clockArrow);
				clockArrow.click(event => setTimeout(parseTimes, 1000));
				return false;
			}
		});

		if (clockArrow && clockArrow.length > 0) return;

		attempts++;
		if (attempts > 20) return;
		
		setTimeout(bindArrow, 1000);
		
	}
	
	function parseTimes() {
		
		var dayNames = [
			'Monday',
			'Tuesday',
			'Wednesday',
			'Thursday',
			'Friday',
			'Saturday',
			'Sunday',
		];
		
		var spans = $('span').not(clockWrapper.find('span')).not(':has(*)').filter((i,e) => e.innerText.match(/^\d\d:\d\d - \d\d:\d\d|CLOSED$/));
		var wrapper = spans.eq(0).parents().filter((i,e) => $(e).has(spans.eq(1)).length > 0).first();
		var text = wrapper.text();
		var times = [];
		
		$.each(dayNames, (i,day) => {
			times.push({
				day: day.substr(0,2),
				times: text.match(day + ':(..:.. - ..:..|CLOSED)')[1].replace(/ - /, '-').replace('CLOSED', 'off'),
			});
		});
		
		for (var i = 5; i >= 0; i--) {
			if (times[i].times == times[i+1].times) {
				times[i].day = times[i].day + '-' + times[i+1].day.substr(-2);
				times.splice(i+1, 1);
			}
		}
		
		var timeString = times.map(v => v.day + ' ' + v.times).join('; ')
		
		$('<div></div>').appendTo(wrapper).text(timeString);
		
	}
	
});
})(jQuery.noConflict());
