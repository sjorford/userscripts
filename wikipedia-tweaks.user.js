// ==UserScript==
// @id             wikipedia-tweaks@wikipedia.org@sjorford@gmail.com
// @name           Wikipedia tweaks
// @version        2017-09-03
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @include        https://en.wikipedia.org/*
// @run-at         document-end
// @grant          none
// ==/UserScript==

$(function() {
	
	// Hide long references lists
	$('.reflist').each((index, reflist) => {
		console.log('reflist', reflist);
		if ($('li', reflist).length > 20) {
			$(reflist).hide();
			var className = `sjo-reflist-button-${index}`;
			$(`<a class="${className}">[Expand]</a>`).insertBefore(reflist).click(toggleReflist);
			$(`<a class="${className}">[Collapse]</a>`).insertBefore(reflist).click(toggleReflist).hide();
			function toggleReflist() {
				$(reflist).toggle();
				$(`.${className}`).toggle();
			}
		}
	})
	
});
