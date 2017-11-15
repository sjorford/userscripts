// ==UserScript==
// @name        Demo Club format posts list
// @namespace   sjorford@gmail.com
// @include     https://candidates.democracyclub.org.uk/posts
// @version     2017-11-15
// @grant       none
// @require     https://raw.githubusercontent.com/sjorford/userscripts/master/democracyclub/democlub-utils.js
// @require     https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// ==/UserScript==

$(`<style>
	.sjo-posts {table-layout: fixed;}
	.sjo-posts td:nth-of-type(1) {width: 1.5rem;}
	.sjo-posts td:nth-of-type(2) {width: 12rem;}
	.sjo-posts td:nth-of-type(3) {width: 20rem;}
	.sjo-posts td {padding: .25rem; vertical-align: top;}
	.sjo-post-incomplete {background-color: #fdd !important;}
	.sjo-post-complete {background-color: #ffb !important;}
	.sjo-post-verified {background-color: #bbf7bb !important;}
	.content h2 {border-bottom: 1px solid #aaa;}
	.sjo-posts-may {display: none;}
	.sjo-posts-may-button {font-size: 0.875rem; margin-left: 1rem;}
</style>`).appendTo('head');

$(function() {
	
	$('.content h3').each((index, element) => {
		
		var h3 = $(element);
		var mainTable;
		var numRows = 0;
		
		h3.nextUntil('h2, h3', 'ul').each((index, element) => {
			
			var list = $(element).hide();
			var items = list.find('li');
			numRows += items.length;
			
			var h4 = list.prev('h4');
			var a = h4.find('a');
			var table;
			if (a.length > 0 && items.length > 5) {
				a.text(a.text().replace(/ local election$/, ''));
				table = $('<table class="sjo-posts"></table>').insertAfter(h4);
			} else {
				table = mainTable || (mainTable = $('<table class="sjo-posts"></table>').insertAfter(h3));
				h4.hide();
			}
			
			var election = Utils.shortOrgName(h4.text().replace(/ local election$/, ''));
			var electionUrl = h4.find('a').attr('href');
			
			items.each((index, element) => {
				var listItem = $(element);
				
				var post = listItem.find('a').text();
				var postUrl = listItem.find('a').attr('href');
				var lock = listItem.find('abbr').text();
				
				$('<tr></tr>')
					.addCell(lock)
					.addCellHTML(`<a href="${electionUrl}">${election}</a>`)
					.addCellHTML(`<a href="${postUrl}">${post}</a>`)
					.addClass(
						lock == '\u{1f513}' ? 'sjo-post-complete' : 
						lock == '\u{1f512}' ? 'sjo-post-verified' : 
						'sjo-post-incomplete')
					.appendTo(table);
				
			});
		});
		
		h3.append(` (${numRows})`);
		
	});
	
	// Hide May elections
	var h2 = $('.content h2').filter((index, element) => element.innerText.trim() == '3rd May 2018');
	$(`<a class="sjo-posts-may-button">[Expand]</a>`).appendTo(h2).click(toggleMayElections);
	$(`<a class="sjo-posts-may-button">[Collapse]</a>`).appendTo(h2).click(toggleMayElections).hide();
	h2.nextUntil('h2').wrapAll('<div class="sjo-posts-may"></div>');
	
	function toggleMayElections() {
		$('.sjo-posts-may, .sjo-posts-may-button').toggle();
	}
	
});
