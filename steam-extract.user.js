// ==UserScript==
// @name           Steam extract
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @version        2021.01.12.2
// @match          https://steamcommunity.com/profiles/76561198057191932/games/*
// @grant          none
// @require        https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// @require        https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// ==/UserScript==

(function($) {
$(function() {
	
	$(`<style>
	.sjo-wrapper {
		position: fixed;
		width: 100%;
		height: 200px;
		bottom: 0px;
		left: 0px;
		background-color: white;
		font-size: 9pt;
		z-index: 9999;
		overflow: scroll;
	}
	</style>`).appendTo('head');
	
	var table;
	var games = $('.gameListRow:contains("View Stats")');
	games.find('.bottom_controls').append('<a class="pullup_item sjo-extract" href="#"><div class="menu_ico"><img src="https://community.cloudflare.steamstatic.com/public/images/skin_1/ico_stats.png" width="16" height="16" border="0"></div>Extract stats</a>');
	
	$('.sjo-extract').click(event => {
		event.preventDefault();
		
		var gameRow = $(event.target).closest('.gameListRow')
		var gameID = gameRow.attr('id').replace(/^game_/, '');
		var gameName = gameRow.find('.gameListRowItemName').text();
		
		var myAchievements = null, globalAchievements = null;
		
		if (table) {
			table.empty();
		} else {
			table = $('<table class="sjo-table"></table>')
				.appendTo('body').wrap('<div class="sjo-wrapper"></div>')
				.click(event => table.selectRange());
		}
		
		$.get(`https://steamcommunity.com/profiles/76561198057191932/stats/${gameID}/?tab=achievements`, processMyAchievements);
		$.get(`https://steamcommunity.com/stats/${gameID}/achievements/`, processGlobalAchievements);
		
		function processMyAchievements(data) {
			var doc = $(data);
			console.log('processMyAchievements', doc);
			myAchievements = {};
			$('.achieveRow', doc).each((i,e) => {
				var row = $(e);
				var unlockText = $('.achieveUnlockTime', row).text();
				if (unlockText) {
					var name = $('.achieveTxt h3', row).text();
					var desc = $('.achieveTxt h5', row).text();
					console.log(unlockText);
					var unlock = unlockText.trim().match(/^Unlocked (\d\d? [A-Z][a-z][a-z](?:, \d\d\d\d)?)/)[1];
					var key = name + '|' + desc;
					myAchievements[key] = {name: name, desc: desc, unlock: unlock};
				}
			});
			if (globalAchievements) outputTable();
		}
		
		function processGlobalAchievements(data) {
			var doc = $(data);
			console.log('processGlobalAchievements', doc);
			globalAchievements = {};
			$('.achieveRow', doc).each((i,e) => {
				var row = $(e);
				var name = $('.achieveTxt h3', row).text();
				var desc = $('.achieveTxt h5', row).text();
				var percent = $('.achievePercent', row).text();
				var key = name + '|' + desc;
				globalAchievements[key] = {name: name, desc: desc, percent: percent};
			});
			if (myAchievements) outputTable();
		}
		
		function outputTable() {
			console.log('myAchievements', myAchievements);
			console.log('globalAchievements', globalAchievements);
			$.each(globalAchievements, (key, global) => {
				var mine = myAchievements[key];
				var row = $('<tr></tr>').appendTo(table);
				$('<td></td>').text(gameName).appendTo(row);
				$('<td></td>').appendTo(row);
				$('<td></td>').text(global.name).appendTo(row);
				$('<td></td>').text(mine ? mine.unlock : '').appendTo(row);
				$('<td></td>').text(global.desc).appendTo(row);
				$('<td></td>').text(global.percent).appendTo(row);
			});
		}
		
		return false;
	});
	
});
})(jQuery.noConflict());
