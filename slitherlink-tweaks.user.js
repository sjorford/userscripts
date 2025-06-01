// ==UserScript==
// @name           Slitherlink tweaks
// @namespace      sjorford@gmail.com
// @version        2025.06.01.0
// @author         Stuart Orford
// @match          https://www.puzzle-loop.com/*
// @match          https://www.puzzle-masyu.com/*
// @match          https://www.puzzle-shingoki.com/*
// @grant          none
// ==/UserScript==

(function($) {
$(function() {
	
	var debug = false;
	
	$(`<style>
		#MainContainer {overflow: scroll !important;}
		#puzzleContainer {margin-right: 10px !important;}
		#puzzleContainerOverflowDiv {overflow: initial !important;}
		#sjoCheck {padding: 10px; margin-bottom: 1em; font-size: larger;}
	</style>`).appendTo('head');
	
	//////////////////////////////////////////////////////////////////////////////////////////
	// Check solution
	//////////////////////////////////////////////////////////////////////////////////////////
	
	// FIXME: breaks undo
	/*
	$('<input id="sjoCheck" type="button" class="button" value="Check solution">').insertAfter('#topControls').click(doCheck);
	
	function doCheck() {
		$('[name="ansH"]').val(Game.serializeSolution());
		var submit = $('#btnReady')[0];
		var data = $('#puzzleForm').serializeArray();
		data.push({name: submit.name, value: submit.value});
		console.log(data);
		$.post('/', data, checkResult, 'html');
	}
	
	function checkResult(data, textStatus, jqXHR) {
		console.log(textStatus, data.substring(0, 100));
		var match = data.match(/<div id="ajaxResponse" class="noprint">(.*?)<\/div>/);
		console.log(match);
		var html = match[1];
		$('#ajaxResponse').html(html);
	}
	*/
	
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
	})
	
});
})(jQuery);
