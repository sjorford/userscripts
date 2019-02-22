// ==UserScript==
// @name        Twitter auto add to list
// @namespace   sjorford@gmail.com
// @include     https://twitter.com/*
// @version     2019.02.22.1
// @grant       none
// @require     https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// ==/UserScript==

$(function() {
	
	// Export list members
	function exportListMembers() {
		$('.sjo-list-members').remove();
		var table = $('<table class="sjo-list-members"></table>').appendTo('body');
		var users = $('.activity-user-profile-content').each((i, e) => {
			var user = $(e);
			var row = $('<tr></tr>').appendTo(table);
			$('<td></td>').text(user.find('.username b').text()).appendTo(row);
			$('<td></td>').text(user.find('.fullname').text()).appendTo(row);
			$('<td></td>').text(user.find('.bio').text()).appendTo(row);
		});
		return users.length;
	}
	
	window.sjoExportListMembers = exportListMembers;

	// Check "Local parties" list
	window.setInterval(addToList, 200);
	
	function addToList() {
		//console.log('anything to click?');

		var menuItem = $('.list-text').not('.sjo-clicked').filter(':visible');
		if (menuItem.length > 0) {
			//console.log('clicking menu item!');
			menuItem.addClass('sjo-clicked').click();
			return;
		}

		var checkbox = $('#list_1090883244713742336').not('.sjo-clicked').filter(':visible');
		if (checkbox.length > 0) {
			if (checkbox.is(':checked')) {
				//console.log('checkbox already checked');
				checkbox.addClass('sjo-clicked');
			} else {
				//console.log('clicking checkbox!');
				checkbox.addClass('sjo-clicked').click();
			}
			checkbox.closest('.modal-content').find('.modal-close').click();
			return;
		}

	}

});
