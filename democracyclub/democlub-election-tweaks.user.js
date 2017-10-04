// ==UserScript==
// @name        Demo Club Every Election tweaks
// @namespace   sjorford@gmail.com
// @include     https://elections.democracyclub.org.uk/*
// @version     2017-10-03
// @grant       none
// @require     https://code.jquery.com/jquery-3.2.1.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.min.js
// ==/UserScript==

$(`<style>
	.sjo-polldate {margin: 2.5em 1em 0 0; vertical-align: bottom;}
</style>`).appendTo('head');

$(function() {
	
	var wrapper = $('<div></div>').insertAfter('.form-date');
	
	var thursday = moment().isoWeekday(4);
	console.log(thursday);
	
	for (var i = 0; i < 5; i++) {
		$(`<input class="sjo-polldate" type="button" value="${thursday.add(7, 'days').format('YYYY-MM-DD')}">`).appendTo(wrapper);
	}
	
	$('body').on('click', '.sjo-polldate', (event) => {
		var date = moment(event.target.value);
		console.log(date);
		$('.form-group-year input').val(date.format('YYYY'));
		$('.form-group-month input').val(date.format('M'));
		$('.form-group-day input').val(date.format('D'));
	});
	
});
