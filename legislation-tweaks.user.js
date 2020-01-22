// ==UserScript==
// @name           Legislation.gov.uk tweaks
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @version        2020.01.22.0
// @match          http://www.legislation.gov.uk/*
// @match          file:///C:/Users/stuarto/Google%20Drive/Personal/Politics/ECOs/*
// @match          file:///C:/Users/Stuart/Google%20Drive/Personal/Politics/ECOs/*
// @grant          none
// ==/UserScript==

$(function() {
	
	// Repopulate search boxes
	var pageTitle = $('#pageTitle').text().trim();
	if (['Search Results', 'Page Not Found'].indexOf(pageTitle) >= 0) {
		
		var type, year, number, title;
		var pathParts = window.location.pathname.split('/');
		
		if (pathParts[1].match(/^\d{4}$/)) {
			year   = year   || pathParts[1];
			number = number || pathParts[2];
		} else if (pathParts[1] != 'search') {
			type   = type   || pathParts[1];
			year   = year   || pathParts[2];
			number = number || pathParts[3];
		}
		
		if (window.location.search) {
			var params = new URLSearchParams(window.location.search.substring(1));
			type   = type   || params.get('type');
			title  = title  || params.get('title');
			year   = year   || params.get('year');
			number = number || params.get('number');
		}
		
		$('#type').val(type);
		$('#title').val(title);
		$('#year').val(year);
		$('#number').val(number);
		
	}
	
	// Highlight ECOs
	$('<style>.sjo-electoral td {background-color: #ffc35bb3 !important;}</style>').appendTo('head');
	$('#content tr:contains("Elect")').addClass('sjo-electoral');
	
	// Direct SI links to whole instrument
	$('a[href*="/uksi/"]').attr('href', (i,href) => href.replace(/\/contents\//, '/'));
	
	// Format "tables"
	$('table .LegText').closest('tr').each((rowIndex, rowElement) => {
		
		var row = $(rowElement);
		var lastRow = row;
		var cells = row.find('.LegText').closest('td');
		cells.each((cellIndex, cellElement) => {
			
			var paras = $(cellElement).find('p');
			paras.each((paraIndex, paraElement) => {
				if (paraElement == null) return;
				
				var para = $(paraElement);
				var newCell = $('<td class="LegTD"></td>').html(para.html().trim());
				
				if (cellIndex == 0) {
					lastRow = $('<tr class="sjo-row"></tr>').insertAfter(lastRow);
					if (para.find('strong').length > 0) {
						newCell.attr('colspan', cells.length - cellIndex);
						lastRow.removeClass('sjo-row');
					}
					lastRow.append(newCell);
				} else {
					row.nextAll('.sjo-row').eq(paraIndex).append(newCell);
				}
				
			});
			
		});
		
		row.remove();
		
	});
	
	// Repeat district names on each row of county ECO
	var rows = $('.LegTHplain')
		.filter((index, element) => $(element).closest('tr').find('td, th')
			.filter((index, element) => $(element).text().trim() != '').length == 1)
		.add('.LegTD strong, .LegTH strong').closest('tr');
	rows.closest('table').css({maxWidth: '800px'}).find('colgroup').remove();
	rows.each((index, element) => {
		var row = $(element);
		var district = row.text().trim().replace(/^(In the )?(city|borough|district) of |^In | (City|Borough|District):?$/ig, '');
		var followingRows = row.parent().is('thead') ? 
			row.closest('table').find('tbody tr').first().nextUntil(rows, 'tr').andSelf() :
			row.nextUntil(rows, 'tr');										
		followingRows.each((index, element) => $('<td class="LegTDplain"></td>').text(district).prependTo(element));
		row.remove();
	});
	
});
