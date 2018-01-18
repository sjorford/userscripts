// ==UserScript==
// @name        Demo Club elections tweaks
// @namespace   sjorford@gmail.com
// @include     https://elections.democracyclub.org.uk/*
// @version     2018.01.18.a
// @grant       none
// @require     https://code.jquery.com/jquery-3.2.1.min.js
// @require     https://code.jquery.com/ui/1.12.1/jquery-ui.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.min.js
// @require     https://raw.githubusercontent.com/sjorford/userscripts/master/democracyclub/democlub-utils.js
// ==/UserScript==

$(`<style>
	.sjo-election-sublist {font-size: 10pt;}
	.sjo-date-picker {clear: both; margin-bottom: 1em;}
	.sjo-date-normal a {background-color: #7eeab5 !important;}
	.sjo-date-normal a.ui-state-active {background-color: #007fff !important;}

	.block-label {background: inherit; border: none; margin: 0; padding: 0 0 0 30px; float: none;}
	.block-label input {top: -2px; left: 0;}
	.sjo-columns {column-width: 15em;}
	.sjo-obsolete {color: #bbb; display: none;}
	.sjo-election-sublist a {color: #333}
</style>`).appendTo('head');

$(function() {
	
	// Add link to radar
	$('.menu').append('<li><a href="/election_radar/?status=new">Radar</a></li>');
	
	if (location.href == 'https://elections.democracyclub.org.uk/') {
		displaySubIDs();
	}
	
	if (location.href.indexOf('id_creator/date/') >= 0) {
		displayDatePicker();
	}
	
	if (location.href.indexOf('id_creator/election_organisation/') >= 0) {
		trimCouncilNames();
	}
	
});

function displaySubIDs() {
	
	// Display sub-IDs on front page
	var elections = {};
	$('.card h3:contains("Upcoming elections") + ul li').addClass('sjo-election-top').each((index, element) => {
		
		var key = $('a', element).attr('href').match(/\/elections\/([^\/]+)\//)[1];
		var date = key.split('.')[1];
		if (date == '2018-05-03') return; // TODO
		
		// Get data for this key
		if (!elections[date]) {
			elections[date] = {};
			$.getJSON('https://elections.democracyclub.org.uk/api/elections.json?poll_open_date=' + date, data => {
				
				$.each(data.results, (index, element) => elections[date][element.election_id] = element);
				
				$.each(elections[date], (index, element) => {
					var top = $('.sjo-election-top > a[href*="' + element.election_id + '"]').closest('li');
					if (top.length == 0) {
						return;
					}
					var list = $('<ul class="sjo-election-sublist"></ul>').appendTo(top);
					populateList(element);
					
					function populateList(election) {
						if (election.children.length > 0) {
							$.each(election.children, (index, element) => populateList(elections[date][element])); // why yes, this _is_ the fourth time I have declared (index, element) in this script, thank you for noticing
						} else {
							$(`<li><a href="/elections/${election.election_id}/">${election.election_id}</a></li>`).appendTo(list);
						}
					}
					
				});
				
			});
		}
		
	});
	
}

function displayDatePicker() {
	
	$('<link href="https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css" rel="stylesheet" type="text/css">').appendTo('head');
	
	var today = moment();
	var defaultDate = moment(today).subtract(today.day(), 'days').add(39, 'days');
	
	var wrapper = $('<div class="sjo-date-picker"></div>').insertAfter('.form-date').wrap('<div></div>');
	wrapper.datepicker({
		defaultDate: defaultDate.format('YYYY-MM-DD'),
		dateFormat: 'yy-mm-dd',
		showOtherMonths: true,
		selectOtherMonths: true,
		beforeShowDay: date => {
			var _date = moment(date);
			return [true, _date.day() == 4 && _date.isAfter(today) ? 'sjo-date-normal' : '', ''];
		},
		onSelect: datePicked,
	});
	
	datePicked(defaultDate);
	
	function datePicked(dateInput) {
		var date = moment(dateInput);
		$('.form-group-year input').val(date.format('YYYY'));
		$('.form-group-month input').val(date.format('M'));
		$('.form-group-day input').val(date.format('D'));
	}
	
}

function trimCouncilNames() {
	
	// TODO: put these in a config file
	var oldNICouncils = ['Antrim', 'Ards', 'Armagh', 'Ballymena', 'Ballymoney', 'Banbridge', 'Carrickfergus', 'Castlereagh', 'Coleraine', 'Cookstown', 'Craigavon', 'Derry', 'Down', 'Dungannon and South Tyrone', 'Fermanagh', 'Larne', 'Limavady', 'Lisburn', 'Magherafelt', 'Moyle', 'Newry and Mourne', 'Newtownabbey', 'North Down', 'Omagh', 'Strabane'];
	
	// Trim council names
	var labels = $('.block-label');
	labels.contents()
		.filter((index, element) => element.nodeType == 3)
		.each((index, element) => {
			var council = Utils.shortOrgName(element.nodeValue);
			if (oldNICouncils.indexOf(council) >= 0) $(element).closest('.block-label').addClass('sjo-obsolete');
			element.nodeValue = council;
		});
	labels.first().parent().addClass('sjo-columns').append(labels.toArray().sort((a, b) => a.innerText > b.innerText));

}
