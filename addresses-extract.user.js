// ==UserScript==
// @name           Addresses extract
// @namespace      sjorford@gmail.com
// @version        2021.06.26.0
// @author         Stuart Orford
// @match          https://addressesandpostcodes.co.uk/area/*
// @grant          none
// ==/UserScript==

$(function() {
	
	$(`<style>
	</style>`).appendTo('head');
	
	var urls = [window.location.href];
	var addresses = [];
	
	$(document.body).data('sjo', {
		urls: urls,
		addresses: addresses,
		report: function() {
			console.log(urls.length + ' urls in queue, ' + addresses.length + ' addresses found');
		},
	});
	
	getNextPage();
	
	function getNextPage() {
		
		if (urls.length == 0) {
			console.log(addresses);
			$('<table>' 
			  + $(document.body).data('sjo').addresses.map(o => `<tr><td>${o.type}</td><td>${o.address}</td></tr>`).join('\n') 
			  + '</table>').appendTo('body')
			alert('extract complete');
			return;
		}
		
		var url = urls.pop();
		//console.log('downloading ' + url);
		$.get(url, parsePage);
		
	}
	
	function parsePage(data) {
		var doc = $(data);
		//console.log(doc);
		
		var buttons = $('a.btn[href*="area"]', doc);
		//console.log(buttons);
		
		if (buttons.length > 0) {
			urls = urls.concat(buttons.toArray().map(a => a.href));
			//console.log(urls);
			window.setTimeout(getNextPage, 0);
			return;
		}
		
		$('.card', doc).each((i,e) => {
			var header = $('.card-header', e);
			var type = header.text().match(/Residential Addresses|Businesses/);
			$('.list-group-item', e).each((i,e) => {
				addresses.push({
					type: type,
					address: $(e).text().trim(),
				});
			});
		});
		//console.log(addresses.length + ' addresses found');
		window.setTimeout(getNextPage, 0);
		return;
		
	}
	
});
