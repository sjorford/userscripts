// ==UserScript==
// @name        Demo Club statistics
// @namespace   sjorford@gmail.com
// @include     https://candidates.democracyclub.org.uk/numbers/
// @version     2017-11-15
// @grant       none
// @require     https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.min.js
// @require     https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// ==/UserScript==

$(function() {
	
	$(`<style>
		.sjo-stats {font-size: 9pt;}
		.sjo-stats tr {background-color: inherit !important;}
		.sjo-stats td, .sjo-stats th, .sjo-lesspadding td, .sjo-lesspadding th {padding: 4px;}
		.sjo-stats-break {border-top: solid 1px #ddd;}
	</style>`).appendTo('head');
	
	var futureTable = $('<table class="sjo-stats sjo-stats-future"></table>');
	var cutoff = moment().add(30, 'days');
	
	$('.statistics-elections').each(function(index, element) {
		var wrapper = $(element);
		
		var table = $('<table class="sjo-stats"></table>')
			.insertAfter(wrapper.find('h2'));
		
		if (wrapper.hasClass('current')) {
			futureTable.insertAfter(wrapper).before('<h2>Future Elections</h2>');
		}
		
		var lastDate = null;
		
		$('div', wrapper).each(function(index, element) {
			
			var div = $(element);
			
			var id = div.attr('id');
			id = id == 'statistics-election-2010' ? 'statistics-election-parl-2010-05-06' : id == 'statistics-election-2015' ? 'statistics-election-parl-2015-05-07' : id;
			
			var matchId = id.match(/^statistics-election-((parl|sp|naw|nia|gla|mayor|pcc|local)(-(a|r|c))?(-([-a-z]{2,}))?)-(\d{4}-\d{2}-\d{2})$/);
			console.log(id, matchId);
			
			var headerText = div.find('h4').text();
			var matchHeader = headerText.match(/^Statistics for the (\d{4} )?(.+?)( (local|Mayoral))?( [Ee]lection|by-election: (.*) (ward|constituency))?( \((.+)\))?$/, '');
			
			if (matchId && matchHeader) {
				
				var key = matchId[2] + (matchId[3] ? '.' + matchId[4] : '') + (matchId[5] ? '.' + matchId[6] : '');
				var type = matchId[2];
				var date = matchId[7];
				var area = matchHeader[2] + (matchHeader[8] ? matchHeader[8] : '');
				
				var bullets = div.find('li');
				
				var row = $('<tr></tr>')
					.addCell(date)
					.addCell(key)
					.addCell(area);
				
				if (date != lastDate) {
					row.addClass('sjo-stats-break');
					lastDate = date;
				}
				
				bullets.each(function(index, element) {
					var bullet = $(element);
					var link = bullet.find('a');
					if (link.length > 0) {
						link.html(link.html()
							.replace(/^Candidates per /, 'by ')
							.replace(/^See progress towards locking all posts$/, 'progress'));
						$('<td class="sjo-nowrap"></td>').append(link).appendTo(row);
						bullet.addClass('sjo-remove');
					} else if (bullet.text().indexOf(':') >= 0) {
						row.addCell(bullet.text().split(':')[1].trim(), 'sjo-number');
						bullet.addClass('sjo-remove');
					}
				});
				
				if (moment(date).isAfter(cutoff)) {
					row.appendTo(futureTable);
				} else {
					row.appendTo(table);
				}
				
				$('.sjo-remove').remove();
				if (div.find('li').length === 0) {
					div.remove();
				}
				
			}
			
		});
		
		$('h3, h4', wrapper).filter((index, element) => {
			var heading = $(element);
			return heading.next().length == 0 || heading.next('h3, h4').length > 0;
		}).hide();
		
	});
	
	$('body').on('click', '.sjo-stats', event => {
		if (event.target.tagName != 'A') {
			$(event.target).closest('.sjo-stats').selectRange();
		}
	});
	
});
