// ==UserScript==
// @name         Wiktionary tweaks
// @namespace    sjorford@gmail.com
// @version      2021.09.03.0
// @author       Stuart Orford
// @match        https://en.wiktionary.org/wiki/*
// @exclude      https://en.wiktionary.org/wiki/*:*
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

(function($) {
$(function() {
	
	$(`<style>
		.sjo-toc {width: 100%;}
		.sjo-toc-columns {column-width: 12em;}
		.sjo-toc-flag {display: inline-block; width: 23px; height: 14px; box-sizing: border-box; padding-right: 0 !important; margin-right: 0.5em;}
		.sjo-toc-flag img {height: 100%;}
		.sjo-toc-flag.sjo-flag-empty {border: 1px dotted darkgray; vertical-align: middle;}
		.sjo-heading-flag {width: 46px; height: 28px; display: inline-block; margin-right: 5px;}
		.sjo-heading-flag img {max-height: 100%; max-width: 100%; position: relative; bottom: 2px; border: 1px solid #eee; border-bottom: none;}
		.sjo-heading-flag.sjo-flag-empty {display: none;}
	</style>`).appendTo('head');
	
	var flagBaseURL = '//upload.wikimedia.org/wikipedia/commons/thumb/';
	var flagURLs = getFlagIconURLs();
	
	var toc = $('#toc');
	var tocEntries = toc.find('li.toclevel-1').not(':has(a[href$="#English"])').find('ul').hide().end();
	if (tocEntries.length > 15) {
		$('<ul class="sjo-toc-columns"></ul>').appendTo(toc).append(tocEntries);
		toc.addClass('sjo-toc');
	}
	
	tocEntries.each((i,e) => {
		
		var tocLink = $(e).children('a');
		var tocMarker = tocLink.find('.tocnumber').addClass('sjo-toc-flag').empty();
		
		var lang = tocLink.find('.toctext').text().trim();
		if (flagURLs[lang]) {
			$('<img></img>').attr('src', flagBaseURL + flagURLs[lang]).appendTo(tocMarker);
		} else {
			tocMarker.addClass('sjo-flag-empty');
		}
		
	});
	
	$('h2 .mw-headline').each((i,e) => {
		
		var heading = $(e);
		var headingMarker = $('<span class="sjo-heading-flag"></span>').prependTo(heading);
		
		var lang = heading.text().trim();
		if (flagURLs[lang]) {
			$('<img></img>').attr('src', flagBaseURL + flagURLs[lang]).appendTo(headingMarker);
		} else {
			headingMarker.addClass('sjo-flag-empty');
		}
		
	});
	
	window.setTimeout(resetScroll, 0);
	
	function resetScroll() {
		if (window.location.hash) {
			var heading = $('.mw-headline').filter((i,e) => ('#' + e.id) == window.location.hash);
			if (heading.length > 0) heading[0].scrollIntoView();
		}
	}
	
	function getFlagIconURLs() {
		return {
			'Afrikaans':           'a/af/Flag_of_South_Africa.svg/230px-Flag_of_South_Africa.svg.png',
			'Albanian':            '3/36/Flag_of_Albania.svg/210px-Flag_of_Albania.svg.png',
			'Amharic':             '7/71/Flag_of_Ethiopia.svg/230px-Flag_of_Ethiopia.svg.png',
			'Arabic':              '0/0d/Flag_of_Saudi_Arabia.svg/230px-Flag_of_Saudi_Arabia.svg.png',
			'Aragonese':           '1/18/Flag_of_Aragon.svg/230px-Flag_of_Aragon.svg.png',
			'Armenian':            '2/2f/Flag_of_Armenia.svg/230px-Flag_of_Armenia.svg.png',
			'Asturian':            '3/3e/Flag_of_Asturias.svg/230px-Flag_of_Asturias.svg.png',
			'Azerbaijani':         'd/dd/Flag_of_Azerbaijan.svg/230px-Flag_of_Azerbaijan.svg.png',
			'Basque':              '2/2d/Flag_of_the_Basque_Country.svg/230px-Flag_of_the_Basque_Country.svg.png',
			'Belarusian':          '8/85/Flag_of_Belarus.svg/230px-Flag_of_Belarus.svg.png',
			'Breton':              '2/29/Flag_of_Brittany_(Gwenn_ha_du).svg/230px-Flag_of_Brittany_(Gwenn_ha_du).svg.png',
			'Bulgarian':           '9/9a/Flag_of_Bulgaria.svg/230px-Flag_of_Bulgaria.svg.png',
			'Burmese':             '8/8c/Flag_of_Myanmar.svg/230px-Flag_of_Myanmar.svg.png',
			'Cambodian':           '8/83/Flag_of_Cambodia.svg/230px-Flag_of_Cambodia.svg.png',
			'Catalan':             'c/ce/Flag_of_Catalonia.svg/230px-Flag_of_Catalonia.svg.png',
			'Chinese':             'f/fa/Flag_of_the_People%27s_Republic_of_China.svg/230px-Flag_of_the_People%27s_Republic_of_China.svg.png',
			'Cornish':             'b/b8/Flag_of_Cornwall.svg/230px-Flag_of_Cornwall.svg.png',
			'Corsican':            '7/7c/Flag_of_Corsica.svg/383px-Flag_of_Corsica.svg.png',
			'Czech':               'c/cb/Flag_of_the_Czech_Republic.svg/230px-Flag_of_the_Czech_Republic.svg.png',
			'Danish':              '9/9c/Flag_of_Denmark.svg/200px-Flag_of_Denmark.svg.png',
			'Dutch':               '2/20/Flag_of_the_Netherlands.svg/230px-Flag_of_the_Netherlands.svg.png',
			'Estonian':            '8/8f/Flag_of_Estonia.svg/230px-Flag_of_Estonia.svg.png',
			'Esperanto':           'b/b7/Flag_of_Europe.svg/230px-Flag_of_Europe.svg.png',
			'Faroese':             '3/3c/Flag_of_the_Faroe_Islands.svg/210px-Flag_of_the_Faroe_Islands.svg.png',
			'Filipino':            '9/99/Flag_of_the_Philippines.svg/230px-Flag_of_the_Philippines.svg.png',
			'Tagalog':             '9/99/Flag_of_the_Philippines.svg/230px-Flag_of_the_Philippines.svg.png',
			'Finnish':             'b/bc/Flag_of_Finland.svg/230px-Flag_of_Finland.svg.png',
			'French':              'c/c3/Flag_of_France.svg/230px-Flag_of_France.svg.png',
			'West Frisian':        'c/ca/Frisian_flag.svg/220px-Frisian_flag.svg.png',
			'Galician':            '6/64/Flag_of_Galicia.svg/230px-Flag_of_Galicia.svg.png',
			'Georgian':            '0/0f/Flag_of_Georgia.svg/230px-Flag_of_Georgia.svg.png',
			'German':              'b/ba/Flag_of_Germany.svg/230px-Flag_of_Germany.svg.png',
			'Greek':               '5/5c/Flag_of_Greece.svg/230px-Flag_of_Greece.svg.png',
			'Greenlandic':         '0/09/Flag_of_Greenland.svg/230px-Flag_of_Greenland.svg.png',
			'Haitian Creole':      '5/56/Flag_of_Haiti.svg/230px-Flag_of_Haiti.svg.png',
			'Hawaiian':            'e/ef/Flag_of_Hawaii.svg/230px-Flag_of_Hawaii.svg.png',
			'Hebrew':              'd/d4/Flag_of_Israel.svg/210px-Flag_of_Israel.svg.png',
			'Hungarian':           'c/c1/Flag_of_Hungary.svg/230px-Flag_of_Hungary.svg.png',
			'Icelandic':           'c/ce/Flag_of_Iceland.svg/210px-Flag_of_Iceland.svg.png',
			'Indonesian':          '9/9f/Flag_of_Indonesia.svg/230px-Flag_of_Indonesia.svg.png',
			'Irish':               '4/45/Flag_of_Ireland.svg/230px-Flag_of_Ireland.svg.png',
			'Italian':             '0/03/Flag_of_Italy.svg/230px-Flag_of_Italy.svg.png',
			'Jamaican Creole':     '0/0a/Flag_of_Jamaica.svg/383px-Flag_of_Jamaica.svg.png',
			'Japanese':            '9/9e/Flag_of_Japan.svg/230px-Flag_of_Japan.svg.png',
			'Kazakh':              'd/d3/Flag_of_Kazakhstan.svg/230px-Flag_of_Kazakhstan.svg.png',
			'Korean':              '0/09/Flag_of_South_Korea.svg/230px-Flag_of_South_Korea.svg.png',
			'Kurdish':             '3/35/Flag_of_Kurdistan.svg/230px-Flag_of_Kurdistan.svg.png',
			'Central Kurdish':     '3/35/Flag_of_Kurdistan.svg/230px-Flag_of_Kurdistan.svg.png',
			'Northern Kurdish':    '3/35/Flag_of_Kurdistan.svg/230px-Flag_of_Kurdistan.svg.png',
			'Laotian':             '5/56/Flag_of_Laos.svg/230px-Flag_of_Laos.svg.png',
			'Latvian':             '8/84/Flag_of_Latvia.svg/230px-Flag_of_Latvia.svg.png',
			'Lithuanian':          '1/11/Flag_of_Lithuania.svg/230px-Flag_of_Lithuania.svg.png',
			'Luxembourgish':       'd/da/Flag_of_Luxembourg.svg/230px-Flag_of_Luxembourg.svg.png',
			'Macedonian':          '7/79/Flag_of_North_Macedonia.svg/230px-Flag_of_North_Macedonia.svg.png',
			'Malagasy':            'b/bc/Flag_of_Madagascar.svg/230px-Flag_of_Madagascar.svg.png',
			'Malay':               '6/66/Flag_of_Malaysia.svg/230px-Flag_of_Malaysia.svg.png',
			'Maltese':             '7/73/Flag_of_Malta.svg/230px-Flag_of_Malta.svg.png',
			'Mandarin':            'f/fa/Flag_of_the_People%27s_Republic_of_China.svg/230px-Flag_of_the_People%27s_Republic_of_China.svg.png',
			'Manx':                'b/bc/Flag_of_the_Isle_of_Man.svg/230px-Flag_of_the_Isle_of_Man.svg.png',
			'Marshallese':         '2/2e/Flag_of_the_Marshall_Islands.svg/230px-Flag_of_the_Marshall_Islands.svg.png',
			'Mauritian Creole':    '7/77/Flag_of_Mauritius.svg/230px-Flag_of_Mauritius.svg.png',
			'Moldovan':            '2/27/Flag_of_Moldova.svg/230px-Flag_of_Moldova.svg.png',
			'Mongolian':           '4/4c/Flag_of_Mongolia.svg/230px-Flag_of_Mongolia.svg.png',
			'Montenegrin':         '6/64/Flag_of_Montenegro.svg/230px-Flag_of_Montenegro.svg.png',
			'Nauruan':             '3/30/Flag_of_Nauru.svg/230px-Flag_of_Nauru.svg.png',
			'Nepali':              '9/9b/Flag_of_Nepal.svg/160px-Flag_of_Nepal.svg.png',
			'Yoruba':              '7/79/Flag_of_Nigeria.svg/383px-Flag_of_Nigeria.svg.png',
			'Norwegian Bokmål':    'd/d9/Flag_of_Norway.svg/210px-Flag_of_Norway.svg.png',
			'Norwegian Nynorsk':   'd/d9/Flag_of_Norway.svg/210px-Flag_of_Norway.svg.png',
			'Occitan':             '6/6d/Flag_of_Occitania_(with_star).svg/230px-Flag_of_Occitania_(with_star).svg.png',
			'Oromo':               '7/71/Flag_of_Ethiopia.svg/230px-Flag_of_Ethiopia.svg.png',
			'Pennsylvania German': 'f/f7/Flag_of_Pennsylvania.svg/230px-Flag_of_Pennsylvania.svg.png',
			'Persian':             'c/ca/Flag_of_Iran.svg/230px-Flag_of_Iran.svg.png',
			'Polish':              '1/12/Flag_of_Poland.svg/230px-Flag_of_Poland.svg.png',
			'Portuguese':          '5/5c/Flag_of_Portugal.svg/230px-Flag_of_Portugal.svg.png',
			'Romanian':            '7/73/Flag_of_Romania.svg/230px-Flag_of_Romania.svg.png',
			'Romansch':            'f/f3/Flag_of_Switzerland.svg/160px-Flag_of_Switzerland.svg.png',
			'Russian':             'f/f3/Flag_of_Russia.svg/230px-Flag_of_Russia.svg.png',
			'Sardinian':           '4/4e/Flag_of_Sardinia%2C_Italy.svg/375px-Flag_of_Sardinia%2C_Italy.svg.png',
			'Scots':               '1/10/Flag_of_Scotland.svg/230px-Flag_of_Scotland.svg.png',
			'Scottish Gaelic':     '1/10/Flag_of_Scotland.svg/230px-Flag_of_Scotland.svg.png',
			'Serbo-Croatian':      '6/61/Flag_of_Yugoslavia_(1946-1992).svg/230px-Flag_of_Yugoslavia_(1946-1992).svg.png',
			'Sicilian':            'b/ba/Flag_of_Sicily_%28revised%29.svg/230px-Flag_of_Sicily_%28revised%29.svg.png',
			'Slovak':              'e/e6/Flag_of_Slovakia.svg/230px-Flag_of_Slovakia.svg.png',
			'Slovakian':           'e/e6/Flag_of_Slovakia.svg/230px-Flag_of_Slovakia.svg.png',
			'Slovene':             'f/f0/Flag_of_Slovenia.svg/230px-Flag_of_Slovenia.svg.png',
			'Somali':              'a/a0/Flag_of_Somalia.svg/230px-Flag_of_Somalia.svg.png',
			'Spanish':             '9/9a/Flag_of_Spain.svg/230px-Flag_of_Spain.svg.png',
			'Swedish':             '4/4c/Flag_of_Sweden.svg/230px-Flag_of_Sweden.svg.png',
			'Taiwanese':           '7/72/Flag_of_the_Republic_of_China.svg/230px-Flag_of_the_Republic_of_China.svg.png',
			'Thai':                'a/a9/Flag_of_Thailand.svg/230px-Flag_of_Thailand.svg.png',
			'Tok Pisin':           'e/e3/Flag_of_Papua_New_Guinea.svg/340px-Flag_of_Papua_New_Guinea.svg.png',
			'Turkish':             'b/b4/Flag_of_Turkey.svg/230px-Flag_of_Turkey.svg.png',
			'Ukrainian':           '4/49/Flag_of_Ukraine.svg/230px-Flag_of_Ukraine.svg.png',
			'Uzbek':               '8/84/Flag_of_Uzbekistan.svg/230px-Flag_of_Uzbekistan.svg.png',
			'Venetian':            'd/d5/Flag_of_Veneto.svg/230px-Flag_of_Veneto.svg.png',
			'Vietnamese':          '2/21/Flag_of_Vietnam.svg/230px-Flag_of_Vietnam.svg.png',
			'Welsh':               'd/dc/Flag_of_Wales.svg/383px-Flag_of_Wales.svg.png',
		}
	}
	
});
})(jQuery.noConflict());
