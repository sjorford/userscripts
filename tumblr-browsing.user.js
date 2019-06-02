// ==UserScript==
// @name           Tumblr browsing
// @namespace      sjorford@gmail.com
// @version        2018.06.02.0
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
			
			.sjo-liked * {background-color: hsl(44, 100%, 50%) !important;}
			.sjo-liked .post_header::before {
				content: "\\EA4F";
				color: #d95e40;
			}
			
		</style>`).appendTo('head');
		
		$('body').on('click', '.post_header', event => {
			$(event.target).closest('li.post_container').toggleClass('sjo-liked').find('.post_control.like').click();
		});
		
		setInterval(setIcons, 200);
		
		function setIcons() {
			$('.post_control.liked').closest('li.post_container').addClass('sjo-liked');
			$('.post_control.like').not('.liked').closest('li.post_container').removeClass('sjo-liked');
		}
	
	}
	
	var offset = 60;
	var delay = 0; //200
	var timer = null;
	
	$('body').on('keydown', event => {
		
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
				scroll();
				timer = window.setInterval(scroll, 1200)
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
			var filteredPosts = posts.filter((index, element) => $(element).offset().top > line + 1);
			for (var i = 0; i < filteredPosts.length; i++) {
				if (i == filteredPosts.length - 1 || !filteredPosts.eq(i).hasClass('sjo-liked')) {
					nextPost = filteredPosts.eq(i);
					break;
				}
			}
		}
			
		if (nextPost && nextPost.length > 0) {
			$('html, body').animate({scrollTop: nextPost.offset().top - offset}, delay);
		}
		
	}
	
});
