var Utils = {};

$(`<style>
	#sjo-party-select-original, #sjo-party-select-trimmed {display: none;}
</style>`).appendTo('head');

// ================================================
// Show only active parties in dropdowns
// ================================================

(function() {
	
	var selects, original, trimmed;
	
	Utils.formatPartySelects = formatPartySelects;
	Utils.showAllParties = showAllParties;
	
	function formatPartySelects(selector) {
		
		original = $('#sjo-party-select-original');
		trimmed = $('#sjo-party-select-trimmed');
		
		if (original.length == 0) {
			
			original = $('<select id="sjo-party-select-original"></select>').appendTo('body');
			trimmed = $('<select id="sjo-party-select-trimmed"></select>').appendTo('body');
			
			selects = $(selector);
			var options = selects.eq(0).children();
			
			options.each((index, element) => {
				var option = $(element);
				
				if (option.is('optgroup')) {
					var match = option.attr('label').match(/([\s\S]*)\((\d+) candidates?\)([\s\S]*)/);
					if (match) {
						option.attr('label', match[1] + ' [' + match[2] + ']' + match[3]);
						var trimmedOption = option.children('option').first().clone().appendTo(trimmed);
						trimmedOption.text(trimmedOption.text() + ' [' + match[2] + ']' + match[3]);
					}
				}
				
				if (option.is('option')) {
					if (index == 0) {
						option.clone().appendTo(trimmed);
					} else {
						var match = option.text().match(/([\s\S]*)\((\d+) candidates?\)([\s\S]*)/);
						if (match) {
							option.text(match[1] + ' [' + match[2] + ']' + match[3]).clone().appendTo(trimmed);
						}
					}
				}
				
			});
			
			original.append(options);
			
		}
		
		selects.html(trimmed.html());
		
	}

	function showAllParties() {
		
		var checked = $('#sjo-allparties').prop('checked');
		
		selects.each((index, element) => {
			var select = $(element);
			var val = select.find(':selected').val();
			if (!checked && trimmed.find('option').filter((index, element) => element.value == val).length == 0) {
				original.find('option').filter((index, element) => element.value == val).clone().appendTo(trimmed);
			}
		});

		var html = $(checked ? original : trimmed).html();
		
		selects.each((index, element) => {
			var select = $(element);
			var val = select.find(':selected').val();
			select.html(html).val(val);
		});
		
	}

})();

// ================================================
// Shorten organisation names
// ================================================

(function() {
	
	Utils.shortOrgName = shortOrgName;
	
	function shortOrgName(text) {
		var shortName = text.trim();
		shortName = shortName == 'City of London Corporation' ? 'City of London' : shortName;
		return shortName.replace(/^(Borough of |Borough Council of |London Borough of |Royal Borough of |City of |City and County of |Council of the |Comhairle nan )?(.+?)(( County| County Borough| Borough| Metropolitan Borough| Metropolitan District| District| City and District| City)? Council| Combined Authority)?$/, '$2');
	}
	
})();
