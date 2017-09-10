function formatPartySelects(selector) {
	
	var original = $('#sjo-party-select-original');
	if (original.length == 0) {
		original = $('<select id="sjo-party-select-original"></select>').appendTo('body');
	}

	var trimmed = $('#sjo-party-select-trimmed');
	if (trimmed.length == 0) {
		trimmed = $('<select id="sjo-party-select-trimmed"></select>').appendTo('body');
	}
	
	var selects = $(selector);
	var html = selects.eq(0).html();
	
	original.html(html);
	
	html = html.replace(/\((\d+) candidates\)/g, '[$1]');
	if (knownPartiesOnly) {
		html = html.replace(/<optgroup label="(.*?)">[^<]+(<option value="\d+">)[^<]+(<\/option>)[\s\S]*?<\/optgroup>/g, '$2$1$3');
		html = html.replace(/<option value="\d+">[^<\[\]]+<\/option>/g, '');
	}
	
	trimmed.html(html);
	selects.html(html);

}
