// ==UserScript==
// @name         Sporcle badges
// @namespace    sjorford@gmail.com
// @version      2020.02.03.0
// @author       Stuart Orford
// @match        https://www.sporcle.com/user/sjorford/badges/*
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

$(function() {
	
	$(`<style>
		.sjo-description {font-size: 8pt;}
		.profile-table .sjo-description a {display: inline; margin-right: auto;}
	<style>`).appendTo('head');
	
	var script = $('script:contains("var badgeList")').text().match(/var badgeList[\s\S]+?;/)[0];
	eval(script);
	console.log(badgeList);
	
	$('.badge-name').each((i,e) => {
		var cell = $(e).closest('td');
		$('<div class="sjo-description"></div>').html(badgeList[i].badge_description).appendTo(cell);
	});
	
});
