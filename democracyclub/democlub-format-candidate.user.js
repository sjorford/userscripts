// ==UserScript==
// @name        Demo Club format candidate
// @namespace   sjorford@gmail.com
// @include     https://candidates.democracyclub.org.uk/person/*
// @version     2017-12-12
// @grant       none
// @require     https://raw.githubusercontent.com/sjorford/userscripts/master/democracyclub/democlub-utils.js
// ==/UserScript==

$(function() {
	
	$(`<style>
		
		table.sjo-tree tr {background-color: inherit;}
		.sjo-tree td, .sjo-tree th {font-size: 8pt; padding: 2px; min-width: 20px;}
		#sjo-versions-showall {display: block; font-size: 8pt; margin-bottom: 1em;}
		.sjo-tree-current {background-color: gold;}
		
		.sjo-tree thead {background-color: inherit;}
		.sjo-tree-year-inner {background: white;}
		.sjo-tree-year {text-align: center; background: left center repeat-x url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAMSURBVBhXY2BgYAAAAAQAAVzN/2kAAAAASUVORK5CYII=');}
		
		.sjo-tree-horiz {background: repeat-x url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAASdEVYdFNvZnR3YXJlAEdyZWVuc2hvdF5VCAUAAAAsSURBVDhPY/wPBAxUBExQmmpg1EDKweA3kBGIR9MhZWA0L1MORg2kFDAwAAB9tQkdVRptbgAAAABJRU5ErkJggg==');}
		.sjo-tree-turnup {background: no-repeat url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAASdEVYdFNvZnR3YXJlAEdyZWVuc2hvdF5VCAUAAABOSURBVDhPY/wPBAx4ACMjI5QFAQSUMzBBaaqBUQMpB/Q1ED3JEANAOvAnLDQwuNMhIdeBANEGEmMYCBDMy6SCgQ1DYsCogZQDKhvIwAAApcUVF6f1O7gAAAAASUVORK5CYII=');}
		.sjo-tree-vert {background: repeat-y url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAASdEVYdFNvZnR3YXJlAEdyZWVuc2hvdF5VCAUAAAAySURBVDhPY/wPBAx4ACMjI5QFAQSUMzBBaaqBUQMpB6MGUg5GDaQcjBpIORjsBjIwAAAaYgckACvF4gAAAABJRU5ErkJggg==');}
		.sjo-tree-mergein {background: no-repeat  url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAoCAYAAAD+MdrbAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAASdEVYdFNvZnR3YXJlAEdyZWVuc2hvdF5VCAUAAABOSURBVEhLY/wPBAxUBExQmmpg1EDKweA3kBGIR9MhZYBgXmZkBAUzKsCnhWQXEipLRmCkjBpIORg1kHIwaiDlYNRAysGogZSDEWcgAwMAmLEPQjc8JtAAAAAASUVORK5CYII=');}
		
		.sjo-version {border: none !important;}
		.sjo-version tr {background: transparent !important; border-top: 1px solid white; vertical-align: top;}
		.sjo-version tr.sjo-version-row-biography {border: none; min-height: 1em; height: 1em;}
		.sjo-version th {width: 32%; padding: 0.25em 0.5em 0.25em 0; font-weight: normal;}
		.sjo-version td {width: 32%; padding: 0.25em 0.5em;}
		.sjo-version td.sjo-version-op {width: 2%;}
		.sjo-version-delete {background-color: #fdd;}
		.sjo-version-add {background-color: #dfd;}
		.sjo-version-add.sjo-version-op {border-left: 1px solid white;}
		.sjo-version-delete del {text-decoration: none; background-color: gold;}
		.sjo-version-delete ins {display: none;} 
		.sjo-version-add ins {text-decoration: none; background-color: gold;}
		.sjo-version-add del {display: none;}
		
	</style>`).appendTo('head');
	
	var labelMappings = {
		'Statement to voters':							'Statement',
		'Twitter username (e.g. democlub)': 			'Twitter',
		'Facebook profile URL': 						'FB profile',
		'Facebook page (e.g. for their campaign)': 		'FB page',
		'Homepage URL': 								'Homepage',
		'Wikipedia URL': 								'Wikipedia',
		'LinkedIn URL': 								'LinkedIn',
		"The party's candidate page for this person": 	'Party page',
		"Favourite biscuit \u{1F36A}": 					'Biscuit \u{1F36A}',
	};
	
	$('dl').each(function(index, listElement) {
		
		var dl = $(listElement);
		var headingText = dl.prev('h2').text();
		var section = dl.parent('div');
		
		$('dt', listElement).each(function(index, termElement) {
			
			var dt = $(termElement);
			var dd = dt.next('dd');
			var dtText = dt.text();
			
			// Candidate details
			if (section.hasClass('person__details')) {
				
				// Format fields
				if (headingText != 'Candidacies:') {
					dt.addClass('sjo-list-dt');
					dd.addClass('sjo-list-dd');
					dd.nextUntil('dt', 'dd').addClass('sjo-list-dd');
					if (dd.text().trim() == 'Unknown') dd.text('');
				}
				
				// Trim labels
				if (labelMappings[dt.text()]) dt.text(labelMappings[dt.text()]);
				
				// Remove duplicate votes
				var result = {'votes': null, 'elected': null};
				$('.vote-count', dd).each((index, element) => {
					var votesSpan = $(element);
					votesSpan.next('br').hide();
					var electedSpan = votesSpan.prev('.candidate-result-confirmed');
					if (votesSpan.text() == result.votes && electedSpan.text() == result.elected) {
						votesSpan.hide();
						electedSpan.hide().prev('br').hide();
					} else {
						result.votes = votesSpan.text();
						result.elected = electedSpan.text();
					}
				});
				
			}
			
			// Previous versions
			if (section.hasClass('version')) {
				if (dtText.indexOf('Changes made') === 0) {
					
					// Format diff
					formatVersionChanges(dd);
					//dd.hide();
					
				} else {
					
					// Format version header
					dt.addClass('sjo-list-dt');
					dd.addClass('sjo-list-dd');
					if (dtText == 'Source') {
						dd.html(Utils.formatLinks(dd.html()));
					}
					
					// Hide reversion button to prevent accidental clicking
					if (dtText == 'Revert to this') {
						dt.hide();
						dd.hide();
					}
					
				}
			}
			
		});
		
	});
	
	// Format changes as a table
	function formatVersionChanges(dd) {
		console.log('formatVersionChanges', dd);
		
		// Create table for version changes
		var versionTable = $('<table class="sjo-version"></table>').prependTo(dd);
		
		// Reformat version changes as a table
		// TODO: sort fields into input order
		// TODO: indicate recent versions
		var diffsPara = dd.find('.version-diff');
		diffsPara.find('span').each(function(index, element) {
			
			var span = $(element);
			var spanText = span.text().replace(/\n|\r/g, ' ');
			var oldText = '', newText = '';
			var fieldName = null;
			
			// Data added
			if (span.hasClass('version-op-add')) {
				var matchAdd = spanText.match(/^Added: (.+) => ["\[\{]([\s\S]*)["\]\}]$/);
				if (matchAdd) [, fieldName, newText] = matchAdd;
				
			// Data replaced
			} else if (span.hasClass('version-op-replace')) {
				var matchReplace = spanText.match(/^At (.+) replaced ["\[\{](.*)["\]\}] with ["\[\{](.*)["\]\}]$/);
				if (matchReplace) [, fieldName, oldText, newText] = matchReplace;
				
			// Data removed
			} else if (span.hasClass('version-op-remove')) {
				var matchDelete = spanText.match(/^Removed: (.+) \(previously it was ["\[\{](.*)["\]\}]\)$/); // TODO: null
				if (matchDelete) [, fieldName, oldText] = matchDelete;
				
			}
			
			// Add to table
			if (fieldName) addChangeRow(fieldName, oldText, newText, span);
			
		});
		
		// TODO: apply widths using colgroups
		function addChangeRow(fieldName, dataFrom, dataTo, original) {
			
			if (dataFrom.length > 0 || dataTo.length > 0) {
				
				// Add a row to the diff table
				var row = $(`<tr class="sjo-version-row-${fieldName}"></tr>`).addHeader(fieldName.replace(/\//g, ' \u203A ')).appendTo(versionTable);
				
				// Cleanup quotes and newlines
				dataFrom = cleanHTML(dataFrom);
				dataTo = cleanHTML(dataTo);
				
				if (fieldName == 'biography' && dataFrom && dataTo) {
					
					// Add highlighted diffs for biographies
					// TODO: do the line splitting in the diffString function?
					var diffMarkup = diffString(dataFrom, dataTo);
					var diffParas = diffMarkup
							.replace(/<del>[\s\S]*?\r\n[\s\S]*?<\/del>/g, function(match) {return match.replace(/\r\n/g, '</del>\r\n<del>');})
							.replace(/<ins>[\s\S]*?\r\n[\s\S]*?<\/ins>/g, function(match) {return match.replace(/\r\n/g, '</ins>\r\n<ins>');})
							.split('\r\n');
					
					// Add first row
					row.addCell('-', 'sjo-version-delete sjo-version-op')
					   .addCellHTML(diffParas[0], 'sjo-version-delete')
					   .addCell('+', 'sjo-version-add sjo-version-op')
					   .addCellHTML(diffParas[0], 'sjo-version-add');
					row.find('th, .sjo-version-op').attr('rowspan', diffParas.length);
					
					// Add additional rows
					$.each(diffParas, (index, element) => {
						if (index === 0) return;
						$(`<tr class="sjo-version-row-${fieldName}"></tr>`)
						   .addCellHTML(diffParas[index], 'sjo-version-delete')
						   .addCellHTML(diffParas[index], 'sjo-version-add')
						   .appendTo(versionTable);
					});
					
				} else {
					
					// Deleted value
					if (dataFrom.length > 0) {
						row.addCell('-', 'sjo-version-delete sjo-version-op')
						   .addCellHTML(cleanBreaks(dataFrom), 'sjo-version-delete');
					} else {
						row.addCell('', 'sjo-version-op').addCell('');
					}
					
					// New value
					if (dataTo.length > 0) {
						row.addCell('+', 'sjo-version-add sjo-version-op')
						   .addCellHTML(cleanBreaks(dataTo), 'sjo-version-add');
					} else {
						row.addCell('', 'sjo-version-op').addCell('');
					}
					
				}
				
			}
			
			// Remove original diff
			original.next('br').remove();
			original.remove();
			
		}
		
		function cleanHTML(data) {
			return data.replace(/\\"/g, '"').replace(/\\r\\n/g, '\r\n');
		}
		
		function cleanBreaks(data) {
			return data.replace(/\r\n/g, '<br>');
		}
		
	}
	
	var headingMappings = {
		'Personal details:':		'sjo-section-personal',
		'Candidacy:':				'sjo-section-candidacies',
		'Links and social media:':	'sjo-section-links',
		'Demographics:':			'sjo-section-demographics',
		'All versions':				'sjo-section-versions',
	};
	
	$('h2').each(function(index, element) {
		var heading = $(element);
		if (!heading.attr('id')) {
			var headingID = headingMappings[heading.text()];
			if (headingID) {
				heading.attr('id', headingID);
			}
		}
	});
	
	// Remove blah
	var blah = [
		'Our database is built by people like you.',
		'Please do add extra details about this candidate – it only takes a moment.',
		'Open data JSON API:',
		'More details about getting <a href="/help/api">the data</a> and <a href="/help/about">its licence</a>.',
	];
	$('.person__actions__action p').filter((i, e) => blah.indexOf(e.innerHTML) >= 0).hide();
	
});