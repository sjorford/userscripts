// ==UserScript==
// @name           Legislation.gov.uk tweaks
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @version        2018.10.29.1
// @match          http://www.legislation.gov.uk/*
// @match          file:///C:/Users/stuarto/Google%20Drive/Personal/Politics/ECOs/*
// @match          file:///C:/Users/Stuart/Google%20Drive/Personal/Politics/ECOs/*
// @grant          none
// ==/UserScript==

$(function() {
	
	// Repopulate search box
	var locationMatch = window.location.href.match(/\?title=([^&]+)/);
	if (locationMatch) {
		$('#title').val(decodeURIComponent(locationMatch[1]));
	}
	
	// Highlight ECOs
	$('<style>.sjo-electoral td {background-color: #ffc35bb3 !important;}</style>').appendTo('head');
	$('#content tr:contains("Elect")').addClass('sjo-electoral');
	
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
