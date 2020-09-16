	// ================================================================
	// Rugby League Project
	// ================================================================
	
	function rugbyLeagueProjectURLs($) {
		var links = $('.list tr:has(h3)').first().nextUntil('tr:has(h3)')
			.filter((i,e) => e.innerText.trim().match(/Bob /)).find('a');
		return links.toArray().map(a => a.href.replace(/\?.*/, ''));
	}
	
	function rugbyLeagueProjectPage($, doc) {
		console.log('Bob extracts', 'rugbyLeagueProjectPage');
		var data = {};
		
		data.sport = 'Rugby league';
		data.name = doc.filter('h1').text().trim();
		
		// Get nationality from international matches
		data.nationality = [...new Set(
			$('.list tr:contains("International")', doc)
				.nextUntil('tr:contains("Club Career")')
				.find('.text a')
				.toArray().map(a => a.innerText.trim()))].join(', ');
		
		$('.stats dt', doc).each((i,e) => {
			var fieldName = $(e).text().trim();
			var fieldValue = $(e).next('dd').text().trim();
			var matchDate = fieldValue.match(/.*?\d{4}/);
			if (fieldName == 'Full Name') {
				data.fullName = fieldValue;
			} else if (fieldName == 'Born') {
				if (matchDate) data.dateOfBirth = $.sjo.cleanDate(matchDate[0]);
			} else if (fieldName == 'Died') {
				if (matchDate) data.dateOfDeath = $.sjo.cleanDate(matchDate[0]);
			}
		});

		$('.total td:nth-of-type(2)', doc).each((i,e) => {
			var match = $(e).text().trim().match(/^(\d{4})(?:\D+(\d{4}))?$/);
			var yearFrom = match[1] - 0;
			var yearTo   = match[2] ? match[2] - 0 : yearFrom;
			if (!data.yearFrom || yearFrom < data.yearFrom) data.yearFrom = yearFrom;
			if (!data.yearTo   || yearTo   > data.yearTo)   data.yearTo   = yearTo;
		});
		
		return data;
	}
	