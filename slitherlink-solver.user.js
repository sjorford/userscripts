// ==UserScript==
// @name           Slitherlink solver
// @namespace      sjorford@gmail.com
// @version        2025.03.04.0
// @author         Stuart Orford
// @match          https://www.puzzle-loop.com/*
// @grant          none
// //@require        https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

(function($) {
$(function() {
	
	// TODO: 1/3 tail rules
	// TODO: colours/loops
	
	$(`<style>
		xxx#sjo-button {position: fixed; top: 0px; right: 0px; width: 10em; height: 4em; z-index: 999999; font-size: larger; background-color: palegoldenrod;}
		.tiny-dots .loop-line.loop-horizontal {
		height: 4px !important;
		margin-top: 0px;
		}
		.tiny-dots .loop-line.loop-vertical {
		width: 4px !important;
		margin-left: 0px;
		}


	</style>`).appendTo('head');
	
	$('#robot').val('1');
	
	$('<input type="button" value="Solve" id="sjo-button">').insertAfter('#topControls').click(solve);
	
	//////////////////////////////////////////////////////////////////////////////////////////
	// jQuery extensions
	//////////////////////////////////////////////////////////////////////////////////////////
	
	$.fn.getRow = function() {
		return this.data('row');
	};
	
	$.fn.getCol = function() {
		return this.data('col');
	};
	
	$.fn.getType = function() {
		return this.data('type');
	};
	
	$.fn.isHorz = function() {
		return this.hasClass('loop-horizontal');
	};
	
	$.fn.isVert = function() {
		return this.hasClass('loop-vertical');
	};
	
	$.fn.isOn = function() {
		return this.hasClass('cell-on');
	};
	
	$.fn.isOff = function() {
		return this.hasClass('cell-off');
	};
	
	$.fn.isX = function() {
		return this.hasClass('cell-x');
	};
	
	
	
	
	
	$.fn.getColour = function() {
		return this.data('colour');
	};
	
	$.fn.getColourName = function() {
		return this.data('colourName');
	};
	
	$.fn.setColour = function(colour) {
		this.data('colour', colour);
		changed = true;
		return this;
	};
	
	$.fn.setColourName = function(colourName) {
		this.data('colourName', colourName).addClass('colour-' + colourName);
		changed = true;
		return this;
	};
	
	$.fn.removeColour = function(colour) {
		var obj = this.filter((i,e) => $(e).data('colour') === colour);
		//console.log('removing colour', colour, obj.length);
		obj.data('colour', null);
		changed = true;
		return this;
	};
	
	$.fn.removeColourName = function(colourName) {
		var obj = this.filter((i,e) => $(e).data('colourName') === colourName);
		//console.log('removing colour name', colourName, obj.length);
		obj.data('colourName', null).removeClass('colour-' + colourName);
		changed = true;
		return this;
	};
	
	
	
	
	
	$.fn.getByRowCol = function(row, col) {
		var matched = this.filter((i,e) => {
			var edge = $(e);
			return edge.data('row') === row && edge.data('col') === col;
		});
		return matched;
	};
	
	$.fn.getNodesFromEdge = function() {
		var neighbours = $();
		this.each((i,e) => {
			var edge = $(e);
			if (edge.isHorz()) {
				neighbours = neighbours.add(nodes.getByRowCol(edge.getRow()    , edge.getCol() + 1));
				neighbours = neighbours.add(nodes.getByRowCol(edge.getRow()    , edge.getCol() - 1));
			} else if (edge.isVert()) {
				neighbours = neighbours.add(nodes.getByRowCol(edge.getRow() - 1, edge.getCol()    ));
				neighbours = neighbours.add(nodes.getByRowCol(edge.getRow() + 1, edge.getCol()    ));
			}
		});
		return neighbours;
	};
	
	$.fn.getEdgesFromNode = function() {
		var neighbours = $();
		this.each((i,e) => {
			var node = $(e);
			neighbours = neighbours.add(edges.getByRowCol(node.getRow() - 1, node.getCol()    ));
			neighbours = neighbours.add(edges.getByRowCol(node.getRow() + 1, node.getCol()    ));
			neighbours = neighbours.add(edges.getByRowCol(node.getRow()    , node.getCol() - 1));
			neighbours = neighbours.add(edges.getByRowCol(node.getRow()    , node.getCol() + 1));
		});
		return neighbours;
	};
	
	
	
	
	
	
	
	//////////////////////////////////////////////////////////////////////////////////////////
	// Initialize grid
	//////////////////////////////////////////////////////////////////////////////////////////
	
	var nodes = $('.loop-dot');
	var cells = $('.loop-task-cell');
	var edges = $('.loop-line');
	var horzEdges = edges.filter('.loop-horizontal');
	var vertEdges = edges.filter('.loop-vertical');
	
	var numCols = horzEdges.filter('[style*="top: 0px"]').length;
	var numRows = vertEdges.filter('[style*="left: 0px"]').length;
	
	// Populate grid
	var grid = [];
	for (var i = 0; i <= numRows * 2; i++) {
		grid[i] = [];
		for (var j = 0; j <= numCols * 2; j++) {
			
			if (i % 2 == 0 && j % 2 == 0) {
				grid[i][j] = nodes.eq(i / 2 * (numCols + 1) +  j / 2).data({type: 'node', row: i, col: j});
				
			} else if (i % 2 == 1 && j % 2 == 1) {
				grid[i][j] = cells.eq((i - 1) / 2 * numCols + (j - 1) / 2).data({type: 'cell', row: i, col: j});
				
			} else if (i % 2 == 0 && j % 2 == 1) {
				grid[i][j] = horzEdges.eq(i / 2 * numCols + (j - 1) / 2).data({type: 'edge', edgeType: 'horz', row: i, col: j});
				
			} else if (i % 2 == 1 && j % 2 == 0) {
				grid[i][j] = vertEdges.eq((i - 1) / 2 * (numCols + 1) +  j / 2).data({type: 'edge', edgeType: 'vert', row: i, col: j});
				
			}
			
			grid[i][j].data('sjo-i', i).data('sjo-j', j);

		}
	}
	
	console.log(grid);
	
	//////////////////////////////////////////////////////////////////////////////////////////
	// Rules index
	//////////////////////////////////////////////////////////////////////////////////////////
	
	var rules = [];
	//*
	rules.push({name: 'NodeCompleteRule', target: 'node', once: false, function: NodeCompleteRule});
	rules.push({name: 'CellCompleteRule', target: 'cell', once: false, function: CellCompleteRule});
	rules.push({name: 'RowOf3sRule',      target: 'cell', once: false, function: RowOf3sRule});
	rules.push({name: 'Diagonal3sRule',   target: 'cell', once: false, function: Diagonal3sRule});
	rules.push({name: 'Corner3Rule',      target: 'cell', once: false, function: Corner3Rule});
	rules.push({name: 'Corner1Rule',      target: 'cell', once: false, function: Corner1Rule});
	rules.push({name: 'Tail3Rule',        target: 'cell', once: false, function: Tail3Rule});
	rules.push({name: 'ColourJoinRule',   target: 'edge', once: false, function: ColourJoinRule});
	//*/
	
	
	
	
	
	
	
	
	
	
	//////////////////////////////////////////////////////////////////////////////////////////
	// Grid helper functions
	//////////////////////////////////////////////////////////////////////////////////////////
	
	grid.get = function(i, j) {
		if (i < 0 || i > numRows * 2 || j < 0 || j > numCols  * 2) return null;
		return grid[i][j];
	};
	
	grid.getType = function(i, j) {
		if (i < 0 || i > numRows * 2 || j < 0 || j > numCols  * 2) return null;
		return grid[i][j].getType();
	};
	
	grid.getEdgeState = function(i, j) {
		if (i < 0 || i > numRows * 2 || j < 0 || j > numCols  * 2) return -1;
		if (grid.get(i, j).hasClass('cell-on')) return  1;
		if (grid.get(i, j).hasClass('cell-x') ) return -1;
		return 0;
	};
	
	grid.setEdgeStateOn = function(i, j) {
		if (i < 0 || i > numRows * 2 || j < 0 || j > numCols  * 2) return;
		if (!grid.get(i, j).hasClass('cell-off')) return;
		grid.clickEdge(i, j);
		//grid.get(i, j).removeClass('cell-off').addClass('cell-on');
	};
	
	grid.setEdgeStateX = function(i, j) {
		if (i < 0 || i > numRows * 2 || j < 0 || j > numCols  * 2) return;
		if (!grid.get(i, j).hasClass('cell-off')) return;
		grid.clickEdge(i, j);
		grid.clickEdge(i, j);
		//grid.get(i, j).removeClass('cell-off').addClass('cell-x icon-cancel');
	};
	
	grid.clickEdge = function(i, j) {
		
		if (i < 0 || i > numRows * 2 || j < 0 || j > numCols  * 2) return;
		
		var hitbox = grid.get(i, j)[0].getBoundingClientRect();
		//var X = window.scrollX + hitbox.left + hitbox.width  / 2;
		//var Y = window.scrollY + hitbox.top  + hitbox.height / 2
		var X = hitbox.left + hitbox.width  / 2;
		var Y = hitbox.top  + hitbox.height / 2;
		
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
		
	};
	
	grid._countNeighbours = function(i, j, state) {
		if (grid.getType(i, j) == 'node' || grid.getType(i, j) == 'cell') {
			var count = 0;
			if (grid.getEdgeState(i - 1, j) === state) count++;
			if (grid.getEdgeState(i + 1, j) === state) count++;
			if (grid.getEdgeState(i, j - 1) === state) count++;
			if (grid.getEdgeState(i, j + 1) === state) count++;
			return count;
		}
	};
	
	grid.countNeighboursOn = function(i, j) {
		return grid._countNeighbours(i, j, 1);
	};
	
	grid.countNeighboursOff = function(i, j) {
		return grid._countNeighbours(i, j, 0);
	};
	
	grid.countNeighboursX = function(i, j) {
		return grid._countNeighbours(i, j, -1);
	};
	
	grid.setNeighboursOn = function(i, j) {
		if (grid.getType(i, j) == 'node' || grid.getType(i, j) == 'cell') {
			grid.setEdgeStateOn(i - 1, j);
			grid.setEdgeStateOn(i + 1, j);
			grid.setEdgeStateOn(i, j - 1);
			grid.setEdgeStateOn(i, j + 1);
		}
	};
	
	grid.setNeighboursX = function(i, j) {
		if (grid.getType(i, j) == 'node' || grid.getType(i, j) == 'cell') {
			grid.setEdgeStateX(i - 1, j);
			grid.setEdgeStateX(i + 1, j);
			grid.setEdgeStateX(i, j - 1);
			grid.setEdgeStateX(i, j + 1);
		}
	};
	
	grid.getCellValue = function(i, j) {
		if (grid.getType(i, j) !== 'cell') return null;
		if (i < 0 || i > numRows * 2 || j < 0 || j > numCols  * 2) return null;
		var text = grid.get(i, j).text().trim();
		if (text === '') return null;
		return text - 0;
	};
	
	grid.getEdgeColour = function(i, j) {
		if (grid.getType(i, j) !== 'edge') return null;
		if (i < 0 || i > numRows * 2 || j < 0 || j > numCols  * 2) return null;
		var classes = grid.get(i, j).attr('class').split(' ');
		for (var c in classes) {
			var match = classes[c].match(/^sjo-colour-(\d+)$/);
			if (match) return match[1] - 0;
		}
		return null;
	};
	
	
	
		
	
	//////////////////////////////////////////////////////////////////////////////////////////
	// Solve
	//////////////////////////////////////////////////////////////////////////////////////////
	
	// Global variable
	var changed;
	var numLoops;
	
	function solve() {
		
		//$('.sjo-button').attr('disabled', 'disabled')
		
		numLoops = 0; // failsafe?
		
		solvePass();
		
		//do {
			
		//} while (changed && numLoops < 100);
		
	}
	
	function solvePass() {
		
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
		
		ColourEdges();
		
		if (changed) {
			window.setTimeout(solvePass, 0);
		} else {
			$('.sjo-button').removeAttr('disabled');
		}
		
	}
	
	
	
	
	
	
	
	//////////////////////////////////////////////////////////////////////////////////////////
	// Colours
	//////////////////////////////////////////////////////////////////////////////////////////
	
	var maxColour = 0;
	
	var colourNames = [
		'blue',
		'orange',
		'hotpink',
		'cornflowerblue',
		'olive',
		'rebeccapurple',
		'teal',
		//'yellow',
		//'lightblue',
	];
	
	$('<style>\n' 
	  + colourNames.map(colour => `.cell-on.colour-${colour} {background-color: ${colour};}`).join('\n')
	  + '</style>').appendTo('head');
	
	function ColourEdges() {
		
		// Loop through uncoloured edges
		edges.each((i,e) => {
			var edge = $(e);
			if (!edge.isOn()) return;
			if (edge.getColour()) return;
			
			var colour, colourName;
			var edgesFound = $();
			var edgesToCheck = $(edge);
			
			// Loop through connected edges
			while (edgesToCheck.length > 0) {
				
				// Pop the first element
				var edgeToCheck = edgesToCheck.first();
				edgesFound = edgesFound.add(edgeToCheck);
				edgesToCheck = edgesToCheck.not(edgeToCheck);
				
				// Get more connected edges
				var moreEdges = edgeToCheck.getNodesFromEdge().getEdgesFromNode()
						.not(edgesFound).filter((i,e) => $(e).hasClass('cell-on'));
				edgesToCheck = edgesToCheck.add(moreEdges);
				
				// If this element has a colour name...
				if (edgeToCheck.getColourName()) {
					
					//console.log('found colour', edgeToCheck.getRow(), edgeToCheck.getCol(), edgeToCheck.getColourName());
					
					if (colourName && edgeToCheck.getColourName() !== colourName) {
						
						console.log('discarding colour', edgeToCheck.getRow(), edgeToCheck.getCol(), edgeToCheck.getColourName(), colourName);
						
						// If we already have a colour name, discard this one
						if (colourNames.indexOf(edgeToCheck.getColourName()) < 0) {
							colourNames.push(edgeToCheck.getColourName());
						}
						edges.removeColour(edgeToCheck.getColour())
							 .removeColourName(edgeToCheck.getColourName());
						
					} else {
						
						// Use this colour name
						colour = edgeToCheck.getColour();
						colourName = edgeToCheck.getColourName();
						
					}
					
				} else if (edgeToCheck.getColour()) {
					
					if (colour && edgeToCheck.getColour() !== colour) {
						
						// If we already have a colour index, discard this one
						edges.removeColour(edgeToCheck.getColour());
						
					} else {
						
						// Use this colour index
						colour = edgeToCheck.getColour();
						
					}
					
				}
				
			} // end while
			
			// If we don't have a colour index, create a new one
			if (!colour) {
				maxColour++;
				colour = maxColour;
			}
			
			// If we don't have a colour name, create a new one
			// TODO: only colour longest sequences
			// TODO: reuse discarded colour names to colour long uncoloured sequences
			if (!colourName && colourNames.length > 0 && edgesFound.length >= 20) {
				colourName = colourNames.shift();
				console.log(colourName, colourNames);
			}
			
			// Apply colour to whole group
			edgesFound.setColour(colour).setColourName(colourName);
			edgesFound.getNodesFromEdge().setColour(colour).setColourName(colourName);
			
		});
		
	}
	
	
	
	
	
	//////////////////////////////////////////////////////////////////////////////////////////
	// Rules
	//////////////////////////////////////////////////////////////////////////////////////////
	
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
	
	//////////////////////////////////////////////////////////////////////////////////////////
	
	function Corner3Rule(i, j) {
		
		if (grid.getType(i, j) !== 'cell') return;
		if (grid.getCellValue(i, j) !== 3) return;
		
		if (grid.getEdgeState(i - 2, j - 1) === -1 && grid.getEdgeState(i - 1, j - 2) === -1) {
			grid.setEdgeStateOn(i - 1, j);
			grid.setEdgeStateOn(i, j - 1);
		}
		
		if (grid.getEdgeState(i - 2, j + 1) === -1 && grid.getEdgeState(i - 1, j + 2) === -1) {
			grid.setEdgeStateOn(i - 1, j);
			grid.setEdgeStateOn(i, j + 1);
		}
		
		if (grid.getEdgeState(i + 2, j - 1) === -1 && grid.getEdgeState(i + 1, j - 2) === -1) {
			grid.setEdgeStateOn(i + 1, j);
			grid.setEdgeStateOn(i, j - 1);
		}
		
		if (grid.getEdgeState(i + 2, j + 1) === -1 && grid.getEdgeState(i + 1, j + 2) === -1) {
			grid.setEdgeStateOn(i + 1, j);
			grid.setEdgeStateOn(i, j + 1);
		}
		
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////
	
	function Corner1Rule(i, j) {
		
		if (grid.getType(i, j) !== 'cell') return;
		if (grid.getCellValue(i, j) !== 1) return;
		
		if (grid.getEdgeState(i - 2, j - 1) === -1 && grid.getEdgeState(i - 1, j - 2) === -1) {
			grid.setEdgeStateX(i - 1, j);
			grid.setEdgeStateX(i, j - 1);
		}
		
		if (grid.getEdgeState(i - 2, j + 1) === -1 && grid.getEdgeState(i - 1, j + 2) === -1) {
			grid.setEdgeStateX(i - 1, j);
			grid.setEdgeStateX(i, j + 1);
		}
		
		if (grid.getEdgeState(i + 2, j - 1) === -1 && grid.getEdgeState(i + 1, j - 2) === -1) {
			grid.setEdgeStateX(i + 1, j);
			grid.setEdgeStateX(i, j - 1);
		}
		
		if (grid.getEdgeState(i + 2, j + 1) === -1 && grid.getEdgeState(i + 1, j + 2) === -1) {
			grid.setEdgeStateX(i + 1, j);
			grid.setEdgeStateX(i, j + 1);
		}
		
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////
	
	function Tail3Rule(i, j) {
		
		if (grid.getType(i, j) !== 'cell') return;
		if (grid.getCellValue(i, j) !== 3) return;
		
		if (grid.getEdgeState(i - 2, j - 1) === 1 || grid.getEdgeState(i - 1, j - 2) === 1) {
			grid.setEdgeStateOn(i + 1, j);
			grid.setEdgeStateOn(i, j + 1);
			grid.setEdgeStateX(i - 2, j - 1);
			grid.setEdgeStateX(i - 1, j - 2);
		}
		
		if (grid.getEdgeState(i - 2, j + 1) === 1 || grid.getEdgeState(i - 1, j + 2) === 1) {
			grid.setEdgeStateOn(i + 1, j);
			grid.setEdgeStateOn(i, j - 1);
			grid.setEdgeStateX(i - 2, j + 1);
			grid.setEdgeStateX(i - 1, j + 2);
		}
		
		if (grid.getEdgeState(i + 2, j - 1) === 1 || grid.getEdgeState(i + 1, j - 2) === 1) {
			grid.setEdgeStateOn(i - 1, j);
			grid.setEdgeStateOn(i, j + 1);
			grid.setEdgeStateX(i + 2, j - 1);
			grid.setEdgeStateX(i + 1, j - 2);
		}
		
		if (grid.getEdgeState(i + 2, j + 1) === 1 || grid.getEdgeState(i + 1, j + 2) === 1) {
			grid.setEdgeStateOn(i - 1, j);
			grid.setEdgeStateOn(i, j - 1);
			grid.setEdgeStateX(i + 2, j + 1);
			grid.setEdgeStateX(i + 1, j + 2);
		}
		
	}
	
	function ColourJoinRule(row, col) {
		
		// TODO: don't mark as invalid if this is the final edge of the solution
		
		var thisEdge = edges.getByRowCol(row, col);
		if (!thisEdge.isOff()) return;
		
		var myNodes = thisEdge.getNodesFromEdge();
		
		if (myNodes.first().getColour() && myNodes.first().getColour() === myNodes.last().getColour()) {
			grid.setEdgeStateX(row, col);
		}
		
	}
	
	
	
	
	
	
	
	
		
});
})(jQuery);
