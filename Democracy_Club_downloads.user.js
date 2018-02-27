// ==UserScript==
// @name        Democracy Club downloads
// @namespace   sjorford@gmail.com
// @include     https://candidates.democracyclub.org.uk/help/api
// @version     2018.02.27.1
// @grant       none
// @require     https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/PapaParse/4.1.4/papaparse.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/chosen/1.6.2/chosen.jquery.min.js
// @require     https://raw.githubusercontent.com/sjorford/democlub-userscripts/master/lib/utils.js
// ==/UserScript==

$(function() {
	
	$('<style>\
		#sjo-api-wrapper {margin: 1rem;}\
		#sjo-api-select {width: auto;}\
		#sjo_api_select_chosen {margin-right: 1rem;}\
		#sjo-api-status {font-style: italic; margin-top: 0.5rem;}\
		#sjo-api-table-wrapper {margin: 0.5rem 0;}\
		#sjo-api-table {margin-bottom: 0;}\
		#sjo-api-table th {user-select: none; -moz-user-select: none; text-align: center;}\
		#sjo-api-table th, #sjo-api-table td {padding: 0.25rem; font-size: 0.75rem !important;}\
		#sjo-api-table td.sjo-cell-icon {font-size: 1rem !important; text-align: center;}\
		#sjo-api-row-filter td {font-weight: normal;}\
		#sjo-api-row-filter ul {font-size: 0.75rem !important;}\
		#sjo-api-row-filter .chosen-container {xxxwidth: auto !important; min-width: 5rem; max-width: 20rem;}\
	</style>').appendTo('head');
	
	// Import stylesheet for dropdowns
	$('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/chosen/1.6.2/chosen.css"></style>').appendTo('head');
	
	// TODO: split this into a field definition array, and a table definition array
	var fields = [
		{'name': '_row',				'display': '#',			'filter': false, 	'sort': 'number',	},
		{'name': 'id',					'display': 'ID',		'filter': false, 	'sort': 'number',	},
		{'name': 'name',				'display': 'Name',		'filter': false, 	'sort': 'text',		'link': '/person/@@id@@'},
//		{'name': 'election',			'display': 'Election',	'filter': true, 	'sort': 'text',		},
		{'name': '_date',				'display': 'Date',		'filter': true, 	'sort': 'text',		}, //'defaults': ['2017-03-02', '2017-03-23', '2017-05-04']},
//		{'name': '_year',				'display': 'Year',		'filter': true, 	'sort': 'text',		}, //'defaults': ['2017']},
		{'name': '_type',				'display': 'Type',		'filter': true, 	'sort': 'text',		},
//		{'name': 'post_id',				'display': 'ID',		'filter': false, 	'sort': 'text',		},
		{'name': 'post_label',			'display': 'Post',		'filter': true, 	'sort': 'text',		},
//		{'name': 'party_list_position',	'display': 'Pos',		'filter': false, 	'sort': 'number',	},
//		{'name': 'party_id',			'display': 'ID',		'filter': false, 	'sort': 'party_id',	},
		{'name': 'party_name',			'display': 'Party',		'filter': true, 	'sort': 'text',		},
		//{'name': '_link_cells',			'display': 'Links',		'filter': false, 	'sort': 'text',		'format': 'html',	'colspan': 8},
		//{'name': 'birth_date',			'display': 'DOB',		'filter': false, 	'sort': 'text',		},
		//{'name': '_gender',				'display': 'Sex',		'filter': false, 	'sort': 'text',		'icon': true},
		//{'name': '_image',				'display': 'Img',		'filter': false, 	'sort': 'text',		'icon': true},
	];
	
	var linkTypes = [
		{'field': 'email',					'abbr': '@',		'link': 'mailto:@@email@@'							},
		{'field': 'twitter_username',		'abbr': 'tw',		'link': 'https://twitter.com/@@twitter_username@@'	},
		{'field': 'facebook_personal_url',	'abbr': 'fbp',		},
		{'field': 'facebook_page_url',		'abbr': 'fbc',		},
		{'field': 'homepage_url',			'abbr': 'hp',		},
		{'field': 'wikipedia_url',			'abbr': 'wp',		},
		{'field': 'linkedin_url',			'abbr': 'li',		},
		{'field': 'party_ppc_page_url',		'abbr': 'ppc',		},
	];
	
	// Insert wrapper at top of page
	var wrapper = $('<div id="sjo-api-wrapper"></div>').prependTo('.content');
	var table;
	
	// Add all downloads to dropdown
	var dropdown = $('<select id="sjo-api-select"></select>').appendTo(wrapper);
	var container = dropdown;
	$('h2#csv').nextUntil('h2').find('h3, h4, a[href$=".csv"]').each((index, element) => {
		var item = $(element);
		if (item.is('h3, h4')) {
			container = $('<optgroup></optgroup>').attr('label', item.text()).appendTo(dropdown);
		} else {
			var itemText = item.html().trim();
			var match = itemText.match(/^Download the (The )?(.*?)( local election)? candidates$/);
			var optionText = match ? (item.attr('href').match(/candidates-mayor/) ? 'Mayor of ' : '') + Utils.shortOrgName(match[2]) : itemText;
			$('<option></option>').attr('value', item.attr('href')).text(optionText).appendTo(container);
		}
	})
	
	// Add button
	$('<input type="button" id="sjo-api-button-download" value="Extract">')
		.insertAfter(dropdown)
		.click(startDownload);
	
	// Create table wrapper
	$('<div id="sjo-api-status"></div>').appendTo(wrapper);
	$('<div id="sjo-api-table-wrapper"></div>').appendTo(wrapper);
	
	// TESTING
	//dropdown.find('option:contains("2017 Northern Ireland")').prop({selected: true});
	
	// Format dropdown
	dropdown.chosen();
	
	// Hide rest of page
	var helpWrapper = $('.help-api').hide();
	$('<input type="button" id="#sjo-api-button-help" value="Show/hide API help">').appendTo(wrapper).click(event => $(helpWrapper).toggle());
		
	function startDownload() {
		
		var url = $('#sjo-api-select').val();
		window.console.log(url);

		// Download and parse CSV
		Papa.parse(url, {
			'download': true,
			'header': true,
			'delimiter': ',',
			'newline': '\r\n',
			'quoteChar': '"',
			'skipEmptyLines': true,
			'complete': parseComplete,
		});
			
		function parseComplete(results) {
			window.console.log(results);
			// TODO: do something with errors
			
			// Clean data
			$.each(results.data, (index, candidate) => cleanData(index, candidate));

			// Create table
			// TODO: format table
			$('#sjo-api-table-wrapper').empty();
			table = $('<table id="sjo-api-table"><thead>' +
				'<tr id="sjo-api-row-header">' + fields.map(field => 
					'<th' + (field.colspan ? ' colspan="' + field.colspan + '"' : '') + '>' + escapeHtml(field.display) + '</th>').join('') + '</tr>' +
				'<tr id="sjo-api-row-filter">' + fields.map(field => 
					'<td' + (field.colspan ? ' colspan="' + field.colspan + '"' : '') + '></td>').join('') + '</tr>' +
				'</thead><tbody></tbody></table>').appendTo('#sjo-api-table-wrapper');
			
			// Render table
			table.data('data', results.data);
			buildFilters();
			renderTable();
			
		}
		
	}
	
	// TODO: make a class
	function cleanData(index, candidate) {
		
		// Add row number
		candidate._row = index + 1;
		
		// Initialise filter status array
		candidate._filters = [];
		
		// Tweak election IDs
		candidate.election = 
			candidate.election == '2010' ? 'parl.2010-05-06' :
			candidate.election == '2015' ? 'parl.2015-05-07' :
			candidate.election;
			
		// Split election ID into components
		var match = candidate.election.match(/^(local\.[^\.]+|[^\.]+)\.(.*\.)?((\d\d\d\d)-\d\d-\d\d)$/);
		candidate._type = match[1];
		candidate._date = match[3];
		candidate._year = match[4];
		
		// Add link summary field and individual linked cells
		candidate._links = '';
		var link_cells = [];
		$.each(linkTypes, function(index, type) {
			//if (!candidate[type.field]) return;
			
			// Build the link url
			var href;
			if (type.link) {
				href = type.link;
				var match;
				while (match = href.match(/^(.*?)@@(.*?)@@(.*)$/)) {
					href = match[1] + candidate[match[2]] + match[3];
				}
			} else {
				href = candidate[type.field];
			}
			
			// Build the link cell
			var linkHtml = '<a href="' + href + '">' + type.abbr + '</a>';
			if (candidate[type.field]) {
				if (candidate._links != '') candidate._links += '&nbsp;';
				candidate._links += linkHtml;
				link_cells.push(linkHtml);
			} else {
				link_cells.push('');
			}
			
		});
		candidate._link_cells = link_cells.join('</td><td>');
		
		// Add icon fields
		candidate._gender = 
			candidate.gender === '' ? '' : 
			candidate.gender.toLowerCase() == 'male'   ? '\u2642' :
			candidate.gender.toLowerCase() == 'female' ? '\u2640' :
			'?';
		candidate._image = candidate.image_url ? '\u263A' : '';
		
	}
	
	// Display filters on selected columns
	// TODO: add wildcard filters for elections
	// TODO: grey out options that are not in current filtered data set
	function buildFilters() {
		window.console.log('buildFilters');
		if (table.data('data').length < 30) return;
		
		var cells = table.find('#sjo-api-row-filter td');
		
		var values;
		$.each(fields, (index, field) => {
			if (!field.filter) return;
			
			// Build list of filter options
			values = [];
			if (field.defaults) values = values.concat(field.defaults);
			$.each(table.data('data'), (index, candidate) => {
				if (values.indexOf(candidate[field.name]) < 0) {
					values.push(candidate[field.name]);
				}
			});
			
			// Don't show filter for only one value
			if (values.length <= 1) return;
			
			// Add dropdown to table header
			var dropdown = $('<select multiple class="sjo-api-filter" id="sjo-api-filter-' + field.name + '">' + values.sort().map(value => 
					'<option' + (field.defaults && field.defaults.indexOf(value) >= 0 ? ' selected' : '') + '>' + escapeHtml(value) + '</option>').join('') + '</select>')
				.appendTo(cells[index])
				.chosen({
					'placeholder_text_multiple': ' ',
					'search_contains': true,
				});
			
			// Apply the new filter
			applyFilters(dropdown);

		});
		
	}
	
	// Re-render table on filter change
	$('body').on('change', '.sjo-api-filter', function() {
		applyFilters(this);
		renderTable();
	});
		
	function applyFilters(dropdown) {
		window.console.log('applyFilters', dropdown);
		
		// Apply the filters to the data set
		var filter = $(dropdown);
		var values = filter.val();
		var column = filter.closest('td').prop('cellIndex');
		var field = fields[column];
		$.each(table.data('data'), (index, candidate) => {
			candidate._filters[column] = !values || values.indexOf(candidate[field.name]) >= 0;
		});
		
		// Hide extra space in dropdowns
		if (values) {
			filter.closest('td').find('.search-field').hide();
		} else {
			filter.closest('td').find('.search-field').show();
		}
		
		// TODO: show matching filters at top
		
	}
	
	// Click on column header to sort
	// TODO: display icon in header of sorted column
	$('body').on('click', '#sjo-api-row-header th', function() {
		sortData($(this).prop('cellIndex'));
		renderTable();
	});
	
	// Sort data on selected column
	function sortData(column) {
		var field = fields[column];
		
		// Reverse sort if column is already sorted
		var sortOrder = table.data('sortColumn') == column ? -table.data('sortOrder') : 1;
		
		// Store new sort order
		// TODO: store initial sort if data contains a row column
		table.data({
			'sortColumn': column,
			'sortOrder': sortOrder,
		});
		
		// Sort by data type, with blanks last
		// TODO: sort links summary by text, not html
		table.data('data').sort(function(a, b) {
			if (a[field.name] === '') return +1;
			if (b[field.name] === '') return -1;
			if (field.sort == 'text' || field.sort == 'date')
				return (sortOrder == 1 ? a[field.name] > b[field.name] : a[field.name] < b[field.name]);
			if (field.sort == 'number')
				return (sortOrder * (a[field.name] - b[field.name]));
			if (field.sort == 'party_id'){
				// TODO: this better, or just not at all
				return (sortOrder * (a.party_id.split(':')[1].split('-')[0] - b.party_id.split(':')[1].split('-')[0]));
			}
			return 0;
		});
		
	}
	
	// Rebuild table HTML
	var maxTableRows = 100000;
	function renderTable() {
		window.console.log('renderTable');
		
		// Build table as raw HTML for rendering speed
		// TODO: add links to posts
		// TODO: show maximum 1000 at a time, with buttons for paging
		var bodyHtml = '';
		var numRows = 0;
		$.each(table.data('data'), function(index, candidate) {
			if (numRows < maxTableRows && candidate._filters.every(value => value)) {
				bodyHtml += '<tr>' + fields.map(function(field) {
					var cellHtml = (field.format == 'html' ? candidate[field.name] : escapeHtml(candidate[field.name]));
					if (field.link) {
						var href = field.link;
						var match;
						while (match = href.match(/^(.*?)@@(.*?)@@(.*)$/)) {
							href = match[1] + candidate[match[2]] + match[3];
						}
						cellHtml = '<a href="' + href + '">' + cellHtml + '</a>';
					}
					return '<td' + (field.icon ? ' class="sjo-cell-icon"' : '') + '>' + cellHtml + '</td>';
				}).join('') + '</tr>\r\n';
				numRows++;
			}
		});
		table.find('tbody').html(bodyHtml);
		
		// Display total of rows
		$('#sjo-api-status').text('Displaying ' + (numRows == table.data('data').length ? '' : numRows + ' of ') + table.data('data').length + ' rows');
		
	}
	
	// Select table body on click
	// TODO: not on links
	$('body').on('click', '#sjo-api-table tbody', function(event) {
		if (event.ctrlKey || event.shiftKey || event.altKey) return;
		$(this).selectRange();
	});
	
	// Escape angle brackets in values
	function escapeHtml(string) {
		return string ? ('' + string).replace(/</g, '&lt;').replace(/>/g, '&gt;') : string;
	}
	
});

// ================================================================
// jQuery plugins
// ================================================================

// Add a new cell to a table row
(function($) {
	
	function addCell(obj, isHTML, content, className, id) {
		for (var i = 0; i < obj.length; i++) {
			var row = obj[i];
			if (row.tagName == 'TR') {
				var cell = $('<td></td>');
				if (content != null && content != undefined) {
					if (isHTML) cell.html(content); 
					else cell.text(content);
				}
				if (className) cell.addClass(className);
				if (id) cell.attr('id', id);
				cell.appendTo(row);
			}
		}
		return obj;
	}
	
	$.fn.addCell = function(text, className, id) {
		return addCell(this, false, text, className, id);
	};
	
	$.fn.addCellHTML = function(html, className, id) {
		return addCell(this, true, html, className, id);
	};
	
})(jQuery);

// Select range
(function($) {
	
	$.fn.selectRange = function() {
		var range = document.createRange();
		range.selectNodeContents(this.get(0));
		var selection = window.getSelection();        
		selection.removeAllRanges();
		selection.addRange(range);
		return this;
	};
	
})(jQuery);
