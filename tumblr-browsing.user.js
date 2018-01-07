// ==UserScript==
// @name           Tumblr browsing
// @namespace      sjorford@gmail.com
// @version        2018-01-07
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
	
	var offset = 60;
	
	var body = $('body');
	body.on('keypress', event => {
		
		// TODO: need to use window.top but not allowed by CORS?
		var line = $(window).scrollTop() + offset;
		var posts = $('li.post_container, article');
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
