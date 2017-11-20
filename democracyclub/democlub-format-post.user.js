// ==UserScript==
// @name        Demo Club format post
// @namespace   sjorford@gmail.com
// @include     https://candidates.democracyclub.org.uk/election/*/post/*
// @version     2017-11-20
// @grant       none
// ==/UserScript==

$(function() {
	
	polyfill();
	
	$(`<style>
		
		.sjo-api-timeline {margin-bottom: 0.5rem;}
		.sjo-api-timeline-item {display: inline-block; border: 2px solid white; font-size: small; padding: 2px 2px 2px 16px;}
		.sjo-api-timeline-item:first-of-type {padding-left: 6px; border-top-left-radius: 5px; border-bottom-left-radius: 5px;}
		.sjo-api-timeline-item:last-of-type {padding-right: 6px; border-top-right-radius: 5px; border-bottom-right-radius: 5px; }
		
		.sjo-api-timeline-status_not_started {background-color: darkgrey; color: white;}
		.sjo-api-timeline-status_in_progress {background-color: #f6cd59; color: white;}
		.sjo-api-timeline-status_done {background-color: #8ccc8c; color: white;}
		
		.sjo-api-timeline-arrow.sjo-api-timeline-status_not_started:after {border-left-color: darkgrey;}
		.sjo-api-timeline-arrow.sjo-api-timeline-status_in_progress:after {border-left-color: #f6cd59;}
		.sjo-api-timeline-arrow.sjo-api-timeline-status_done:after {border-left-color: #8ccc8c;}

		/* http://www.cssarrowplease.com/ */
		.sjo-api-timeline-arrow {
			position: relative;
		}
		.sjo-api-timeline-arrow:after, .sjo-api-timeline-arrow:before {
			left: 100%;
			top: 50%;
			border: solid transparent;
			content: " ";
			height: 0;
			width: 0;
			position: absolute;
			pointer-events: none;
		}
		.sjo-api-timeline-arrow:after {
			border-width: 12px;
			margin-top: -12px;
		}
		.sjo-api-timeline-arrow:before {
			border-left-color: #ffffff;
			border-width: 15px;
			margin-top: -15px;
		}
		
	</style>`).appendTo('head');
	
	$('div.panel').filter((index, element) => element.innerText.fullTrim() == 'These candidates haven\'t been confirmed by the official "nomination papers" from the council yet. This means they might not all end up on the ballot paper. We will manually verify each candidate when the nomination papers are published.').hide();
	
	// Convert the timeline to a breadcrumb type thing
	var timeline = $('<div class="sjo-api-timeline"></div>').prependTo('.content .container');
	var items = $('.timeline_item div');
	items.each((index, element) => {
		var item = $(element);
		var text = item.find('strong').text().replace(/"|\.$/g, '');
		$('<div class="sjo-api-timeline-item"></div>')
			.text(text)
			.addClass(index == items.length - 1 ? '' : 'sjo-api-timeline-arrow')
			.addClass('sjo-api-timeline-' + item.attr('class'))
			.css({'zIndex': 99 - index})
			.appendTo(timeline);
	});
	items.closest('.columns').hide();
	
	function polyfill() {
			
		if (!String.prototype.fullTrim) {
			String.prototype.fullTrim = function() {
				return this.trim().replace(/(\s|\n|\r)+/g, ' ');
			};
		}
		
	}
	
});
