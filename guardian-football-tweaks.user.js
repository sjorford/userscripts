// ==UserScript==
// @name         Guardian football tweaks
// @namespace    sjorford@gmail.com
// @version      2020.02.29.0
// @author       Stuart Orford
// @match        https://www.theguardian.com/football/*
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

$(function() {
	
	$(`<style class-"sjo-styles">
		.sjo-table-links a {font-weight: normal; margin-left: 0.5em;}
		@media (min-width: 71.25em) {
			.sjo-table-links a {display: block; margin-top: 0.5em; margin-left: 0;}
		}
	</style>`).appendTo('head');
	
	if (window.location.pathname.match('/table')) {
		$(`<span class="sjo-table-links">
			<a href="${window.location.pathname.replace('/table', '/fixtures')}">Fixtures</a>
			<a href="${window.location.pathname.replace('/table', '/results')}">Results</a>
		</span>`).appendTo('.table--football caption');
	}
	
	if (window.location.pathname.match(/football\/.*\/fixtures/)) {
		$(`<div>
			<a href="${window.location.pathname.replace('/fixtures', '/table')}">Table</a>
			<a href="${window.location.pathname.replace('/fixtures', '/results')}">Results</a>
		</div>`).appendTo('.football-leagues');
		
	}
	
	var resultsPath = window.location.pathname.match(/\/football\/(.*\/)?results/)[0];
	if (resultsPath && $('.football-leagues__list').length == 0) {
		var select = $('<select class="football-leagues__list" name="competitionUrl" id="football-leagues">')
				.append(`<option value="/football/results">All results</option>`)
				.insertBefore('.football-leagues--list')
				.wrap('<form class="football-leagues modern-visible" method="get"></form>')
				.before('<label for="football-leagues" class="football-leagues__label">Choose league: </label>');
		$('.football-leagues__item a').each((i,e) => {
			var path = e.href.match(/\/football\/.*/)[0];
			var option = $(`<option value="${path}"${path == resultsPath ? ' selected' : ''}>${e.innerText}</option>`).appendTo(select);
		});
	}
	
});
