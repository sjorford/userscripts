	// ================================================================
	// ESPNscrum
	// ================================================================
	
	function espnScrumURLs() {
		var links = $('#gurusearch_player tr')
			.filter((i,e) => e.innerText.trim().match(/\(Bob /)).find('a');
		return links.toArray().map(a => a.href.replace(/\?.*/, ''));
	}
	
	function espnScrumPage(doc) {
		console.log('Bob extracts', 'espnScrumPage');
		var data = {};
		
		data.sport = 'Rugby union';
		data.name = doc.find('.scrumPlayerName').text().trim();
		data.nationality = doc.find('.scrumPlayerCountry').text().trim();
		
		$('.scrumPlayerDesc', doc).each((i,e) => {
			var fieldName = $('b', e).detach().text().trim();
			var fieldValue = $(e).text().trim();
			var matchDate = fieldValue.match(/.*?\d{4}/);
			if (fieldName == 'Full name') {
				data.fullName = fieldValue;
			} else if (fieldName == 'Born') {
				if (matchDate) data.dateOfBirth = $.sjo.cleanDate(matchDate[0]);
			} else if (fieldName == 'Died') {
				if (matchDate) data.dateOfDeath = $.sjo.cleanDate(matchDate[0]);
			}
		});
		
		$('.engineTable', doc).filter(':contains("Test career"), :contains("English Premiership")')
			.find('tbody tr').each((i,e) => {
				var match = $('td', e).eq(1).text().trim().match(/^(\d{4})\D+(\d{4})$/);
				var yearFrom = match[1] - 0;
				var yearTo   = match[2] - 0;
				if (!data.yearFrom || yearFrom < data.yearFrom) data.yearFrom = yearFrom;
				if (!data.yearTo   || yearTo   > data.yearTo)   data.yearTo   = yearTo;
			});
		
		return data;
	}
	