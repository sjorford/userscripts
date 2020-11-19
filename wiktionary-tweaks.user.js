// ==UserScript==
// @name         Wiktionary tweaks
// @namespace    sjorford@gmail.com
// @version      2020.11.19.0
// @author       Stuart Orford
// @match        https://en.wiktionary.org/wiki/*
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

(function($) {
$(function() {
	
	$(`<style>
		.sjo-toc {width: 100%;}
		.sjo-toc-columns {column-width: 12em;}
		.sjo-toc-flag {display: inline-block; width: 23px; box-sizing: border-box; padding-right: 0 !important; margin-right: 0.5em;}
		.sjo-toc-flag-empty {border: 1px dotted darkgray; height: 14px; vertical-align: middle;}
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
		var link = $(e).children('a');
		var marker = link.find('.tocnumber').addClass('sjo-toc-flag').empty();
		var lang = link.find('.toctext').text().trim();
		if (flagURLs[lang]) {
			$('<img></img>').attr('src', flagBaseURL + flagURLs[lang]).appendTo(marker);
		} else {
			marker.addClass('sjo-toc-flag-empty');
		}
	});
	
	function getFlagIconURLs() {
		return {
			'Afrikaans':           'a/af/Flag_of_South_Africa.svg/23px-Flag_of_South_Africa.svg.png',
			'Albanian':            '3/36/Flag_of_Albania.svg/21px-Flag_of_Albania.svg.png',
			'Amharic':             '7/71/Flag_of_Ethiopia.svg/23px-Flag_of_Ethiopia.svg.png',
			'Arabic':              '0/0d/Flag_of_Saudi_Arabia.svg/23px-Flag_of_Saudi_Arabia.svg.png',
			'Aragonese':           '1/18/Flag_of_Aragon.svg/23px-Flag_of_Aragon.svg.png',
			'Armenian':            '2/2f/Flag_of_Armenia.svg/23px-Flag_of_Armenia.svg.png',
			'Asturian':            '3/3e/Flag_of_Asturias.svg/23px-Flag_of_Asturias.svg.png',
			'Azerbaijani':         'd/dd/Flag_of_Azerbaijan.svg/23px-Flag_of_Azerbaijan.svg.png',
			'Basque':              '2/2d/Flag_of_the_Basque_Country.svg/23px-Flag_of_the_Basque_Country.svg.png',
			'Belarusian':          '8/85/Flag_of_Belarus.svg/23px-Flag_of_Belarus.svg.png',
			'Breton':              '2/29/Flag_of_Brittany_(Gwenn_ha_du).svg/23px-Flag_of_Brittany_(Gwenn_ha_du).svg.png',
			'Bulgarian':           '9/9a/Flag_of_Bulgaria.svg/23px-Flag_of_Bulgaria.svg.png',
			'Burmese':             '8/8c/Flag_of_Myanmar.svg/23px-Flag_of_Myanmar.svg.png',
			'Cambodian':           '8/83/Flag_of_Cambodia.svg/23px-Flag_of_Cambodia.svg.png',
			'Catalan':             'c/ce/Flag_of_Catalonia.svg/23px-Flag_of_Catalonia.svg.png',
			'Chinese':             'f/fa/Flag_of_the_People%27s_Republic_of_China.svg/23px-Flag_of_the_People%27s_Republic_of_China.svg.png',
			'Cornish':             'b/b8/Flag_of_Cornwall.svg/23px-Flag_of_Cornwall.svg.png',
			'Czech':               'c/cb/Flag_of_the_Czech_Republic.svg/23px-Flag_of_the_Czech_Republic.svg.png',
			'Danish':              '9/9c/Flag_of_Denmark.svg/20px-Flag_of_Denmark.svg.png',
			'Dutch':               '2/20/Flag_of_the_Netherlands.svg/23px-Flag_of_the_Netherlands.svg.png',
			'Estonian':            '8/8f/Flag_of_Estonia.svg/23px-Flag_of_Estonia.svg.png',
			'Esperanto':           'b/b7/Flag_of_Europe.svg/23px-Flag_of_Europe.svg.png',
			'Faroese':             '3/3c/Flag_of_the_Faroe_Islands.svg/21px-Flag_of_the_Faroe_Islands.svg.png',
			'Filipino':            '9/99/Flag_of_the_Philippines.svg/23px-Flag_of_the_Philippines.svg.png',
			'Finnish':             'b/bc/Flag_of_Finland.svg/23px-Flag_of_Finland.svg.png',
			'French':              'c/c3/Flag_of_France.svg/23px-Flag_of_France.svg.png',
			'West Frisian':        'c/ca/Frisian_flag.svg/22px-Frisian_flag.svg.png',
			'Galician':            '6/64/Flag_of_Galicia.svg/23px-Flag_of_Galicia.svg.png',
			'Georgian':            '0/0f/Flag_of_Georgia.svg/23px-Flag_of_Georgia.svg.png',
			'German':              'b/ba/Flag_of_Germany.svg/23px-Flag_of_Germany.svg.png',
			'Greek':               '5/5c/Flag_of_Greece.svg/23px-Flag_of_Greece.svg.png',
			'Greenlandic':         '0/09/Flag_of_Greenland.svg/23px-Flag_of_Greenland.svg.png',
			'Haitian Creole':      '5/56/Flag_of_Haiti.svg/23px-Flag_of_Haiti.svg.png',
			'Hawaiian':            'e/ef/Flag_of_Hawaii.svg/23px-Flag_of_Hawaii.svg.png',
			'Hebrew':              'd/d4/Flag_of_Israel.svg/21px-Flag_of_Israel.svg.png',
			'Hungarian':           'c/c1/Flag_of_Hungary.svg/23px-Flag_of_Hungary.svg.png',
			'Icelandic':           'c/ce/Flag_of_Iceland.svg/21px-Flag_of_Iceland.svg.png',
			'Indonesian':          '9/9f/Flag_of_Indonesia.svg/23px-Flag_of_Indonesia.svg.png',
			'Irish':               '4/45/Flag_of_Ireland.svg/23px-Flag_of_Ireland.svg.png',
			'Italian':             '0/03/Flag_of_Italy.svg/23px-Flag_of_Italy.svg.png',
			'Japanese':            '9/9e/Flag_of_Japan.svg/23px-Flag_of_Japan.svg.png',
			'Kazakh':              'd/d3/Flag_of_Kazakhstan.svg/23px-Flag_of_Kazakhstan.svg.png',
			'Korean':              '0/09/Flag_of_South_Korea.svg/23px-Flag_of_South_Korea.svg.png',
			'Kurdish':             '3/35/Flag_of_Kurdistan.svg/23px-Flag_of_Kurdistan.svg.png',
			'Central Kurdish':     '3/35/Flag_of_Kurdistan.svg/23px-Flag_of_Kurdistan.svg.png',
			'Northern Kurdish':    '3/35/Flag_of_Kurdistan.svg/23px-Flag_of_Kurdistan.svg.png',
			'Laotian':             '5/56/Flag_of_Laos.svg/23px-Flag_of_Laos.svg.png',
			'Latvian':             '8/84/Flag_of_Latvia.svg/23px-Flag_of_Latvia.svg.png',
			'Lithuanian':          '1/11/Flag_of_Lithuania.svg/23px-Flag_of_Lithuania.svg.png',
			'Luxembourgish':       'd/da/Flag_of_Luxembourg.svg/23px-Flag_of_Luxembourg.svg.png',
			'Macedonian':          '7/79/Flag_of_North_Macedonia.svg/23px-Flag_of_North_Macedonia.svg.png',
			'Malagasy':            'b/bc/Flag_of_Madagascar.svg/23px-Flag_of_Madagascar.svg.png',
			'Malay':               '6/66/Flag_of_Malaysia.svg/23px-Flag_of_Malaysia.svg.png',
			'Maltese':             '7/73/Flag_of_Malta.svg/23px-Flag_of_Malta.svg.png',
			'Mandarin':            'f/fa/Flag_of_the_People%27s_Republic_of_China.svg/23px-Flag_of_the_People%27s_Republic_of_China.svg.png',
			'Manx':                'b/bc/Flag_of_the_Isle_of_Man.svg/23px-Flag_of_the_Isle_of_Man.svg.png',
			'Marshallese':         '2/2e/Flag_of_the_Marshall_Islands.svg/23px-Flag_of_the_Marshall_Islands.svg.png',
			'Mauritian Creole':    '7/77/Flag_of_Mauritius.svg/23px-Flag_of_Mauritius.svg.png',
			'Moldovan':            '2/27/Flag_of_Moldova.svg/23px-Flag_of_Moldova.svg.png',
			'Mongolian':           '4/4c/Flag_of_Mongolia.svg/23px-Flag_of_Mongolia.svg.png',
			'Montenegrin':         '6/64/Flag_of_Montenegro.svg/23px-Flag_of_Montenegro.svg.png',
			'Nauruan':             '3/30/Flag_of_Nauru.svg/23px-Flag_of_Nauru.svg.png',
			'Nepalese':            '9/9b/Flag_of_Nepal.svg/16px-Flag_of_Nepal.svg.png',
			'Norwegian Bokmål':    'd/d9/Flag_of_Norway.svg/21px-Flag_of_Norway.svg.png',
			'Norwegian Nynorsk':   'd/d9/Flag_of_Norway.svg/21px-Flag_of_Norway.svg.png',
			'Occitan':             '6/6d/Flag_of_Occitania_(with_star).svg/23px-Flag_of_Occitania_(with_star).svg.png',
			'Oromo':               '7/71/Flag_of_Ethiopia.svg/23px-Flag_of_Ethiopia.svg.png',
			'Pennsylvania German': 'f/f7/Flag_of_Pennsylvania.svg/23px-Flag_of_Pennsylvania.svg.png',
			'Persian':             'c/ca/Flag_of_Iran.svg/23px-Flag_of_Iran.svg.png',
			'Polish':              '1/12/Flag_of_Poland.svg/23px-Flag_of_Poland.svg.png',
			'Portuguese':          '5/5c/Flag_of_Portugal.svg/23px-Flag_of_Portugal.svg.png',
			'Romanian':            '7/73/Flag_of_Romania.svg/23px-Flag_of_Romania.svg.png',
			'Romansch':            'f/f3/Flag_of_Switzerland.svg/16px-Flag_of_Switzerland.svg.png',
			'Russian':             'f/f3/Flag_of_Russia.svg/23px-Flag_of_Russia.svg.png',
			'Scots':               '1/10/Flag_of_Scotland.svg/23px-Flag_of_Scotland.svg.png',
			'Scottish Gaelic':     '1/10/Flag_of_Scotland.svg/23px-Flag_of_Scotland.svg.png',
			'Serbo-Croatian':      '6/61/Flag_of_Yugoslavia_(1946-1992).svg/23px-Flag_of_Yugoslavia_(1946-1992).svg.png',
			'Sicilian':            'b/ba/Flag_of_Sicily_%28revised%29.svg/23px-Flag_of_Sicily_%28revised%29.svg.png',
			'Slovak':              'e/e6/Flag_of_Slovakia.svg/23px-Flag_of_Slovakia.svg.png',
			'Slovakian':           'e/e6/Flag_of_Slovakia.svg/23px-Flag_of_Slovakia.svg.png',
			'Slovene':             'f/f0/Flag_of_Slovenia.svg/23px-Flag_of_Slovenia.svg.png',
			'Somali':              'a/a0/Flag_of_Somalia.svg/23px-Flag_of_Somalia.svg.png',
			'Spanish':             '9/9a/Flag_of_Spain.svg/23px-Flag_of_Spain.svg.png',
			'Swedish':             '4/4c/Flag_of_Sweden.svg/23px-Flag_of_Sweden.svg.png',
			'Taiwanese':           '7/72/Flag_of_the_Republic_of_China.svg/23px-Flag_of_the_Republic_of_China.svg.png',
			'Thai':                'a/a9/Flag_of_Thailand.svg/23px-Flag_of_Thailand.svg.png',
			'Turkish':             'b/b4/Flag_of_Turkey.svg/23px-Flag_of_Turkey.svg.png',
			'Ukrainian':           '4/49/Flag_of_Ukraine.svg/23px-Flag_of_Ukraine.svg.png',
			'Uzbek':               '8/84/Flag_of_Uzbekistan.svg/23px-Flag_of_Uzbekistan.svg.png',
			'Venetian':            'd/d5/Flag_of_Veneto.svg/23px-Flag_of_Veneto.svg.png',
			'Vietnamese':          '2/21/Flag_of_Vietnam.svg/23px-Flag_of_Vietnam.svg.png',
			'Welsh':               'a/a9/Flag_of_Wales_%281959%E2%80%93present%29.svg/23px-Flag_of_Wales_%281959%E2%80%93present%29.svg.png',
		}
	}
	
});
})(jQuery.noConflict());
