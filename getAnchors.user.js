// ==UserScript==
// @name           getAnchors
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @version        1
// @include        *
// @grant          none
// @require        https://code.jquery.com/jquery-3.4.1.min.js
// @require        https://raw.githubusercontent.com/sjorford/js/master/getSelectedNodes.js
// ==/UserScript==

window.getAnchors = getAnchors;
window.getSelectedNodes = getSelectedNodes;

function getAnchors() {
	return $(getSelectedNodes()).filter('a');
}
