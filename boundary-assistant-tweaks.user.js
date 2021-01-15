// ==UserScript==
// @name         Boundary Assistant tweaks
// @namespace    sjorford@gmail.com
// @version      2020.01.15.0
// @author       Stuart Orford
// @match        https://boundaryassistant.org/PlanBuilder/index.html?v=1.52
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

(function($) {
$(function() {
	
	$(`<style>
		.sjo-label {margin-bottom: auto;}
	</style>`).appendTo('head');
	
	var timer = window.setInterval(addLabels, 1000);
	
	function addLabels() {
		console.log('addLabels');
		
		var inputs = $('input[name="constnum"]');
		if (inputs.length <= 1) return;
		
		console.log('addLabels', 'clearInterval');
		window.clearInterval(timer);
		
		inputs.each((i,e) => {
			console.log('addLabels', i);
			var input = $(e);
			var id = input.attr('id');
			if (!id) {
				id = 'sjo-constnum-' + i;
				input.attr('id', id);
			}
			input.closest('td').next('td').html((i,html) => `<label class="sjo-label" for="${id}">${html}</label>`);
		});
		
	}
	
	
	
	
});
})(jQuery.noConflict());
