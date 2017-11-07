// ==UserScript==
// @name        Demo Club Every Election tweaks
// @namespace   sjorford@gmail.com
// @include     https://elections.democracyclub.org.uk/*
// @version     2017-11-07
// @grant       none
// @require     https://code.jquery.com/jquery-3.2.1.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.min.js
// @require     https://raw.githubusercontent.com/sjorford/userscripts/master/democracyclub/democlub-utils.js
// ==/UserScript==

$(`<style>
	.sjo-election-sublist {font-size: 10pt;}
	.sjo-polldate {margin: 2.5em 0.5em 0 0; vertical-align: bottom;}
	.block-label {background: inherit; border: none; margin: 0; padding: 0 0 0 30px; float: none;}
	.block-label input {top: -2px; left: 0;}
	.sjo-columns {column-width: 15em;}
	.sjo-obsolete {color: #bbb; display: none;}
</style>`).appendTo('head');

$(function() {
	
	// Add link to radar
	$('.menu').append('<li><a href="/election_radar/?status=new">Radar</a></li>');
	
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
	
	// Display buttons for Thursdays
	var wrapper = $('<div></div>').insertAfter('.form-date');
	var thursday = moment().isoWeekday(4);
	for (var i = 0; i < 6; i++) {
		$(`<input class="sjo-polldate" type="button" value="${thursday.add(7, 'days').format('YYYY-MM-DD')}">`).appendTo(wrapper);
	}
	
	// Fill in date fields
	$('body').on('click', '.sjo-polldate', (event) => {
		var date = moment(event.target.value);
		console.log(date);
		$('.form-group-year input').val(date.format('YYYY'));
		$('.form-group-month input').val(date.format('M'));
		$('.form-group-day input').val(date.format('D'));
	});
	
	// Trim council names
	if (location.href.indexOf('id_creator/election_organisation/') >= 0) {
		var oldNICouncils = ['Antrim', 'Ards', 'Armagh', 'Ballymena', 'Ballymoney', 'Banbridge', 'Carrickfergus', 'Castlereagh', 'Coleraine', 'Cookstown', 'Craigavon', 'Derry', 'Down', 'Dungannon and South Tyrone', 'Fermanagh', 'Larne', 'Limavady', 'Lisburn', 'Magherafelt', 'Moyle', 'Newry and Mourne', 'Newtownabbey', 'North Down', 'Omagh', 'Strabane'];
		var labels = $('.block-label');
		labels.contents()
			.filter((index, element) => element.nodeType == 3)
			.each((index, element) => {
				var council = Utils.shortOrgName(element.nodeValue);
				if (oldNICouncils.indexOf(council) >= 0) $(element).closest('.block-label').addClass('sjo-obsolete');
				element.nodeValue = council;
			})
		labels.first().parent().addClass('sjo-columns').append(labels.toArray().sort((a, b) => a.innerText > b.innerText));
	}
	
});
