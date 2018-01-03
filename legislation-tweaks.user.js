// ==UserScript==
// @name           Legislation.gov.uk tweaks
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @version        2018-01-03c
// @match          http://www.legislation.gov.uk/all?*
// @match          file:///C:/Users/stuarto/Google%20Drive/Personal/Politics/ECOs/*
// @match          file:///C:/Users/Stuart/Google%20Drive/Personal/Politics/ECOs/*
// @grant          none
// ==/UserScript==

$(function() {
	
	// Highlight ECOs
	$('<style>.sjo-electoral td {background-color: #ffc35bb3 !important;}</style>').appendTo('head');
	$('#content tr:contains("Elect")').addClass('sjo-electoral');
	
	// Format "tables"
	$('table .LegText').closest('tr').each((rowIndex, rowElement) => {
		
		var row = $(rowElement);
		var lastRow = row;
		var cells = row.find('.LegText').closest('td');
		cells.each((cellIndex, cellElement) => {
			
			$(cellElement).find('p').each((paraIndex, paraElement) => {
				if (paraElement == null) return;
				
				var para = $(paraElement);
				var newCell = $('<td class="LegTD"></td>').html(para.html());
				
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
	rows.each((index, element) => {
		var row = $(element);
		var district = row.text().trim().replace(/^(In the )?(city|borough|district) of |^In | (City|Borough|District):?$/ig, '');
		var followingRows = row.parent().is('thead') ? 
			row.closest('table').find('tbody tr').first().nextUntil(rows, 'tr').andSelf() :
			row.nextUntil(rows, 'tr');										
		followingRows.each((index, element) => $('<td class="LegTDplain"></td>').text(district).prependTo(element));
		row.remove();
	});
	$('col[width="100%"]').remove();
	
});
