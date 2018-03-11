// ==UserScript==
// @name           Tumblr browsing
// @namespace      sjorford@gmail.com
// @version        2018.03.11.0
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
	var timer = null;
	
	$('body').on('keypress', event => {
		console.log(event.originalEvent.key);
		
		if (event.originalEvent.key === 'ArrowDown') {
			stopTimer();
			scroll(false);
			return false;
		} else if (event.originalEvent.key === 'ArrowUp') {
			stopTimer();
			scroll(true);
			return false;
		} else if (event.originalEvent.key === 'a') {
			if (timer) {
				stopTimer();
			} else {
				timer = window.setInterval(scroll, 2000)
			}
			return false;
		}
		
	});
	
	function stopTimer() {
		if (timer) {
			window.clearTimeout(timer);
			timer = null;
		}
	}
	
	function scroll(up) {
		
		var line = $(window).scrollTop() + offset;
		var posts = $('li.post_container, li.post, article, div[id="entry"], div[id="content"]');
		var nextPost;
		
		if (up) {
			nextPost = posts.filter((index, element) => $(element).offset().top < line - 1).last();
		} else {
			nextPost = posts.filter((index, element) => $(element).offset().top > line + 1).first();
		}
		
		console.log(nextPost);
		$('html, body').animate({scrollTop: nextPost.offset().top - offset}, 200);
		
	}
	
});
