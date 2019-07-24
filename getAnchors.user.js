// ==UserScript==
// @name           getAnchors
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @version        2019.07.24.1
// @include        *
// @grant          none
// @require        https://raw.githubusercontent.com/sjorford/js/master/getSelectedNodes.js
// ==/UserScript==

// Load jQuery only if it is not already present
// https://stackoverflow.com/questions/6813114/how-can-i-load-jquery-if-it-is-not-already-loaded
if (!window.jQuery) {
	var script = document.createElement('script'); 
    script.src = '//code.jquery.com/jquery-3.4.1.min.js';
    document.head.appendChild(script);
	console.log(`loading ${script.src} on page ${window.location.href}`);
}

window.getAnchors = getAnchors;
window.getSelectedNodes = getSelectedNodes;

function getAnchors() {
	return jQuery(getSelectedNodes()).filter('a');
}
