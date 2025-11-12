// ==UserScript==
// @name           Steam extract
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @version        2025.11.12.0
// @match          https://steamcommunity.com/profiles/76561198057191932/games/*
// @match          https://steamcommunity.com/profiles/76561198057191932/games?*
// @match          https://steamcommunity.com/id/sjorford/games/*
// @match          https://steamcommunity.com/id/sjorford/games?*
// @grant          none
// @require        https://code.jquery.com/jquery-3.4.1.min.js
// @require        https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// ==/UserScript==

(function($) {
$(function() {
	
	var debug = false;
	
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
		color: black;
	}
	</style>`).appendTo('head');
	
	var table;
	var games;
	
	var timer = window.setInterval(checkForGames, 1000);
	
	function checkForGames() {
		games = $('span:contains("My Game Stats")');
		if (debug) console.log('games', games);
		if (games.length > 0) {
			//window.clearInterval(timer)
			addButtons();
		}
	}
	
	function addButtons() {
		if (debug) console.log('addButtons');
		var wrappers = games.parent('button').parent('div');
		if (debug) console.log('wrappers', wrappers);
		var template = wrappers.children('button').first();
		var classes = template.attr('class');
		wrappers.each((i,e) => {
			var wrapper = $(e);
			if (wrapper.find('.sjo-extract').length > 0) return;
			$('<a class="sjo-extract" href="#">Extract stats</a>').addClass(classes).appendTo(wrapper).click(extractStats);
		});
	}
	
	function extractStats(event) {
		event.preventDefault();
		
		var button = $(event.target);
		var gameRow = button.parent('div').parent('div');
		if (debug) console.log(gameRow);
		var gameLink = gameRow.children('span').children('a');
		if (debug) console.log(gameLink);
		var gameID = gameLink.attr('href').match(/\d+/)[0];
		var gameName = gameLink.text();
		if (debug) console.log(gameID, gameName);
		
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
			if (debug) console.log('processMyAchievements', doc);
			myAchievements = [];
			$('.achieveRow', doc).each((i,e) => {
				var row = $(e);
				var unlockText = $('.achieveUnlockTime', row).text().trim();
				if (unlockText) {
					var name = $('.achieveTxt h3', row).text().trim();
					var desc = $('.achieveTxt h5', row).text().trim();
					var img = $('.achieveImgHolder img', row).attr('src').match(/[^\/]+$/)[0];
					var unlock = unlockText.match(/^Unlocked (\d\d? [A-Z][a-z][a-z](?:, \d\d\d\d)?)/)[1];
					myAchievements.push({name: name, desc: desc, img: img, unlock: unlock});
				}
			});
			if (globalAchievements) outputTable();
		}
		
		function processGlobalAchievements(data) {
			var doc = $(data);
			if (debug) console.log('processGlobalAchievements', doc);
			globalAchievements = [];
			$('.achieveRow', doc).each((i,e) => {
				var row = $(e);
				var name = $('.achieveTxt h3', row).text().trim();
				var desc = $('.achieveTxt h5', row).text().trim();
				var img = $('.achieveImgHolder img', row).attr('src').match(/[^\/]+$/)[0];
				var percent = $('.achievePercent', row).text().trim();
				globalAchievements.push({name: name, desc: desc, img: img, percent: percent});
			});
			if (myAchievements) outputTable();
		}
		
		function outputTable() {
			if (debug) console.log('myAchievements', myAchievements);
			if (debug) console.log('globalAchievements', globalAchievements);
			
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
			
			if (debug) console.log('globalAchievements', globalAchievements);
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
	}
	
	/*
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
	*/
	
});
})(jQuery.noConflict());
