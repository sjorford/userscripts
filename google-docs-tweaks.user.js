// ==UserScript==
// @name        Google docs tweaks
// @namespace   sjorford@gmail.com
// @include     https://docs.google.com/spreadsheets*
// @version     2023.08.14.0
// @grant       none
// ==/UserScript==

(function() {
	
	var head = document.getElementsByTagName('head')[0];
	var style = document.createElement('style');
	style.innerText = `
		.docos-anchoreddocoview {top: 0px !important; left: 0px !important;}
	`;
	head.append(style);
	
})();
