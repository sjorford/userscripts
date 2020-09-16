
	// ================================================================
	// ESPNcricinfo
	// ================================================================
	
	// https://www.espncricinfo.com/search/_/type/players/q/bob
	// new search results page, only lists 50 Bobs
	function cricketURLs__BAD() {
		var links = $('.player__Results__Item a')
			.filter((i,e) => $('.LogoTile__Title', e).text().trim().match(/Bob /));
		return links.toArray().map(a => a.href);
	}
	
	function cricketURLs() {
		var links = $('a.ColumnistSmry')
			.filter((i,e) => e.innerText.trim().match(/\(Bob /));
		return links.toArray().map(a => a.href);
	}
	
	function cricketPage(doc) {
		console.log('Bob extracts', 'cricketPage');
		var data = {};
		
		data.sport = 'Cricket';
		data.name = doc.find('.ciPlayernametxt h1').text().trim();
		data.nationality = doc.find('.ciPlayernametxt h3').text().trim();
		
		$('.ciPlayerinformationtxt', doc).each((i,e) => {
			var fieldName = $('b', e).text().trim();
			var fieldValue = $('span', e).text().trim();
			var matchDate = fieldValue.match(/.*?\d{4}/);
			if (fieldName == 'Full name') {
				data.fullName = fieldValue;
			} else if (fieldName == 'Born') {
				if (matchDate) data.dateOfBirth = cleanDate(matchDate[0]);
			} else if (fieldName == 'Died') {
				if (matchDate) data.dateOfDeath = cleanDate(matchDate[0]);
			}
		});
		
		$('.ciPlayertextbottomborder:contains("Career statistics")', doc)
			.nextUntil('.ciPlayertextbottomborder', '.engineTable')
			.first().find('tr').each((i,e) => {
				var fieldName = $('td:first-of-type', e).text().trim();
				var fieldValue = $('td:last-of-type', e).text().trim();
				if (fieldName.match(/debut$/)) {
					var yearFrom = getYearFrom(fieldValue);
					if (!data.yearFrom || yearFrom < data.yearFrom) data.yearFrom = yearFrom;
				} else if (fieldName.match(/^Last/)) {
					var yearTo = getYearTo(fieldValue);
					if (!data.yearTo || yearTo > data.yearTo) data.yearTo = yearTo;
				} else if (fieldName.match(/span$/)) {
					var seasons = fieldValue.match(/^(\S+).*?(\S+)$/);
					var yearFrom = getYearFrom(seasons[1]);
					var yearTo   = getYearTo  (seasons[2]);
					if (!data.yearFrom || yearFrom < data.yearFrom) data.yearFrom = yearFrom;
					if (!data.yearTo   || yearTo   > data.yearTo)   data.yearTo   = yearTo;
				}
			});
		
		return data;
	}
	