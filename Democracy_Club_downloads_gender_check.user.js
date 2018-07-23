// ==UserScript==
// @name           Democracy Club downloads - gender check
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @version        2018.07.23.0
// @match          https://candidates.democracyclub.org.uk/help/api
// @grant          none
// ==/UserScript==

console.log('checkGender');

var threshold = 0.5;

$(function() {
	
	// Run once main downloads script has loaded
	$('body').on('sjo-api-loaded', function() {
		
		// Create button
		$('<input type="button" id="sjo-api-button-gender" value="Check gender">').appendTo('#sjo-api-header').wrap('<div class="sjo-api-wrapper"></div>').click(checkGender);
		
	});
	
	
	
	function checkGender() {
		
		var tableData = $('#sjo-api-table').data('tableData');
		console.log('checkGender', tableData);
		
		var nameData = {};

		// TODO: create a new table, or rename this one
		var table = $('#sjo-api-table-dupes').empty().show();

		// Loop through data
		$.each(tableData, (index, candidacy) => {
			if (candidacy[0]._gender == 'm' || candidacy[0]._gender == 'f') {
				//console.log(index, candidacy[0]._gender, candidacy[0].name);
				
				// For each name part, store number of hits that are male/female
				$.each(candidacy[0]._name_parts, (i, name) => {
					if (isName(name)) {
						if (!nameData[name]) nameData[name] = {m: 0, f: 0};
						nameData[name][candidacy[0]._gender]++;
					}
				});
				
			}
		});
		
		// Compute "maleness" of each name
		$.each(nameData, (name, data) => {
			data.maleness = (data.m + 1) / (data.m + data.f + 2);
		});
		console.log(nameData);
		
		// Loop through data
		$.each(tableData, (index, candidacy) => {
			if (candidacy[0]._gender == 'm' || candidacy[0]._gender == 'f') {
				
				var prediction = 1;
				
				// Compute likely gender of each person based on first/middle names
				$.each(candidacy[0]._name_parts, (i, name) => {
					if (isName(name)) {
						prediction = prediction * (candidacy[0]._gender == 'm' ? 
							nameData[name].maleness : (1 - nameData[name].maleness));
					}
				});
				
				// If known gender does not match predicted gender, output to table
				if (prediction < threshold) {
					
					// Write to table
					console.log('HIT', index, candidacy[0].name, candidacy[0]._gender, prediction);

					var row = $(`<tr></tr>`)
						.addCellHTML('<a href="/person/' + candidacy[0].id + '">' + candidacy[0].name + '</a>')
						.addCell(candidacy[0].election_date)
						.addCell(candidacy[0]._election_area)
						.addCell(candidacy[0]._post_label)
						.addCell(candidacy[0].party_name)
						.addCell(candidacy[0].gender)
						.addCell((prediction.toFixed(2) * 100) + '%')
						.appendTo(table);

					
				}
				
			}
		});
		
	}
	
	function isName(name) {
		
		// things like these should be ignored:
		//     A
		//     B.
		//     of
		//     Capt.
		if (name == name.toLowerCase()) return false;
		if (name == name.toUpperCase()) return false;
		if (name.indexOf(-1) == '.') return false;
		return true;
		
	}
	
});
