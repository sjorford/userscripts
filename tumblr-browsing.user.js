// ==UserScript==
// @name           Tumblr browsing
// @namespace      sjorford@gmail.com
// @version        2018.03.07.1
// @author         Stuart Orford
// @match          https://www.tumblr.com/dashboard
// @match          https://www.tumblr.com/likes
// @match          https://www.tumblr.com/*
// @include        /^https?://[^.]+\.tumblr\.com//
// @grant          none
// @require        https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// @require        https://cdnjs.cloudflare.com/ajax/libs/jquery-scrollTo/2.1.2/jquery.scrollTo.js
// ==/UserScript==

$(function() {
	
	if (location.href.split('#')[0] == 'https://www.tumblr.com/dashboard') {
		$(`<style>
			xxx#posts.posts > .post_container {float: left; margin-right: 20px;}
			xxx#posts > li:nth-of-type(3n) {clear: both;}
			.post_avatar.post-avatar--sticky {visibility: hidden;}
			#right_column {display: none;}
			xxx.l-container.l-container--two-column, 
			xxx.l-container.l-container--two-column-dashboard {width: auto;}
			xxx.l-container.l-container--two-column-dashboard .left_column, 
			xxx.l-container.l-container--two-column .left_column {width: auto;}
			div[data-is_recommended="1"] {display: none;}
		</style>`).appendTo('head');
	}
	
	var offset = 60;
	
	var body = $('body');
	body.on('keypress', event => {
		
		// TODO: need to use window.top but not allowed by CORS?
		var line = $(window).scrollTop() + offset;
		var posts = $('li.post_container, li.post, article, div[id="entry"], div[id="content"]');
		//console.log(event, posts);
		
		if (event.originalEvent.key === 'ArrowDown') {
			
			var nextPost = posts.filter((index, element) => $(element).offset().top > line + 1).first();
			//console.log(nextPost);
			body.scrollTo(nextPost, 0, {offset: -offset});
			return false;
			
		} else if (event.originalEvent.key === 'ArrowUp') {
			
			var prevPost = posts.filter((index, element) => $(element).offset().top < line - 1).last();
			//console.log(prevPost);
			body.scrollTo(prevPost, 0, {offset: -offset});
			return false;
			
		}
		
	});
	
});
