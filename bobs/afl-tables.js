	// ================================================================
	// AFL Tables
	// ================================================================
	
	function aflTablesURLs($) {
		var links = $('a').filter((i,e) => e.href.match(/\d{4}s?\.html$/));
		return links.toArray().map(a => a.href.replace(/s\.html$/, '.html'));
	}
	
	function aflTablesPage($, doc, url) {
		console.log('Bob extracts', 'aflTablesPage');
		var data = {};
		
		// Scrape player URLs from year summary pages
		if (!url.match(/players/)) {
			data.type = 'urls';
			data.urls = $('a[href^="players"]', doc).filter((i,e) => e.textContent.match(/, Bob(\s|$)/))
				.toArray().map(a => a.href);
			return data;
		}
		
		data.sport = 'Aussie rules';
		data.name = $('h1', doc).text().trim();
		
		try {
			data.dateOfBirth = $('b', doc).filter((i,e) => e.textContent.trim() == 'Born:')[0].nextSibling.textContent.replace(/[-\(]/g, ' ').trim();
		} catch (error) {
		}
		
		try {
			data.dateOfDeath = $('b', doc).filter((i,e) => e.textContent.trim() == 'Died:')[0].nextSibling.textContent.replace(/[-\(]/g, ' ').trim();
		} catch (error) {
		}
		
		var links = $('a', doc);
		var yearLinks = links.filter((i,e) => e.textContent.trim().match(/^\d{4}$/));
		data.yearFrom = yearLinks.first().text();
		data.yearTo   = yearLinks.last() .text();
		
		return data;
	}
	