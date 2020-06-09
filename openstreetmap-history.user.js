// ==UserScript==
// @name           OpenStreetMap history
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @version        2020.06.09.0
// @match          https://www.openstreetmap.org/*
// @grant          none
// ==/UserScript==

console.log('hello world');

$(function() {

	$(`<style>
		.sjo-history-added   .browse-tag-k, .sjo-history-added   .browse-tag-v {background-color: #73ca73 !important;}
		.sjo-history-removed .browse-tag-k, .sjo-history-removed .browse-tag-v {background-color: #cca0a0 !important;}
		.sjo-history-changed .browse-tag-v {background-color: #addd44 !important;}
	</style>`).appendTo('head');

	var log = $('.browse-node');
	log.each((i,e) => {

		var thisTable = log.eq(i).find('.browse-tag-list');
        if (thisTable.length == 0) {
            thisTable = $('<table class="browse-tag-list"></table>').appendTo(e);
        }
        
		var thisLogRows = log.eq(i).find('.browse-tag-list tr');
		var prevLogRows = log.eq(i+1).find('.browse-tag-list tr');

		var thisLog = thisLogRows.toArray().map(e => ({key: e.cells[0].innerText.trim(), value: e.cells[1].innerText}));
		var prevLog = prevLogRows.toArray().map(e => ({key: e.cells[0].innerText.trim(), value: e.cells[1].innerText}));
        
		var θ = 0, π = 0;
		while (θ < thisLog.length || π < prevLog.length) {
            
			if (π >= prevLog.length || (θ < thisLog.length && thisLog[θ].key < prevLog[π].key)) {
				thisLogRows.eq(θ).addClass('sjo-history-added');
				θ++;
			} else if (θ >= thisLog.length || (π < prevLog.length && prevLog[π].key < thisLog[θ].key)) {
				$('<tr></tr>').html(prevLogRows.eq(π).html()).addClass('sjo-history-removed').appendTo(thisTable);
				π++;
			} else {
                if (thisLog[θ].key === prevLog[π].key && thisLog[θ].value !== prevLog[π].value) {
                    thisLogRows.eq(θ).addClass('sjo-history-changed');
                }
				θ++;
				π++;
			}

		}

	});

});
