// ==UserScript==
// @name           Tumblr browsing
// @namespace      sjorford@gmail.com
// @version        2017-12-29
// @author         Stuart Orford
// @match          https://www.tumblr.com/dashboard
// @grant          none
// @require        https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// @require        https://cdnjs.cloudflare.com/ajax/libs/jquery-scrollTo/2.1.2/jquery.scrollTo.js
// ==/UserScript==

$(function() {
	
	var offset = 60;
	
	var body = $('body');
	body.on('keypress', event => {
		
		var line = $(window).scrollTop() + offset;
		var posts = $('.post_container');
		
		if (event.originalEvent.key === 'ArrowDown') {
			
			var nextPost = posts.filter((index, element) => $(element).offset().top > line + 1).first();
			console.log(nextPost);
			body.scrollTo(nextPost, 0, {offset: -offset});
			return false;
			
		} else if (event.originalEvent.key === 'ArrowUp') {
			
			var prevPost = posts.filter((index, element) => $(element).offset().top < line - 1).last();
			body.scrollTo(prevPost, 0, {offset: -offset});
			return false;
			
		}
		
	});

});
