// ==UserScript==
// @name           Premier League tweaks
// @namespace      sjorford@gmail.com
// @version        2025.09.05.0
// @author         Stuart Orford
// @match          https://www.premierleague.com/*
// @grant          none
// @require        https://code.jquery.com/jquery-3.4.1.min.js
// @require        https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// ==/UserScript==

(function($) {
$(function() {
	
	$(`<style>
		body {padding-bottom: 10rem;}
		.sjo-wrapper {
			position: fixed; right: 0px; top: 0px; height: 30em; width: 30em;
			font-size: small; background-color: white; border: 1px solid black;
			overflow: scroll; z-index: 9999999;
		}
	</style>`).appendTo('head');
	
	if (window.location.pathname == '/en/players') {
		
		var posMap = {
			'Goalkeeper': 'GK',
			'Defender':   'DF',
			'Midfielder': 'MF',
			'Forward':    'FW',
		};
		
        var clubMap = {
            "Arsenal": "Arsenal",
            "Aston Villa": "Aston Villa",
            "Bournemouth": "Bournemouth",
            "Brentford": "Brentford",
            "Brighton and Hove Albion": "Brighton",
            "Burnley": "Burnley",
            "Chelsea": "Chelsea",
            "Crystal Palace": "Crystal Palace",
            "Everton": "Everton",
            "Fulham": "Fulham",
            "Leeds United": "Leeds",
            "Liverpool": "Liverpool",
            "Manchester City": "Man City",
            "Manchester United": "Man Utd",
            "Newcastle United": "Newcastle",
            "Nottingham Forest": "Nott'm Forest",
            "Sunderland": "Sunderland",
            "Tottenham Hotspur": "Spurs",
            "West Ham United": "West Ham",
            "Wolverhampton Wanderers": "Wolves",
        };
        
        var natMap = {
            "Albania": "ALB",
            "Algeria": "ALG",
            "Angola": "ANG",
            "Argentina": "ARG",
            "Australia": "AUS",
            "Austria": "AUT",
            "Belgium": "BEL",
            "Bosnia & Herzegovina": "BIH",
            "Brazil": "BRA",
            "Bulgaria": "BUL",
            "Burkina Faso": "BFO",
            "Cameroon": "CMR",
            "Canada": "CAN",
            "Colombia": "COL",
            "Cote d’Ivoire": "CIV",
            "Croatia": "CRO",
            "Czech Republic": "CZE",
            "Denmark": "DEN",
            "Dominican Republic": "DMR",
            "DR Congo": "DRC",
            "Ecuador": "ECU",
            "Egypt": "EGY",
            "England": "ENG",
            "Estonia": "EST",
            "Finland": "FIN",
            "France": "FRA",
            "Gambia": "GAM",
            "Georgia": "GEO",
            "Germany": "GER",
            "Ghana": "GHA",
            "Gibraltar": "GIB",
            "Greece": "GRE",
            "Guinea-Bissau": "GBI",
            "Haiti": "HAI",
            "Hungary": "HUN",
            "Iceland": "ISL",
            "Ireland": "IRL",
            "Israel": "ISR",
            "Italy": "ITA",
            "Jamaica": "JAM",
            "Japan": "JPN",
            "Mali": "MLI",
            "Mexico": "MEX",
            "Morocco": "MAR",
            "Mozambique": "MOZ",
            "Netherlands": "NED",
            "New Zealand": "NZL",
            "Nigeria": "NGA",
            "North Macedonia": "MKD",
            "Northern Ireland": "NIR",
            "Norway": "NOR",
            "Paraguay": "PAR",
            "Peru": "PER",
            "Poland": "POL",
            "Portugal": "POR",
            "Romania": "ROM",
            "Scotland": "SCO",
            "Senegal": "SEN",
            "Serbia": "SRB",
            "Sierra Leone": "SLE",
            "Slovakia": "SVK",
            "Slovenia": "SVN",
            "South Africa": "RSA",
            "South Korea": "KOR",
            "Spain": "ESP",
            "Sweden": "SWE",
            "Switzerland": "SUI",
            "Trinidad & Tobago": "TRI",
            "Tunisia": "TUN",
            "Turkey": "TUR",
            "Ukraine": "UKR",
            "United States": "USA",
            "Uruguay": "URU",
            "Uzbekistan": "UZB",
            "Wales": "WAL",
            "Zimbabwe": "ZIM",
        };
        
		var table = $('<table class="sjo-table"></table>')
				.appendTo('body').wrap('<div class="sjo-wrapper"></div>')
				.click(event => table.selectRange());
		
		var timer = window.setInterval(check, 100);
		
		function check() {
            
			var rows = $('tr.player-listings-row:not(.sjo-done)');
			if (rows.length == 0) return;
            
			rows.each((i,e) => {
				
				var row = $(e);
                
                var id   = $('a.player-listings-row__player', row).attr('href').match(/\d+/)[0];
                var name = $('td.player-listings-row__data--player'     , row).text().trim();
                var club = $('td.player-listings-row__data--club'       , row).text().trim();
                var pos  = $('td.player-listings-row__data--position'   , row).text().trim();
                var nat  = $('td.player-listings-row__data--nationality', row).text().trim();
                
				var outputRow = $('<tr></tr>').appendTo(table);
				$('<td></td>').appendTo(outputRow).text(id);
				$('<td></td>').appendTo(outputRow).text(name);
				$('<td></td>').appendTo(outputRow).text(clubMap[club]);
				$('<td></td>').appendTo(outputRow).text(posMap[pos]);
				$('<td></td>').appendTo(outputRow).text(natMap[nat] || nat);
                
                row.addClass('sjo-done');
			});
            
		}
		
	}
	
});
})(jQuery);
