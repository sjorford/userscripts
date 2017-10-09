// ==UserScript==
// @name        Demo Club Every Election tweaks
// @namespace   sjorford@gmail.com
// @include     https://elections.democracyclub.org.uk/*
// @version     2017-10-09
// @grant       none
// @require     https://code.jquery.com/jquery-3.2.1.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.min.js
// ==/UserScript==

$(`<style>
	.sjo-polldate {margin: 2.5em 1em 0 0; vertical-align: bottom;}
	.block-label {background: inherit; border: none; margin: 0; padding: 0 0 0 30px; float: none;}
	.block-label input {top: -2px; left: 0;}
	.sjo-columns {column-width: 15em;}
</style>`).appendTo('head');

$(function() {
	
	// Display buttons for Thursdays
	var wrapper = $('<div></div>').insertAfter('.form-date');
	var thursday = moment().isoWeekday(4);
	for (var i = 0; i < 5; i++) {
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
		var labels = $('.block-label');
		var labelElements = labels.contents()
			.filter((index, element) => element.nodeType == 3)
			.each((index, element) => element.nodeValue = element.nodeValue.trim().replace(/^(Borough of |Borough Council of |London Borough of |Royal Borough of |City of |City and County of |Council of the |Comhairle nan )?(.+?)(( County| County Borough| Metropolitan Borough| Borough| Metropolitan District| District| City and District| City)? Council)?$/, '$2'))
			.closest('.block-label').toArray()
			.sort((a, b) => a.innerText > b.innerText);
		labels.first().parent().addClass('sjo-columns').append(labelElements);
	}
	
});
