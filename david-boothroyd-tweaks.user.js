// ==UserScript==
// @name           David Boothroyd tweaks
// @namespace      sjorford@gmail.com
// @version        2021.08.31.1
// @author         Stuart Orford
// @match          https://www.localcouncils.co.uk/*
// @grant          none
// ==/UserScript==

(function($) {
$(function() {
	
	$(`<style>
		
	</style>`).appendTo('head');
	
	var list = $('h2:contains("Result") + ul');
	list.find('li').each((i,e) => {
		
		e.innerHTML = e.innerHTML.replace(/\b((?:[A-Z&]\S+ |and )+)((?:ward|division) )/, '<strong>$1</strong>$2');
		
		var dateMatch = e.innerText.match(/\d{1,2} [JFMASOND][a-z]+( \d{4})?/);
		if (dateMatch) {
			var date = dateMatch[0];
			var subhead = $('.sjo-subhead').filter((i,e) => e.innerText == date);
			if (subhead.length == 0) {
				subhead = $('<h3 class="sjo-subhead"></h3>').text(date).insertAfter(list).after('<ul></ul>');
			}
			subhead.next('ul').append(e);
		}
		
	});
	
});
})(jQuery.noConflict());
