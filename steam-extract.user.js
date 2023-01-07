// ==UserScript==
// @name           Steam extract
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @version        2023.01.07.0
// @match          https://steamcommunity.com/profiles/76561198057191932/games/*
// @match          https://steamcommunity.com/profiles/76561198057191932/games?*
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
			myAchievements = [];
			$('.achieveRow', doc).each((i,e) => {
				var row = $(e);
				var unlockText = $('.achieveUnlockTime', row).text().trim();
				if (unlockText) {
					var name = $('.achieveTxt h3', row).text();
					var desc = $('.achieveTxt h5', row).text();
					var img = $('.achieveImgHolder img', row).attr('src');
					var unlock = unlockText.match(/^Unlocked (\d\d? [A-Z][a-z][a-z](?:, \d\d\d\d)?)/)[1];
					myAchievements.push({name: name, desc: desc, img: img, unlock: unlock});
				}
			});
			if (globalAchievements) outputTable();
		}
		
		function processGlobalAchievements(data) {
			var doc = $(data);
			console.log('processGlobalAchievements', doc);
			globalAchievements = [];
			$('.achieveRow', doc).each((i,e) => {
				var row = $(e);
				var name = $('.achieveTxt h3', row).text();
				var desc = $('.achieveTxt h5', row).text();
				var img = $('.achieveImgHolder img', row).attr('src');
				var percent = $('.achievePercent', row).text();
				globalAchievements.push({name: name, desc: desc, img: img, percent: percent});
			});
			if (myAchievements) outputTable();
		}
		
		function outputTable() {
			console.log('myAchievements', myAchievements);
			console.log('globalAchievements', globalAchievements);
			
			$.each(myAchievements, (index, mine) => {
				$.each(globalAchievements, (index, global) => {
					if (global.matched) return;
					if (global.name == mine.name && global.img == mine.img) {
						if (global.desc == mine.desc || global.desc == '') {
							global.unlock = mine.unlock;
							if (global.desc == '') global.desc = mine.desc;
							global.matched = true;
							mine.matched = true;
						}
					}
				});
			});
			
			// Add my unmatched achievements
			$.each(myAchievements, (key, mine) => {
				if (mine.matched) return;
				mine.percent = '#N/A';
				globalAchievements.push(mine);
			});
			
			// Mark duplicate names
			$.each(globalAchievements, (key, global) => {
				var dupes = $.grep(globalAchievements, (data,i) => data.name.toLowerCase() == global.name.toLowerCase());
				if (dupes.length > 1) {
					$.each(dupes, (i,data) => data.dupe = i + 1);
				}
			});
			
			console.log('globalAchievements', globalAchievements);
			$.each(globalAchievements, (i,data) => {
				var name = data.name + (data.dupe ? ' [' + data.dupe + ']' : '');
				var row = $('<tr></tr>').appendTo(table);
				$('<td></td>').text(gameName).appendTo(row);
				$('<td></td>').appendTo(row);
				$('<td></td>').text(name).appendTo(row);
				$('<td></td>').text(data.unlock).appendTo(row);
				$('<td></td>').text(data.desc).appendTo(row);
				$('<td></td>').text(data.percent).appendTo(row);
			});
		}
		
		return false;
	});
	
	// Extract list of games with playtimes
	$('#gameslist_sort_options').before('<div><a href="#" class="sjo-extract-games">Extract list</a></div>');
	$('.sjo-extract-games').click(event => {
		event.preventDefault();
		var table  = $('<table class="sjo-table"></table>')
				.appendTo('body').wrap('<div class="sjo-wrapper"></div>')
				.click(event => table.selectRange());
		$('.gameListRow').each((i,e) => {
			var gameName = $('.gameListRowItemName', e).text().trim();
			var hours = $('.hours_played', e).text().trim().match(/^[\d\.]+|/)[0];
			var row = $('<tr></tr>').appendTo(table);
			$('<td></td>').text(gameName).appendTo(row);
			$('<td></td>').text(hours).appendTo(row);
		});
		return false;
	});
	
});
})(jQuery.noConflict());
