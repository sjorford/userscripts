// ==UserScript==
// @name         Mapit tweaks
// @namespace    sjorford@gmail.com
// @version      2023.05.28.0
// @author       Stuart Orford
// @match        https://mapit.mysociety.org/*
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// @require      https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// ==/UserScript==

$(function() {
	
	$(`<style>
	.sjo-wrapper {
		position: fixed;
		width: 100%;
		height: 200px;
		bottom: 0px;
		left: 0px;
		background-color: white;
		font-size: 9pt;
		z-index: 9999;
		overflow: scroll;
	}
	</style>`).appendTo('head');
	
	var types = $('.area_list small').toArray().map(e => e.innerText.match(/\w+/)[0]);
	var types = [...new Set(types)];
	
	var query = new URLSearchParams(window.location.search);
	if (query.has('type')) {
		query.delete('type');
		$(`<a href="${window.location.pathname}${query.toString() ? '?' + query.toString() : ''}">view all children</a>`)
			.insertBefore('.area_list').wrap('<div></div>');
	} else {
		$.each(types, (i,type) => {
			query.set('type', type);
			$(`<a href="${window.location.pathname}?${query.toString()}">view ${type} only</a>`)
				.insertBefore('.area_list').wrap('<div></div>')
		});
	}
	
	// Extract parishes
	if (window.location.href.match(/\/areas\/...\.html$/)) {
		$('<input type="button" value="Extract parishes">').insertAfter('h2').click(event => {
			
			var areas = $('.area_list h3 a').toArray().map(e => ({name: e.innerText.trim(), url: e.href.replace(/\.html$/, '/children.html?type=CPC')}));
			console.log(areas);
			
			var table = $('<table class="sjo-table"></table>')
				.appendTo('body').wrap('<div class="sjo-wrapper"></div>')
				.click(event => table.selectRange());
			
			extractParishes();

			function extractParishes() {
				if (areas.length == 0) return;
				var area = areas.shift();
				$.get(area.url, data => {
					var doc = $(data);
					console.log(area.url, doc);
					
					$('.area_list h3 a', doc).each((i,e) => {
						var row = $('<tr></tr>').appendTo(table);
						$('<td></td>').appendTo(row).text(area.url.match(/(\d+)/)[1]);
						$('<td></td>').appendTo(row).text(area.name);
						$('<td></td>').appendTo(row).text(e.href.match(/(\d+)/)[1]);
						$('<td></td>').appendTo(row).text(e.innerText.trim());
					});
					
					extractParishes();
				});
			}

		});
	}
	
});
