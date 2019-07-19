// ==UserScript==
// @name           getAnchors
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @version        2019.07.19.1
// @include        *
// @grant          none
// @require        https://code.jquery.com/jquery-3.4.1.min.js
// @require        https://raw.githubusercontent.com/sjorford/js/master/getSelectedNodes.js
// ==/UserScript==

var jQuery = $.noConflict();

window.getAnchors = getAnchors;
window.getSelectedNodes = getSelectedNodes;

function getAnchors() {
	return jQuery(getSelectedNodes()).filter('a');
}
