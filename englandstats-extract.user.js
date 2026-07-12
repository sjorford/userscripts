// ==UserScript==
// @name           englandstats.com extract
// @namespace      sjorford@gmail.com
// @version        2026.07.12.0
// @author         Stuart Orford
// @match          https://www.englandstats.com/matches.php?mid=*
// @grant          none
// ==/UserScript==

(function() {
	
	// jQuery is loaded deferred
	var timer = window.setInterval(jQueryCheck, 100);

	function jQueryCheck() {
		if (!$) return;
		window.clearInterval(timer);
		$('<script src="https://sjorford.github.io/js/sjo-jq.js"></script>').appendTo('head');
		timer = window.setInterval(sjoQueryCheck, 100);
	}
	
	function sjoQueryCheck() {
		if (!$.fn.indexCells) return;
		window.clearInterval(timer);
		main();
	}
	
	function main() {
		
		var debug = true;
		
		$(`<style>
			.sjo-wrapper {
				position: fixed; left: 0px; bottom: 0px; height: 10em; width: 100%;
				font-size: small; background-color: white; border: 1px solid black;
				overflow: scroll; z-index: 9999999;
			}
		}
		</style>`).appendTo('head');
		
		// Create export table
		var wrapper = $('<div class="sjo-wrapper"></div>').appendTo('body');
		var table = $('<table class="sjo-table"></table>').appendTo(wrapper)
						.click(event => table.selectRange());
		
		var positionCodes = {
			'Goalkeeper': 'GK',
			'Full Back': 'FB',
			'Half Back': 'HB',
			'Forward': 'F',
			'Right Back': 'RB',
			'Left Back': 'LB',
			'Outside Right': 'OR',
			'Inside Right': 'IR',
			'Centre Forward': 'CF',
			'Inside Left': 'IL',
			'Outside Left': 'OL',
			'Right Half': 'RH',
			'Centre Half': 'CH',
			'Left Half': 'LH',
			'Centre Back': 'CB',
			'Midfielder': 'M',
			'Right Winger': 'RW',
			'Left Winger': 'LW',
			'Attacking Midfielder': 'AM',
			'Defensive Midfielder': 'DM',
			'Right Forward': 'RF',
			'Left Forward': 'LF',
			'Sweeper': 'S',
			'Right Midfielder': 'RM',
			'Left Midfielder': 'LM',
			'Right Wing Back': 'RWB',
			'Left Wing Back': 'LWB',
			'Left Attacking Midfielder': 'LAM',
			'Right Attacking Midfielder': 'RAM',
		};
		
		$('.player-row a[href*="player.php?pid="]').each((i,e) => {
			
			var playerLink = $(e);
			var playerRow = playerLink.closest('.player-row');
			
			var shirtNo = playerRow.find('.num').text().trim();
			
			var playerID = playerLink.attr('href').match(/pid=(\d+)/)[1];
			var playerName = playerLink.text().trim();
			
			var playerInfo = playerLink.closest('.tooltip').find('.tooltiptext');
			var playerInfoParts = playerInfo.text().match(/^(.+), (\d+)\w\w of \d+ caps\s*(\d+) years, (\d+) days\s*(.*)$/);
			if (debug) console.log(playerInfo.text(), playerInfoParts);
			var clubName   = playerInfoParts[1];
			var capNo      = playerInfoParts[2];
			var ageYears   = playerInfoParts[3];
			var ageDays    = playerInfoParts[4];
			var position   = playerInfoParts[5];
			position = positionCodes[position] || position;
			
			var isCaptain = false;
			var captainNo = '';
			var captainInfo = playerRow.find('.capt');
			if (captainInfo.length > 0) {
				isCaptain = true;
				captainNo = captainInfo.text().trim().match(/^(\d+)\w\w captaincy$/)[1];
			}
			
			var isSub = false;
			var subTimeOn = '';
			var subTimeOff = '';
			var subImageOn = playerRow.find('.time[alt="On"]');
			if (subImageOn.length > 0) {
				isSub = true;
				if (debug) console.log(subImageOn, subImageOn.next('.tooltip'), subImageOn.next('.tooltip').text());
				var subTimeOnText = subImageOn.next('.tooltip').text() || subImageOn.closest('.info').text();
				subTimeOn = subTimeOnText.trim().match(/^(HT'?|\d+'|\d+'\+\d+')/)[1].replace(/'/g, '');
			}
			var subImageOff = playerRow.find('.time[alt="Off"]');
			if (subImageOff.length > 0) {
				if (debug) console.log(subImageOff, subImageOff.next('.tooltip'), subImageOff.next('.tooltip').text());
				var subTimeOffText = subImageOff.next('.tooltip').text() || subImageOff.closest('.info').text();
				subTimeOff = subTimeOffText.trim().match(/^(HT'?|\d+'|\d+'\+\d+')/)[1].replace(/'/g, '');
			}
			
			var cards = '';
			var cardTime1 = '';
			var cardTime2 = '';
			var cardImage = playerRow.find('.card[alt="Card"]');
			if (cardImage.length > 0) {
				var cardImageFile = cardImage.attr('src').match(/\/(.+)\.webp/)[1];
				if (debug) console.log(cardImage, cardImage.attr('src'), cardImageFile);
				cards = cardImageFile.replace(/c/g, '').toUpperCase();
				if (cards == 'YR') cards = 'YR?';    // both Y+Y and Y+R are displayed as Y+R, so mark this as ambiguous
				var cardTimeParts = cardImage.next('.small').text().trim().match(/^(\d+'|\d+'\+\d+')(?: & (\d+'|\d+'\+\d+'))?$/);
				cardTime1 = cardTimeParts[1].replace(/'/g, '');
				cardTime2 = (cardTimeParts[2] || '').replace(/'/g, '');
			}
			
			// Output to table
			var outputRow = $('<tr></tr>').appendTo(table);
			$('<td></td>').appendTo(outputRow).text(shirtNo);
			$('<td></td>').appendTo(outputRow).text(playerID);
			$('<td></td>').appendTo(outputRow).text(playerName);
			$('<td></td>').appendTo(outputRow).text(clubName);
			$('<td></td>').appendTo(outputRow).text(capNo);
			$('<td></td>').appendTo(outputRow).text(ageYears);
			$('<td></td>').appendTo(outputRow).text(ageDays);
			$('<td></td>').appendTo(outputRow).text(position);
			$('<td></td>').appendTo(outputRow).text(isCaptain ? 'capt' : '');
			$('<td></td>').appendTo(outputRow).text(captainNo);
			$('<td></td>').appendTo(outputRow).text(isSub ? 'sub' : '');
			$('<td></td>').appendTo(outputRow).text(subTimeOn);
			$('<td></td>').appendTo(outputRow).text(subTimeOff);
			$('<td></td>').appendTo(outputRow).text(cards);
			$('<td></td>').appendTo(outputRow).text(cardTime1);
			$('<td></td>').appendTo(outputRow).text(cardTime2);
			
		});
		
	}
	
})();
