// ==UserScript==
// @name        Demo Club format posts list
// @namespace   sjorford@gmail.com
// @include     https://candidates.democracyclub.org.uk/posts
// @version     1
// @grant       none
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
</style>`).appendTo('head');

$(function() {
	
	$('.content h3').each((index, element) => {
		var heading = $(element);
		
		var mainTable = $('<table class="sjo-posts"></table>').insertAfter(heading);
		
		heading.nextUntil('h2, h3', 'ul').each((index, element) => {
			
			var list = $(element).hide();
			var items = list.find('li');
			
			var subHeading = list.prev('h4');
			if (items.length > 5) {
				var table = $('<table class="sjo-posts"></table>').insertAfter(subHeading);
			} else {
				var table = mainTable;
				subHeading.hide();
			}
			
			var election = subHeading.text().replace(/ local election$/, '');
			var electionUrl = subHeading.find('a').attr('href');
			
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
		
		heading.append(` (${mainTable.find('tr').length})`);
		
	});
	
});
