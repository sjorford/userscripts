// ==UserScript==
// @name           Slitherlink solver
// @namespace      sjorford@gmail.com
// @version        2025.02.28.0
// @author         Stuart Orford
// @match          https://www.puzzle-loop.com/*
// @grant          none
// //@require        https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

(function($) {
$(function() {
	
	// TODO: set bot flag
	// TODO: 1/3 corner rules
	// TODO: 1/3 tail rules
	// TODO: colours/loops
	
	$(`<style>
		#sjo-button {position: fixed; top: 0px; right: 0px; width: 10em; height: 4em; z-index: 999999; font-size: larger; background-color: palegoldenrod;}
	</style>`).appendTo('head');
	
	$('<input type="button" value="Solve" id="sjo-button">').insertAfter('#topControls').click(solve);
	
	var nodes = $('.loop-dot');
	var cells = $('.loop-task-cell');
	var horzLines = $('.loop-line.loop-horizontal');
	var vertLines = $('.loop-line.loop-vertical');
	
	var numCols = horzLines.filter('[style*="top: 0px"]').length;
	var numRows = vertLines.filter('[style*="left: 0px"]').length;
	
	// Populate grid
	var grid = [];
	for (var i = 0; i <= numRows * 2; i++) {
		grid[i] = [];
		for (var j = 0; j <= numCols * 2; j++) {
			
			if (i % 2 == 0 && j % 2 == 0) {
				grid[i][j] = nodes.eq(i / 2 * (numCols + 1) +  j / 2).data('sjo-type', 'node');
				
			} else if (i % 2 == 1 && j % 2 == 1) {
				grid[i][j] = cells.eq((i - 1) / 2 * numCols + (j - 1) / 2).data('sjo-type', 'cell');
				
			} else if (i % 2 == 0 && j % 2 == 1) {
				grid[i][j] = horzLines.eq(i / 2 * numCols + (j - 1) / 2).data('sjo-type', 'edge');
				
			} else if (i % 2 == 1 && j % 2 == 0) {
				grid[i][j] = vertLines.eq((i - 1) / 2 * (numCols + 1) +  j / 2).data('sjo-type', 'edge');
				
			}
			
			grid[i][j].data('sjo-i', i).data('sjo-j', j);
			
		}
	}
	
	console.log(grid);
	
	//////////////////////////////////////////////////////////////////////////////////////////
	// jQuery extensions
	//////////////////////////////////////////////////////////////////////////////////////////
	
	$.fn.getType = function() {
		return this.data('sjo-type');
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	//////////////////////////////////////////////////////////////////////////////////////////
	// Grid helper functions
	//////////////////////////////////////////////////////////////////////////////////////////
	
	grid.get = function(i, j) {
		if (i < 0 || i > numRows * 2 || j < 0 || j > numCols  * 2) return null;
		return grid[i][j];
	}
	
	grid.getType = function(i, j) {
		if (i < 0 || i > numRows * 2 || j < 0 || j > numCols  * 2) return null;
		return grid[i][j].getType();
	}
	
	grid.getEdgeState = function(i, j) {
		if (i < 0 || i > numRows * 2 || j < 0 || j > numCols  * 2) return -1;
		if (grid.get(i, j).hasClass('cell-on')) return  1;
		if (grid.get(i, j).hasClass('cell-x') ) return -1;
		return 0;
	}
	
	grid.setEdgeStateOn = function(i, j) {
		if (i < 0 || i > numRows * 2 || j < 0 || j > numCols  * 2) return;
		if (!grid.get(i, j).hasClass('cell-off')) return;
		grid.clickEdge(i, j);
		//grid.get(i, j).removeClass('cell-off').addClass('cell-on');
	}
	
	grid.setEdgeStateX = function(i, j) {
		if (i < 0 || i > numRows * 2 || j < 0 || j > numCols  * 2) return;
		if (!grid.get(i, j).hasClass('cell-off')) return;
		grid.clickEdge(i, j);
		grid.clickEdge(i, j);
		//grid.get(i, j).removeClass('cell-off').addClass('cell-x icon-cancel');
	}
	
	grid.clickEdge = function(i, j) {
		
		if (i < 0 || i > numRows * 2 || j < 0 || j > numCols  * 2) return;
		
		var hitbox = grid.get(i, j)[0].getBoundingClientRect();
		//var X = window.scrollX + hitbox.left + hitbox.width  / 2;
		//var Y = window.scrollY + hitbox.top  + hitbox.height / 2
		var X = hitbox.left + hitbox.width  / 2;
		var Y = hitbox.top  + hitbox.height / 2
		
		var element = $('#game')[0];
		
		var mousedown = new MouseEvent('mousedown', {
			'view': window,
			'bubbles': true,
			'cancelable': true,
			'clientX': X,
			'clientY': Y,
		});
		element.dispatchEvent(mousedown);
		
		var mouseup = new MouseEvent('mouseup', {
			'view': window,
			'bubbles': true,
			'cancelable': true,
			'clientX': X,
			'clientY': Y,
		});
		element.dispatchEvent(mouseup);
		
		changed = true;
		
	}
	
	grid._countNeighbours = function(i, j, state) {
		if (grid.getType(i, j) == 'node' || grid.getType(i, j) == 'cell') {
			var count = 0;
			if (grid.getEdgeState(i - 1, j) === state) count++;
			if (grid.getEdgeState(i + 1, j) === state) count++;
			if (grid.getEdgeState(i, j - 1) === state) count++;
			if (grid.getEdgeState(i, j + 1) === state) count++;
			return count;
		}
	}
	
	grid.countNeighboursOn = function(i, j) {
		return grid._countNeighbours(i, j, 1);
	}
	
	grid.countNeighboursOff = function(i, j) {
		return grid._countNeighbours(i, j, 0);
	}
	
	grid.countNeighboursX = function(i, j) {
		return grid._countNeighbours(i, j, -1);
	}
	
	grid.setNeighboursOn = function(i, j) {
		if (grid.getType(i, j) == 'node' || grid.getType(i, j) == 'cell') {
			grid.setEdgeStateOn(i - 1, j);
			grid.setEdgeStateOn(i + 1, j);
			grid.setEdgeStateOn(i, j - 1);
			grid.setEdgeStateOn(i, j + 1);
		}
	}
	
	grid.setNeighboursX = function(i, j) {
		if (grid.getType(i, j) == 'node' || grid.getType(i, j) == 'cell') {
			grid.setEdgeStateX(i - 1, j);
			grid.setEdgeStateX(i + 1, j);
			grid.setEdgeStateX(i, j - 1);
			grid.setEdgeStateX(i, j + 1);
		}
	}
	
	grid.getCellValue = function(i, j) {
		if (grid.getType(i, j) !== 'cell') return null;
		if (i < 0 || i > numRows * 2 || j < 0 || j > numCols  * 2) return null;
		var text = grid.get(i, j).text().trim();
		if (text === '') return null;
		return text - 0;
	}
	
	grid.getEdgeColour = function(i, j) {
		if (grid.getType(i, j) !== 'edge') return null;
		if (i < 0 || i > numRows * 2 || j < 0 || j > numCols  * 2) return null;
		var classes = grid.get(i, j).attr('class').split(' ');
		for (c in classes) {
			var match = classes[c].match(/^sjo-colour-(\d+)$/)
			if (match) return match[1] - 0;
		}
		return null;
	}
	
	
	
		
	
	//////////////////////////////////////////////////////////////////////////////////////////
	// Solve
	//////////////////////////////////////////////////////////////////////////////////////////
	
	var changed;
	
	function solve() {
		
		var numLoops = 0; // failsafe
		
		do {
			
			changed = false;
			numLoops++;
			
			// Loop through rules
			for (r in rules) {
				for (var i = 0; i <= numRows * 2; i++) {
					for (var j = 0; j <= numCols * 2; j++) {
						if (grid.getType(i, j) == rules[r].target) {

							// Check if this element has already been solved
							if (grid.getType(i, j) == 'edge') {
								if (grid.getEdgeState(i, j) !== 0) continue;
							} else {
								if (grid.countNeighboursOff(i, j) === 0) continue;
							}

							rules[r].function.call(this, i, j);

						}
					}
				}
			}
			
		} while (changed && numLoops < 100);
		
	}
	
	
	
	
	
	
	
	
	
	//////////////////////////////////////////////////////////////////////////////////////////
	// Rules
	//////////////////////////////////////////////////////////////////////////////////////////
	
	var rules = [];
	rules.push({name: 'Colours',      target: 'edge', once: false, function: ColoursRule});
	rules.push({name: 'CellComplete', target: 'cell', once: false, function: CellCompleteRule});
	rules.push({name: 'NodeComplete', target: 'node', once: false, function: NodeCompleteRule});
	rules.push({name: 'RowOf3s',      target: 'cell', once: false, function: RowOf3sRule});
	rules.push({name: 'Diagonal3s',   target: 'cell', once: false, function: Diagonal3sRule});
	
	//////////////////////////////////////////////////////////////////////////////////////////
	
	function ColoursRule(i, j) {
		
		if (grid.getType(i, j) !== 'edge') return;
		if (grid.getEdgeState(i, j) !== 1) return;
		if (grid.getEdgeColour(i, j) !== null) return;
		
		// Follow edge in both directions until either:
		//    find an edge with a colour
		//    find a trailing edge
		
		
		
		
		
		
		
		
	}
	
	function CellCompleteRule(i, j) {
		
		if (grid.getType(i, j) !== 'cell') return;
		var cellValue = grid.getCellValue(i, j);
		if (cellValue === null) return;
		
		//console.log('CellCompleteRule', i, j, cellValue, 'countNeighboursOn', grid.countNeighboursOn(i, j));

		// N neighbours have been set On, all unset edges can be set X
		if (grid.countNeighboursOn(i, j) === cellValue) {
			//console.log('CellCompleteRule', i, j, cellValue, 'setNeighboursX');
			grid.setNeighboursX(i, j);
		}
		
		// 4 - N neighbours are set X, all unset edges can be set On
		if (grid.countNeighboursX(i, j, 1) === 4 - cellValue) {
			//console.log('CellCompleteRule', i, j, cellValue, 'setNeighboursOn');
			grid.setNeighboursOn(i, j);
		}
		
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////
	
	function NodeCompleteRule(i, j) {
		
		if (grid.getType(i, j) !== 'node') return;
		
		if (grid.countNeighboursOn(i, j) === 2) {
			grid.setNeighboursX(i, j);
		} else if (grid.countNeighboursOn(i, j) === 1 && grid.countNeighboursX(i, j) === 2) {
			grid.setNeighboursOn(i, j);
		} else if (grid.countNeighboursX(i, j) === 3) {
			grid.setNeighboursX(i, j);
		}
		
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////

	function RowOf3sRule(i, j) {
		
		if (grid.getType(i, j) !== 'cell') return;
		
		if (grid.getCellValue(i, j) === 3 && grid.getCellValue(i + 2, j) === 3) {
			grid.setEdgeStateOn(i - 1, j);
			grid.setEdgeStateOn(i + 1, j);
			grid.setEdgeStateOn(i + 3, j);
			grid.setEdgeStateX (i + 1, j + 2);
			grid.setEdgeStateX (i + 1, j - 2);
		}
		
		if (grid.getCellValue(i, j) === 3 && grid.getCellValue(i, j + 2) === 3) {
			grid.setEdgeStateOn(i,     j - 1);
			grid.setEdgeStateOn(i,     j + 1);
			grid.setEdgeStateOn(i,     j + 3);
			grid.setEdgeStateX (i + 2, j + 1);
			grid.setEdgeStateX (i - 2, j + 1);
		}
		
		// TODO: check for neighbouring 2s
		
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////

	function Diagonal3sRule(i, j) {
		
		if (grid.getType(i, j) !== 'cell') return;
		
		if (grid.getCellValue(i, j) === 3 && grid.getCellValue(i + 2, j + 2) === 3) {
			grid.setEdgeStateOn(i - 1, j);
			grid.setEdgeStateOn(i,     j - 1);
			grid.setEdgeStateOn(i + 3, j + 2);
			grid.setEdgeStateOn(i + 2, j + 3);
		}
		
		if (grid.getCellValue(i, j) === 3 && grid.getCellValue(i + 2, j - 2) === 3) {
			grid.setEdgeStateOn(i - 1, j);
			grid.setEdgeStateOn(i,     j + 1);
			grid.setEdgeStateOn(i + 3, j - 2);
			grid.setEdgeStateOn(i + 2, j - 3);
		}
		
		// TODO: check for inbetween 2s
		
	}
	
	
	
	
	
	
	
	
		
});
})(jQuery);
