// ==UserScript==
// @name           Royal Mail addresses extract
// @namespace      sjorford@gmail.com
// @version        2021.07.04.0
// @author         Stuart Orford
// @match          https://www.royalmail.com/find-a-postcode
// @grant          none
// @require        https://code.jquery.com/jquery-3.4.1.min.js
// @run-at         document-idle
// ==/UserScript==

$(function() {
	
	$(`<style>
		
	</style>`).appendTo('head');
	
	var postcodes = [];
	$.each([1,2,3,4], (i,n) => {
		$.each('ABDEFGHJLNPQRSTUWXYZ'.split(''), (i,a) => {
			$.each('ABDEFGHJLNPQRSTUWXYZ'.split(''), (i,b) => {
				postcodes.push('CW12 '+n+a+b);
			});
		});
	});
	
	// scripts run 3 times, don't ask me why
	var input = $('#edit-rml-postcode-finder-postal-code').focus();
	if (input.length == 0) return;
	
	var timer;
	window.sjoTimer = timer;
	var postcode;
	
	var output = $('<textarea></textarea>').appendTo('body');
	
	inputNextPostcode();
	
	function inputNextPostcode() {
		postcode = postcodes.shift();
		input.val(postcode);
		$('.pcaitem').addClass('sjo-dirty');
		timer = window.setInterval(checkDropdown, 50);
	}
	
	function checkDropdown() {
		
		// Find new items
		var items = $('.pcaitem').not('.sjo-dirty');
		if (items.length > 0) {
			
			// Mark found items as dirty
			items.addClass('sjo-dirty');
			
			// Find items matching current postcode
			var matchingItems = items.filter((i,e) => e.innerText.trim().match(postcode));
			
			// If "More Addresses", click it and wait for dropdown to change again
			if (matchingItems.is('.pcaexpandable')) {
				matchingItems.first().click();
				return;
			}
			
			// ...otherwise clear the timer
			window.clearInterval(timer);
			
			// If no matching items, go to next postcode
			if (matchingItems.length == 0) {
				inputNextPostcode();
				return;
			}
			
			// Save addresses
			matchingItems.find('.pcadescription').before('¬');
			var addresses = matchingItems.toArray().map(e => e.innerText.trim().replace('¬', '\t'));
			console.log(addresses);
			output.append(addresses.join('\n') + '\n')
			inputNextPostcode();
			
		}
		
	}
	
});
