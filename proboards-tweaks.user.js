// ==UserScript==
// @name        Proboards tweaks
// @namespace   sjorford@gmail.com
// @include     http://vote-2012.proboards.com/*
// @version     2019.08.02.0
// @grant       none
// ==/UserScript==

$(function() {
	
	$(`<style>
		
		div.ui-form-error           + style         + div[id$="-banner"],
		div.ui-form-error           + style + style + div[id$="-banner"],
		div.ui-form-error     + img + style         + div[id$="-banner"],
		div.ui-form-error     + img + style + style + div[id$="-banner"],
		iframe#rufous-sandbox       + style         + div[id$="-banner"],
		iframe#rufous-sandbox       + style + style + div[id$="-banner"],
		iframe#rufous-sandbox + img + style         + div[id$="-banner"],
		iframe#rufous-sandbox + img + style + style + div[id$="-banner"],
		div.ui-dialog.ui-widget.ui-widget-content + img + style + div[id$="-overlay"],
		div.ui-dialog.ui-widget.ui-widget-content + img + style + div[id$="-banner"],
		div#support-message,
		div.c-pb-plus__container
			{display: none !important;}
		
		tr.bookmarked.new {background-color: #ffd700b3 !important;}
		tr.new            {background-color: #ffd70066 !important;}
		
		.message br {margin-bottom: 0.5em;}
		
		.sjo-faves-wrapper {margin-bottom: 0.5em;}
		.sjo-fave {display: inline-block; border: 1px solid black; border-radius: 5px; padding: 0 4px; margin: 0 0.25em 0.25em 0;}
		.sjo-faves-wrapper label, .sjo-fave a {font: 0.8em Calibri;}
		.sjo-fave a:hover {color: black; text-decoration: none;}
		.sjo-fave.new_span {background-color: gold;}

		.post .content article h3.title {display: none;}
		
	</style>`).appendTo('head');
	
	/*
	var favBoards = [108, 109, 110, 111, 112];
	
	var wrapper = $('<div class="sjo-faves-wrapper"><label>2019:</label> </div>').insertAfter('#navigation-tree');
	
	$.each(favBoards, (i, boardNumber) => {
		var li = $('#nav-tree-menu-0 li').filter((i, e) => e.className.split(' ').indexOf('nav-tree-board-' + boardNumber) >= 0);
		var anchor = li.find('a');
		var href = anchor.attr('href');
		var linkText = anchor.find('.item-text').text().replace(/ 2019$/, '');
		$(`<span class="sjo-fave"><a href="${href}">${linkText}</a></span>`).addClass(li.hasClass('new_span') ? 'new_span' : '').appendTo(wrapper);
	});
	*/
	
});
