// ==UserScript==
// @name           Tumblr leaderboard
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @version        2020.03.07.0
// @match          https://www.tumblr.com/likes
// @match          https://www.tumblr.com/dashboard
// @grant          none
// @require        https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// ==/UserScript==

$(function() {
	
	$(`<style>
		.sjo-leaders {position: fixed; background: white; z-index: 999; font-size: 8pt; top: 0; right: 0; padding: 1em 0 1em 1em; border: 1px solid black;}
		.sjo-leaders td, .sjo-leaders th {padding-right: 1em; text-align: right;}
		.sjo-leaders td:first-of-type, .sjo-leaders th:first-of-type {text-align: left;}
		.sjo-leaders th {font-weight: bold;}
		.tab-bar-container {right: 120px;}
		.sjo-leaders a {color: darkblue;}
		.sjo-leaders table {margin-top: 1em;}
		.sjo-expand {display: none;}
		.sjo-collapse, .sjo-expand {text-align: right; margin-right: 1em;}
	</style>`).appendTo('head');
	
	var bloggers = [];
	var wrapper = $('<div class="sjo-leaders"></div>')
		.append('<div class="sjo-collapse"><a href="">[Collapse]<a></div>')
		.append('<div class="sjo-expand"><a href="">[Expand]<a></div>')
		.append('<table><tbody></tbody></table>')
		.appendTo('body');
	$('a', '.sjo-collapse, .sjo-expand').click(event => wrapper.children().toggle() && false);
	var leaderboard = $('.sjo-leaders tbody');
	var totals = {total: [], likes: [], likes2: []};
	
	update();
	setInterval(update, 200);
	
	function update() {
		
		$('img.post_media_photo, figure.tmblr-full img').each((index, element) => {
			var container = $(element).closest('li.post_container');
			if (container.find('div[data-is_recommended="1"]').length > 0) return;
			var postId = container.attr('data-pageable');
			
			var links = $('.post_info_link', container);
			var blogger = links.first().text();
			
			var item = $.grep(bloggers, value => value.name == blogger)[0];
			if (!item) bloggers.push(item = {name: blogger, total: [], likes: [], likes2: []});
			add(item.total, element);
			add(totals.total, element);
			
			if (container.find('.liked').length > 0) {
				add(item.likes, element);
				add(totals.likes, element);
			} else {
				del(item.likes, element);
				del(totals.likes, element);
			}
			
			links.slice(1).each((index, element) => {
				blogger = $(element).text();
				if (blogger) {
					blogger = blogger.replace(/\n/g, ' ').trim();
					
					item = $.grep(bloggers, value => value.name == blogger)[0];
					if (!item) bloggers.push(item = {name: blogger, total: [], likes: [], likes2: []});
					
					if (container.find('.liked').length > 0) {
						add(item.likes2, element);
						add(totals.likes2, element);
					} else {
						del(item.likes2, element);
						del(totals.likes2, element);
					}
					
				}
			});
			
			bloggers = bloggers.sort((a, b) => 
									 a.total.length != b.total.length ? b.total.length - a.total.length : 
									 a.likes.length != b.likes.length ? b.likes.length - a.likes.length : 
									 b.likes2.length - a.likes2.length);
			
			leaderboard.empty();
			leaderboard.append(`
				<tr>
				<th>Totals</th>
				<th>${totals.total.length}</th>
				<th>${totals.likes.length}</th>
				<th>${totals.likes2.length}</th>
				<th>${totals.total.length == 0 ? '-' : Math.floor(totals.likes.length / totals.total.length *100) + '%'}</th>
				</tr>`);
			
			$.each(bloggers, (index, item) => leaderboard.append(`
				<tr>
				<td><a href="http://${item.name}.tumblr.com/archive" target="_blank">${item.name}</a></td>
				<td>${item.total.length}</td>
				<td>${item.likes.length}</td>
				<td>${item.likes2.length}</td>
				<td>${item.total.length == 0 ? '-' : Math.floor(item.likes.length / item.total.length *100) + '%'}</td>
				</tr>`));
			
		});
		
	}
	
	function add(array, element) {
		if (array.indexOf(element) < 0) {
			array.push(element);
		}
	}
	
	function del(array, element) {
		var index = array.indexOf(element);
		if (index >= 0) {
			array.splice(index, 1);
		}
	}
	
});
