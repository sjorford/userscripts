// ==UserScript==
// @name           Puzzle Team tweaks
// @namespace      sjorford@gmail.com
// @version        2025.06.16.2
// @author         Stuart Orford
// @match          https://www.puzzle-loop.com/*
// @match          https://www.puzzle-masyu.com/*
// @match          https://www.puzzle-shingoki.com/*
// @match          https://www.puzzle-lits.com/*
// @grant          none
// ==/UserScript==

(function($) {
$(function() {
	
	var debug = false;
	
	$(`<style>
		#MainContainer {overflow: scroll !important;}
		#puzzleContainer {margin-right: 10px !important;}
		#puzzleContainerOverflowDiv {overflow: initial !important;}
	</style>`).appendTo('head');
	
	if (window.location.hostname.match(/www.puzzle-(loop|masyu|shingoki).com/)) paintSnakes();
	
	if (window.location.hostname.match(/www.puzzle-lits.com/)) addCheckButton();
	
	function addCheckButton() {
		
		$(`<style>
			.cell.cell-on {background-color: #ccc; border-color: #ccc;}
			.cell.cell-x {color: #777; font-size: 13px;}
			#sjoCheckButton {display: block; width: 306px; margin: 10px auto; height: 45px; font-size: large;}
			#sjoCheckFrame {display: none;}
			.sjoLoading {font-size: 13px; font-weight: 700;}
		</style>`).appendTo('head');
		
		var iframe, iframeDoc, timer;
		
		$('<input class="button" type="button" id="sjoCheckButton" value="   Check   ">').insertBefore('#btnReady').click(event => {
			var url = $('a.on').attr('href');
			if (debug) console.log('url', url);
			iframe = $(`<iframe id="sjoCheckFrame" src="${url}"></iframe>`).appendTo('body').on('load', iframeLoaded);
			$('#ajaxResponse').html('<p class="sjoLoading">checking...</p>');
			window.scrollTo(0, 0);
		});
		
		function iframeLoaded() {
			iframeDoc = iframe[0].contentDocument;
			if (debug) console.log('iframeLoaded', iframeDoc);
			$('#btnReady', iframeDoc).click();
			timer = window.setInterval(checkMessage, 1000);
		}
		
		function checkMessage() {
			var message = $('#ajaxResponse p', iframeDoc).text().trim();
			if (debug) console.log('checkMessage', message);
			if (message === '') return;
			window.clearInterval(timer);
			$('#ajaxResponse').html($('#ajaxResponse', iframeDoc).html());
			document.focus; // FIXME
			$('#sjoCheckFrame').remove();
		}
		
	}
	
	function paintSnakes() {
	
	//////////////////////////////////////////////////////////////////////////////////////////
	// Colour definitions
	//////////////////////////////////////////////////////////////////////////////////////////
	
	var minLength = 10;
	
	var colours = [
		'blue',
		'orange',
		'hotpink',
		'cornflowerblue',
		'olive',
		'rebeccapurple',
		'teal',
		'slateblue',
		'burlywood',
		'fuchsia',
		'lightsteelblue',
		'#dc0', // gold
		'#0a5', // green
		'#f33', // red
		'lightgrey',
		//'yellow',
	];
	
	var colourStyles = colours.map(colour => `.cell-on.sjo-colour-${colour.replace(/#/, '')} {background-color: ${colour};}`);
	$('<style>\n' + colourStyles.join('\n') + '</style>').appendTo('head');
	
	//////////////////////////////////////////////////////////////////////////////////////////
	// Initialize grid
	//////////////////////////////////////////////////////////////////////////////////////////
	
	var allNodes = $('.loop-dot');
	var allCells = $('.loop-task-cell');
	var allEdges = $('.loop-line');
	var allHorzEdges = allEdges.filter('.loop-horizontal');
	var allVertEdges = allEdges.filter('.loop-vertical');
	
	// Now with added algebra
	var nh = allHorzEdges.length;
	var nv = allVertEdges.length;
	var foo = nh - nv + 1;
	var numRows = Math.round(Math.sqrt((foo * foo + 4 * nv) / 4) - (foo / 2));
	var numCols = nh / (numRows + 1);
	if (debug) console.log('numRows', numRows, 'numCols', numCols);
	
	// Populate grid
	var grid = [];
	for (var i = 0; i <= numRows * 2; i++) {
		grid[i] = [];
		for (var j = 0; j <= numCols * 2; j++) {
			
			if (i % 2 == 0 && j % 2 == 0) {
				var node = allNodes.eq(i / 2 * (numCols + 1) +  j / 2);
				grid[i][j] = node.data({type: 'node'});
				
			} else if (i % 2 == 1 && j % 2 == 1) {
				var cell = allCells.eq((i - 1) / 2 * numCols + (j - 1) / 2);
				grid[i][j] = cell.data({type: 'cell'});
				
			} else if (i % 2 == 0 && j % 2 == 1) {
				var edge = allHorzEdges.eq(i / 2 * numCols + (j - 1) / 2);
				grid[i][j] = edge.data({type: 'edge', edgeType: 'horz'});
				
			} else if (i % 2 == 1 && j % 2 == 0) {
				var edge = allVertEdges.eq((i - 1) / 2 * (numCols + 1) +  j / 2);
				grid[i][j] = edge.data({type: 'edge', edgeType: 'vert'});
				
			}
			
			grid[i][j].data({i: i, j: j});
			
		}
	}
	if (debug) console.log('grid', grid);
	
	//////////////////////////////////////////////////////////////////////////////////////////
	// Helper functions
	//////////////////////////////////////////////////////////////////////////////////////////
	
	grid.get = function(i, j) {
		if (i < 0 || i > numRows * 2 || j < 0 || j > numCols  * 2) return null;
		return grid[i][j];
	};
	
	$.fn.getEdgesFromNode = function() {
		var node = $(this);
		if (node.data('type') !== 'node') return $();
		var i = node.data('i');
		var j = node.data('j');
		//if (debug) console.log('getEdgesFromNode', 'node', node, 'i', i, 'j', j);
		
		var edges = $();
		edges = edges.add(grid.get(i - 1, j));
		edges = edges.add(grid.get(i + 1, j));
		edges = edges.add(grid.get(i, j - 1));
		edges = edges.add(grid.get(i, j + 1));
		
		//if (debug) console.log('edges', edges);
		return edges;
	};
	
	$.fn.getNodesFromEdge = function() {
		var edge = $(this);
		if (edge.data('type') !== 'edge') return $();
		var i = edge.data('i');
		var j = edge.data('j');
		var edgeType = edge.data('edgeType');
		var nodes = $();
		if (edgeType === 'horz') {
			nodes = nodes.add(grid.get(i, j - 1));
			nodes = nodes.add(grid.get(i, j + 1));
		} else {
			nodes = nodes.add(grid.get(i - 1, j));
			nodes = nodes.add(grid.get(i + 1, j));
		}
		return nodes;
	};
	
	//////////////////////////////////////////////////////////////////////////////////////////
	// Find snakes
	//////////////////////////////////////////////////////////////////////////////////////////
	
	var snakes = [];
	
	// Loop through nodes
	if (debug) console.log('allNodes', allNodes);
	allNodes.each((index, element) => {
		var node = $(element);
		
		// Find nodes with one solid edge
		var edges = node.getEdgesFromNode().filter('.cell-on');
		if (edges.length == 1 && !edges.is('.sjo')) {
			if (debug) console.log('new snake', node, edges);
			
			// Trace the whole snake
			var lastEdge = edges;
			var lastNode = node;
			var loops = 0;
			do {
				loops++;
				var nextNode = lastEdge.getNodesFromEdge().not(lastNode);
				//if (debug) console.log('nextNode', nextNode);
				var nextEdge = nextNode.getEdgesFromNode().filter('.cell-on').not(lastEdge);
				//if (debug) console.log('nextEdge', nextEdge);
				if (nextEdge.length !== 1) break;
				edges = edges.add(nextEdge);
				lastEdge = nextEdge;
				lastNode = nextNode;
			} while (loops < 10000); // failsafe
			
			if (debug) console.log('adding snake', 'length', edges.length, 'edges', edges);
			edges.addClass('sjo');
			snakes.push(edges);
			
		}
				
	});
	
	if (debug) console.log('snakes', snakes);

	snakes.sort((a,b) => {
		return b.length - a.length;
	});
	
	$.each(snakes, (index, snake) => {
		if (snake.length < minLength) return false;
		var colour = colours.shift().replace('#', '');
		snake.addClass('sjo-colour-' + colour);
		if (colours.length === 0) return false;
	});
	
	}
	
});
})(jQuery);
