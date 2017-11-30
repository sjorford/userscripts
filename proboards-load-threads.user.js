// ==UserScript==
// @name        Proboards load threads
// @namespace   sjorford@gmail.com
// @include     http://vote-2012.proboards.com/thread/*
// @version     2017-11-30
// @grant       none
// ==/UserScript==

$(function() {
	
	var numPages = $('.ui-pagination-slot a[href*="page"]').last().text() - 0;
	if (numPages > 1) {
		
		var wrapper = $('div.content > table.list > tbody').empty();
		var thread_id =  window.location.href.match(/\/thread\/(\d+)\//)[1];
		var p;
		
		$('.ui-pagination-page').addClass('state-disabled').filter('.ui-pagination-slot').remove();
		var baseUrl = window.location.href.split('?')[0];
		
		for (p = 1; p <= numPages; p++) {
			$(`<li class="ui-pagination-page ui-pagination-slot sjo-pagination-${p}"><a href="${baseUrl}?page=${p}">${p}</a></li>`).insertBefore('.ui-pagination-next');
			$(`<tr class="sjo-placeholder-${p}"></tr>`).appendTo(wrapper);
		}
		
		for (p = 1; p <= numPages; p++) {
			$.post('http://vote-2012.proboards.com/post/list', {thread_id: thread_id, page: p}, handler);
		}
		
	}
	
	function handler(data) {
		$(`.sjo-placeholder-${data.page}`).after(data.results).remove();
		$(`.sjo-pagination-${data.page}`).addClass('state-selected');
		$('tr.post.last').removeClass('last').last().addClass('last');
	}
	
});
