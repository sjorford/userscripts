// ==UserScript==
// @id          guardian-tweaks@theguardian.com@sjorford@gmail.com
// @name        Guardian tweaks
// @namespace   sjorford@gmail.com
// @include     http://www.theguardian.com/*
// @include     https://www.theguardian.com/*
// @version     2023.06.22.0
// @grant       none
// @require     https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// ==/UserScript==

$(function() {
	
	$(`<style>
		
		#comments {display: none;}
		.live-blog__sticky-components-container.affix {position: static;}
		.weather {display: none;}
		
		@media (min-width: 81.25em) {
			.crossword__spacer--ad {margin-right: 0;}
			.crossword__clues {display: block; column-count: 3;}
			.crossword__clues--across, .crossword__clues--down {display: block; padding-left: 0;}
			.crossword__clues-list {margin-bottom: 0 !important;}
		}
		
		.crossword__anagram-helper__cell {width: 1.5rem;}
		.crossword__anagram-helper__cell--with-hyphen {position: relative;}
		.crossword__anagram-helper__cell--with-hyphen::after {padding-left: 1.25rem; position: absolute; left: 0;}
		
		.content__secondary-column.hide-until-wide {display: none;} /* hide broken HTML */
		
	</style>`).appendTo('head');
	
	window.setTimeout(formatChristmasCrossword, 1000);
	
	function formatChristmasCrossword() {
		
		if ($('.crossword__cell').length < 200) return;
		
		$(`<style>
			.crossword__container--prize .crossword__hidden-input-wrapper {width: 4%; height: 4%;}
			.crossword__hidden-input {position: relative; top: -2px;}
			.sjo-xword-header-wrapper {padding-left: 1.25rem; column-count: 3;}
			.sjo-xword-header-wrapper .crossword__clues-header {cursor: pointer;}
			.sjo-xword-header-active {background-color: #fff7b2; border-bottom: 4px black solid;}
		</style>`).appendTo('head');
		
		var cluesAcross  = $('.crossword__clues--across .crossword__clues-list');
		var cluesDown    = $('.crossword__clues--down   .crossword__clues-list').hide();
		var cluesHeaders = $('.crossword__clues .crossword__clues-header').insertBefore('.crossword__clues')
								.wrapAll('<div class="sjo-xword-header-wrapper"></div>');
		
		cluesHeaders.first().addClass('sjo-xword-header-active');
		cluesHeaders.click(event => selectClues(event.target));
		
		showClues();
		
		$('.crossword__container__grid-wrapper').on('click keydown input blur', () => window.setTimeout(showClues, 0));
		
		function showClues() {
			var down = ($('.crossword__clue--selected').closest('.crossword__clues--down').length > 0);
			selectClues(down ? cluesHeaders.last() : cluesHeaders.first());
		}
		
		function selectClues(target) {
			if ($(target).is('.sjo-xword-header-active')) return;
			cluesAcross.toggle() && cluesDown.toggle();
			cluesHeaders.toggleClass('sjo-xword-header-active');
		}
		
	}
	
});
