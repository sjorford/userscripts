// ==UserScript==
// @name           Tumblr browsing
// @namespace      sjorford@gmail.com
// @version        2017-11-21
// @author         Stuart Orford
// @match          https://www.tumblr.com/dashboard
// @grant          none
// @require        https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// @require        https://cdnjs.cloudflare.com/ajax/libs/jquery-scrollTo/2.1.2/jquery.scrollTo.js
// ==/UserScript==

// onScreen jQuery plugin v0.2.1
// (c) 2011-2013 Ben Pickles
// http://benpickles.github.io/onScreen
// Released under MIT license.
(function(a){a.expr[":"].onScreen=function(b){var c=a(window),d=c.scrollTop(),e=c.height(),f=d+e,g=a(b),h=g.offset().top,i=g.height(),j=h+i;return h>=d&&h<f||j>d&&j<=f||i>e&&h<=d&&j>=f;};})(jQuery);

$(function() {

	var body = $('body');

	body.on('keypress', event => {
		var topPost = $('.post_container').filter(':onScreen').eq(1);
		if (event.originalEvent.key === 'ArrowDown') {
			console.log(topPost.next('.post_container'));
			body.scrollTo(topPost.nextAll('.post_container').first(), 0, {offset: -60});
			return false;
		} else if (event.originalEvent.key === 'ArrowUp') {
			console.log(topPost.prev('.post_container'));
			body.scrollTo(topPost.prevAll('.post_container').first(), 0, {offset: -60});
			return false;
		}
	});

});
