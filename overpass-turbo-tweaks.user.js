// ==UserScript==
// @name           overpass turbo tweaks
// @namespace      sjorford@gmail.com
// @version        2021.04.27.0
// @author         Stuart Orford
// @match          https://overpass-turbo.eu/
// @grant          none
// @require        https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

(function($) {
$(function() {
	
	$(`<style>
		div.CodeMirror {font-size: 16pt;}
		div.CodeMirror span.CodeMirror-matchingbracket {color: orange;}
	</style>`).appendTo('head');
	
});
})(jQuery.noConflict());
