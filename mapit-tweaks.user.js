// ==UserScript==
// @name         Mapit tweaks
// @namespace    sjorford@gmail.com
// @version      2021.05.22.0
// @author       Stuart Orford
// @match        https://mapit.mysociety.org/*
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

$(function() {
	
	var types = $('.area_list small').toArray().map(e => e.innerText.match(/\w+/)[0]);
	var types = [...new Set(types)];
	
	var query = new URLSearchParams(window.location.search);
	if (query.has('type')) {
		query.delete('type');
		$(`<a href="${window.location.pathname}${query.toString() ? '?' + query.toString() : ''}">view all children</a>`)
			.insertBefore('.area_list').wrap('<div></div>');
	} else {
		$.each(types, (i,type) => {
			query.set('type', type);
			$(`<a href="${window.location.pathname}?${query.toString()}">view ${type} only</a>`)
				.insertBefore('.area_list').wrap('<div></div>')
		});
	}
	
});
