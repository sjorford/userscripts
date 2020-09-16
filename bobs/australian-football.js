	// ================================================================
	// AustralianFootball.com
	// ================================================================
	
	function australianFootballURLs($) {
		var links = $('.found_box a').filter((i,e) => e.textContent.trim().match(/, Bob( |$)/));
		return links.toArray().map(a => a.href);
	}
	
	function australianFootballPage($, doc, url) {
		console.log('Bob extracts', 'australianFootballPage');
		var data = {};
		
		data.sport = 'Aussie rules';
		data.name = $('.main_players h2', doc).first().text().trim();
		
		function getKeyFacts(fieldName) {
			return $('strong', doc).filter((i,e) => e.textContent.trim() == fieldName)
				.closest('p').find('strong').detach().end().text().trim();
		}
		
		data.fullName = getKeyFacts('Full name');
		data.dateOfBirth = $.sjo.cleanDate(getKeyFacts('Born'));
		data.dateOfDeath = $.sjo.cleanDate(getKeyFacts('Died'));
		
		var match = $('.totals_row td:nth-of-type(2)', doc).text().trim().match(/^(\d{4})(?:.+(\d{4}))?$/);
		if (match) {
			data.yearFrom = match[1] - 0;
			data.yearTo   = match[2] ? match[2] - 0 : data.yearFrom;
		}
		
		return data;
	}
	