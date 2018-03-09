// ==UserScript==
// @name           Tumblr browsing
// @namespace      sjorford@gmail.com
// @version        2018.03.09.0
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
			.post_avatar.post-avatar--sticky {visibility: hidden;}
			#right_column {display: none;}
			div[data-is_recommended="1"] {display: none;}

			.post_header {pointer-events: none;}
			.post_info {pointer-events: auto;}
			.post_header::before {
				content: "\\EA4E";
				position: absolute;
				left: 496px;
				border-radius: 3px;
				font-family: tumblr-icons,Blank;
				font-size: 24px;
				cursor: pointer;
				pointer-events: auto;
			}
			.post_header.sjo-liked::before {
				content: "\\EA4F";
				color: #d95e40;
			}
			
		</style>`).appendTo('head');
		
		$('body').on('click', '.post_header', event => {
			var header = $(event.target);
			header.closest('li.post_container').find('.post_control.like').click();
			header.toggleClass('sjo-liked');
		});
		
		setInterval(setIcons, 200);
		
		function setIcons() {
			$('.post_control.liked').closest('li.post_container').find('.post_header').addClass('sjo-liked');
			$('.post_control.like').not('.liked').closest('li.post_container').find('.post_header').removeClass('sjo-liked');
		}
	
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
