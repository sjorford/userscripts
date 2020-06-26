// ==UserScript==
// @name         Netflix tweaks
// @namespace    sjorford@gmail.com
// @version      2020.06.26.0
// @author       Stuart Orford
// @match        https://www.netflix.com/watch/*
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.27.0/moment.min.js
// ==/UserScript==

$(function() {
	
	var totalBox, remainingBox, elapsedBox;
	var totalMs = 0, remainingMs = 0, elapsedMs = 0;
	
	function updateTime() {
		
		if (totalMs <= 0) {
			totalBox = $('.scrubber-head');
			if (totalBox.length > 0) {
				totalMs = moment.duration(totalBox.attr('aria-valuetext').split(' ')[2]).asMilliseconds();
			}
		}
		
		if (totalMs > 0) {
			
			if (!elapsedBox) {
				remainingBox = $('.time-remaining__time');
				elapsedBox = $('<time style="font-size: 1.8em;"></time>').insertBefore(remainingBox.hide());
			}
			
			remainingMs = moment.duration(remainingBox.text()).asMilliseconds();
			elapsedMs = totalMs - remainingMs;
			elapsedBox.text(moment.utc(elapsedMs).format("H:mm:ss"));
		}
		
	}
	
	window.setInterval(updateTime, 200);
	
});
