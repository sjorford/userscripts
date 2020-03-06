// ==UserScript==
// @name         Electoral Commission tweaks
// @namespace    sjorford@gmail.com
// @version      2020.03.06.0
// @author       Stuart Orford
// @match        http://search.electoralcommission.org.uk/Search/Registrations?*
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

$(function() {
	
	$('#panelCommon, #panelCriteria, .panel-heading').remove();
	$('.panel-body').unwrap();
	
	var filterCols = $('#divRegistrationSearchFilter > form > .row > .col-sm-3');
	filterCols.eq(2).empty().append(filterCols.eq(1).contents());
	filterCols.eq(1).append(filterCols.eq(0).find('.control-group').last());
	
});
