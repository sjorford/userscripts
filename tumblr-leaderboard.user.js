// ==UserScript==
// @name           Tumblr leaderboard
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @version        2018.07.09.0
// @match          https://www.tumblr.com/likes
// @match          https://www.tumblr.com/dashboard
// @grant          none
// @require        https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// ==/UserScript==

$(function() {
	
	$(`<style>
		.sjo-leaders {position: fixed; background: white; z-index: 999; font-size: 8pt; top: 0; right: 0; padding: 1em 0 1em 1em;}
		.sjo-leaders td, .sjo-leaders th {padding-right: 1em; text-align: right;}
		.sjo-leaders td:first-of-type, .sjo-leaders th:first-of-type {text-align: left;}
		.sjo-leaders th {font-weight: bold;}
		.tab-bar-container {right: 120px;}
	</style>`).appendTo('head');
	
	var postIds = [];
	var bloggers = [];
	$('<div class="sjo-leaders"><table><tbody></tbody></table></div>').appendTo('body');
	var leaderboard = $('.sjo-leaders tbody');
	var totals = {total: 0, likes: 0, likes2: 0};
	
	setInterval(update, 200);
	
	function update() {
		
		$('img.post_media_photo').each((index, element) => {
			var container = $(element).closest('li.post_container');
			var postId = container.attr('data-pageable');
			if (postIds.indexOf(postId) < 0) {
				postIds.push(postId);
				if (container.find('div[data-is_recommended="1"]').length == 0) {
					
					var links = $('.post_info_link', container);
					var blogger = links.first().text();
					
					var item = $.grep(bloggers, value => value.name == blogger)[0];
					if (!item) bloggers.push(item = {name: blogger, total: 0, likes: 0, likes2: 0});
					item.total++;
					totals.total++;
					
					if (container.find('.liked').length > 0) {
						item.likes++;
						totals.likes++;
						
						links.slice(1).each((index, element) => {
							blogger = $(element).text();
							if (blogger) {
								blogger = blogger.replace(/\n/g, ' ').trim();
								item = $.grep(bloggers, value => value.name == blogger)[0];
								if (!item) bloggers.push(item = {name: blogger, total: 0, likes: 0, likes2: 0});
								item.likes2++;
								totals.likes2++;
							}
						});
						
					}
					
					bloggers = bloggers.sort((a, b) => 
						a.total != b.total ? b.total - a.total : 
						a.likes != b.likes ? b.likes - a.likes : 
						b.likes2 - a.likes2);
					
					leaderboard.empty();
					leaderboard.append(`
								<tr>
									<th>Totals</th>
									<th>${totals.total}</th>
									<th>${totals.likes}</th>
									<th>${totals.likes2}</th>
									<th>${totals.total == 0 ? '-' : Math.floor(totals.likes / totals.total *100) + '%'}</th>
								</tr>`);
					$.each(bloggers, (index, item) => 
						   leaderboard.append(`
								<tr>
									<td>${item.name}</td>
									<td>${item.total}</td>
									<td>${item.likes}</td>
									<td>${item.likes2}</td>
									<td>${item.total == 0 ? '-' : Math.floor(item.likes / item.total *100) + '%'}</td>
								</tr>`));
					
				}
			}
		});
		
	}
	
});
