	// ================================================================
	// PGA Tour
	// ================================================================
	
	function pgaTourURLs($) {
		return ['https://statdata.pgatour.com/players/player.json'];
	}
	
	function pgaTourPage($, doc, url) {
		console.log('Bob extracts', 'pgaTourPage');
		var data = {};
		
		// JSON file containing all players
		if (url.match(/player.json/)) {
			data.type = 'urls';
			data.urls = [];
			doc.plrs.filter(player => player.nameF.match(/^Bob\b/)).forEach(player => {
				data.urls.push(`https://statdata-api-prod.pgatour.com/api/clientfile/career?P_ID=${player.pid}&format=json`);
				data.urls.push(`https://www.pgatour.com/players/player.${player.pid}.html`);
			});
			return data;
		}
		
		// JSON file per player with competition years
		if (url.match(/clientfile/)) {
			data.type = 'partial';
			doc.plrs[0].tours.forEach(tour => {
				var yearFrom = tour.detail[0].year
				var yearTo   = tour.detail[tour.detail.length - 1].year
				if (!data.yearFrom || yearFrom < data.yearFrom) data.yearFrom = yearFrom;
				if (!data.yearTo   || yearTo   < data.yearTo  ) data.yearTo   = yearTo;
			});
			return data;
		}
		
		// Player web page
		data.sport = 'Golf';
		data.name = $('#playersListContainer h1', doc).text().trim();
		data.nationality = $('.country', doc).text().trim();
		
		function getKeyFacts(fieldName) {
			return $('.s-bottom-text', doc).filter((i,e) => e.textContent.trim() == fieldName)
				.prev('.s-top-text').text().trim();
		}
		
		data.dateOfBirth = $.sjo.cleanDate(getKeyFacts('Birthday'));
		data.dateOfDeath = $.sjo.cleanDate(getKeyFacts('Deceased'));
		
		return data;
	}
