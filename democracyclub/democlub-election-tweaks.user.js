// ==UserScript==
// @name        Demo Club Every Election tweaks
// @namespace   sjorford@gmail.com
// @include     https://elections.democracyclub.org.uk/*
// @version     2017-11-05
// @grant       none
// @require     https://code.jquery.com/jquery-3.2.1.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.min.js
// ==/UserScript==

$(`<style>
	.sjo-polldate {margin: 2.5em 0.5em 0 0; vertical-align: bottom;}
	.block-label {background: inherit; border: none; margin: 0; padding: 0 0 0 30px; float: none;}
	.block-label input {top: -2px; left: 0;}
	.sjo-columns {column-width: 15em;}
	.sjo-obsolete {color: #bbb; display: none;}
</style>`).appendTo('head');

$(function() {
	
	// Add link to radar
	$('.menu').append('<li><a href="/election_radar/?status=new">Radar</a></li>');
	
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
				var council = element.nodeValue;
				council = council == 'City of London Corporation' ? 'City of London' : council.trim()
					.replace(/^(Borough of |Borough Council of |London Borough of |Royal Borough of |City of |City and County of |Council of the |Comhairle nan )?(.+?)(( County| County Borough| Metropolitan Borough| Borough| Metropolitan District| District| City and District| City)? Council| Combined Authority)?$/, '$2');
				if (oldNICouncils.indexOf(council) >= 0) $(element).closest('.block-label').addClass('sjo-obsolete');
				element.nodeValue = council;
			})
		labels.first().parent().addClass('sjo-columns').append(labels.toArray().sort((a, b) => a.innerText > b.innerText));
	}
	
});
