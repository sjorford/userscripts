// ==UserScript==
// @name           Slitherlink solver
// @namespace      sjorford@gmail.com
// @version        2025.03.10.0
// @author         Stuart Orford
// @match          https://www.puzzle-loop.com/*
// @grant          none
// //@require        https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

(function($) {
$(function() {
	
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
	
	// Robot flag bleep bloop
	$('#robot').val('1');
	
	// Click target
	var gameElement = $('#game')[0];
	
	// Start button
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
	
	$.fn.getCellValue = function() {
		var text = this.text().trim();
		if (text === '') return null;
		return parseInt(text, 10);
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
		if (this.length === 0) return true;
		return this.hasClass('cell-x');
	};
	
	$.fn.getState = function() {
		if (this.length === 0)         return -1;
		if (this.hasClass('cell-on'))  return  1;
		if (this.hasClass('cell-x'))   return -1;
		if (this.hasClass('cell-off')) return  0;
	};
	
	$.fn.setOn = function() {
		this.each((i,e) => {
			
			var edge = $(e);
			if (edge.getType() !== 'edge') return;
			if (!edge.isOff()) return;
			
			/*
			// Check neighbouring colours
			var colour, colourName;
			edge.getNodesFromEdge().each((i,e) => {
				var node = $(e);
				node.getEdgesFromNode().each((i,e) => {
					var edge = $(e);
					if (edge.getColour()) {
						if (!colour) {
							colour = edge.getColour();
							colourName = edge.getColourName();
						} else {
							colour = -1;
						}
					}
				});
			});
			
			// If colour is unique, copy it
			if (colour && colour !== -1) {
				edge.setColour(colour);
				edge.setColourName(colourName);
			}
			*/
			
			edge.clickEdge();
			
		});
	};
	
	$.fn.setX = function() {
		this.each((i,e) => {
			var edge = $(e);
			if (edge.getType() !== 'edge') return;
			if (!edge.isOff()) return;
			edge.clickEdge();
			edge.clickEdge();
		});
	};
	
	$.fn.clickEdge = function() {
		this.each((i,e) => {
			
			var edge = $(e);
			if (edge.getType() !== 'edge') return;
			
			var hitbox = edge[0].getBoundingClientRect();
			var X = hitbox.left + hitbox.width  / 2;
			var Y = hitbox.top  + hitbox.height / 2;
			
			var mousedown = new MouseEvent('mousedown', {
				'view': window,
				'bubbles': true,
				'cancelable': true,
				'clientX': X,
				'clientY': Y,
			});
			gameElement.dispatchEvent(mousedown);
			
			var mouseup = new MouseEvent('mouseup', {
				'view': window,
				'bubbles': true,
				'cancelable': true,
				'clientX': X,
				'clientY': Y,
			});
			gameElement.dispatchEvent(mouseup);
			
			changed = true;
			
		});
	};
	
	
	
	
	
	
	
	$.fn.getColour = function() {
		if (this.getType() === 'edge') {
			return this.data('colour');
		} else if (this.getType() === 'node') {
			var colour = 
				this.getEdgeN().getColour() || 
				this.getEdgeS().getColour() || 
				this.getEdgeW().getColour() || 
				this.getEdgeE().getColour() || 
				null;
			return colour;
		}
	};
	
	$.fn.getColourName = function() {
		return this.data('colourName');
	};
	
	$.fn.setColour = function(colour) {
		if (!colour) return;
		this.data('colour', colour);
		changed = true;
		return this;
	};
	
	$.fn.setColourName = function(colourName) {
		if (!colourName) return;
		this.data('colourName', colourName).addClass('colour-' + colourName);
		changed = true;
		return this;
	};
	
	$.fn.removeColour = function(colour) {
		var obj = this.filter((i,e) => $(e).data('colour') === colour);
		obj.data('colour', null);
		changed = true;
		return this;
	};
	
	$.fn.removeColourName = function(colourName) {
		var obj = this.filter((i,e) => $(e).data('colourName') === colourName);
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
	
	
	
	
	
	
	
	$.fn.getNodeNW = function() {
		var returnNodes = $();
		this.each((i,e) => {
			var cell = $(e);
			if (cell.getType() !== 'cell') return;
			returnNodes = returnNodes.add(nodes.getByRowCol(cell.getRow() - 1, cell.getCol() - 1));
		});
		return returnNodes;
	};
	
	$.fn.getNodeNE = function() {
		var returnNodes = $();
		this.each((i,e) => {
			var cell = $(e);
			if (cell.getType() !== 'cell') return;
			returnNodes = returnNodes.add(nodes.getByRowCol(cell.getRow() - 1, cell.getCol() + 1));
		});
		return returnNodes;
	};
	
	$.fn.getNodeSW = function() {
		var returnNodes = $();
		this.each((i,e) => {
			var cell = $(e);
			if (cell.getType() !== 'cell') return;
			returnNodes = returnNodes.add(nodes.getByRowCol(cell.getRow() + 1, cell.getCol() - 1));
		});
		return returnNodes;
	};
	
	$.fn.getNodeSE = function() {
		var returnNodes = $();
		this.each((i,e) => {
			var cell = $(e);
			if (cell.getType() !== 'cell') return;
			returnNodes = returnNodes.add(nodes.getByRowCol(cell.getRow() + 1, cell.getCol() + 1));
		});
		return returnNodes;
	};
	
	
	
	
	
	
	
	$.fn.getEdgeN = function() {
		var returnEdges = $();
		this.each((i,e) => {
			var obj = $(e);
			if (obj.getType() !== 'cell' && obj.getType() !== 'node') return;
			returnEdges = returnEdges.add(edges.getByRowCol(obj.getRow() - 1, obj.getCol()));
		});
		return returnEdges;
	};
	
	$.fn.getEdgeS = function() {
		var returnEdges = $();
		this.each((i,e) => {
			var obj = $(e);
			if (obj.getType() !== 'cell' && obj.getType() !== 'node') return;
			returnEdges = returnEdges.add(edges.getByRowCol(obj.getRow() + 1, obj.getCol()));
		});
		return returnEdges;
	};
	
	$.fn.getEdgeW = function() {
		var returnEdges = $();
		this.each((i,e) => {
			var obj = $(e);
			if (obj.getType() !== 'cell' && obj.getType() !== 'node') return;
			returnEdges = returnEdges.add(edges.getByRowCol(obj.getRow(), obj.getCol() - 1));
		});
		return returnEdges;
	};
	
	$.fn.getEdgeE = function() {
		var returnEdges = $();
		this.each((i,e) => {
			var obj = $(e);
			if (obj.getType() !== 'cell' && obj.getType() !== 'node') return;
			returnEdges = returnEdges.add(edges.getByRowCol(obj.getRow(), obj.getCol() + 1));
		});
		return returnEdges;
	};
	
	
	
	
	
	$.fn.getCellN = function() {
		var returnCells = $();
		this.each((i,e) => {
			var obj = $(e);
			if (obj.getType() !== 'cell') return;
			returnCells = returnCells.add(cells.getByRowCol(obj.getRow() - 2, obj.getCol()));
		});
		return returnCells;
	};
	
	$.fn.getCellS = function() {
		var returnCells = $();
		this.each((i,e) => {
			var obj = $(e);
			if (obj.getType() !== 'cell') return;
			returnCells = returnCells.add(cells.getByRowCol(obj.getRow() + 2, obj.getCol()));
		});
		return returnCells;
	};
	
	$.fn.getCellW = function() {
		var returnCells = $();
		this.each((i,e) => {
			var obj = $(e);
			if (obj.getType() !== 'cell') return;
			returnCells = returnCells.add(cells.getByRowCol(obj.getRow(), obj.getCol() - 2));
		});
		return returnCells;
	};
	
	$.fn.getCellE = function() {
		var returnCells = $();
		this.each((i,e) => {
			var obj = $(e);
			if (obj.getType() !== 'cell') return;
			returnCells = returnCells.add(cells.getByRowCol(obj.getRow(), obj.getCol() + 2));
		});
		return returnCells;
	};
	
	
	
	
	
	
	$.fn.countEdgesOff = function() {
		var obj = this.first();
		if (obj.getType() !== 'cell' && obj.getType() !== 'node') return;
		var count = 0;
		if (obj.getEdgeN().isOff()) count++;
		if (obj.getEdgeS().isOff()) count++;
		if (obj.getEdgeW().isOff()) count++;
		if (obj.getEdgeE().isOff()) count++;
		return count;
	};
	
	$.fn.countEdgesOn = function() {
		var obj = this.first();
		if (obj.getType() !== 'cell' && obj.getType() !== 'node') return;
		var count = 0;
		if (obj.getEdgeN().isOn()) count++;
		if (obj.getEdgeS().isOn()) count++;
		if (obj.getEdgeW().isOn()) count++;
		if (obj.getEdgeE().isOn()) count++;
		return count;
	};
	
	$.fn.countEdgesX = function() {
		var obj = this.first();
		if (obj.getType() !== 'cell' && obj.getType() !== 'node') return;
		var count = 0;
		if (obj.getEdgeN().isX()) count++;
		if (obj.getEdgeS().isX()) count++;
		if (obj.getEdgeW().isX()) count++;
		if (obj.getEdgeE().isX()) count++;
		return count;
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
				grid[i][j] = nodes.eq(i / 2 * (numCols + 1) +  j / 2)
					.data({type: 'node', row: i, col: j, done: {}});
				
			} else if (i % 2 == 1 && j % 2 == 1) {
				grid[i][j] = cells.eq((i - 1) / 2 * numCols + (j - 1) / 2)
					.data({type: 'cell', row: i, col: j, done: {}});
				
			} else if (i % 2 == 0 && j % 2 == 1) {
				grid[i][j] = horzEdges.eq(i / 2 * numCols + (j - 1) / 2)
					.data({type: 'edge', edgeType: 'horz', row: i, col: j, done: {}});
				
			} else if (i % 2 == 1 && j % 2 == 0) {
				grid[i][j] = vertEdges.eq((i - 1) / 2 * (numCols + 1) +  j / 2)
					.data({type: 'edge', edgeType: 'vert', row: i, col: j, done: {}});
				
			}
			
		}
	}
	
	
	
	
	
	
	
	
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
		edges.getByRowCol(i, j).setOn();
		/*
		if (i < 0 || i > numRows * 2 || j < 0 || j > numCols  * 2) return;
		if (!grid.get(i, j).hasClass('cell-off')) return;
		grid.clickEdge(i, j);
		*/
	};
	
	grid.setEdgeStateX = function(i, j) {
		edges.getByRowCol(i, j).setX();
		/*
		if (i < 0 || i > numRows * 2 || j < 0 || j > numCols  * 2) return;
		if (!grid.get(i, j).hasClass('cell-off')) return;
		grid.clickEdge(i, j);
		grid.clickEdge(i, j);
		*/
	};
	
	/*
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
	*/
	
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
		for (var clazz of classes) {
			var match = clazz.match(/^sjo-colour-(\d+)$/);
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
		
		$('#sjo-button').attr('disabled', 'disabled');
		
		console.log(grid);
		
		// Clean up old colour tags
		edges.not('.cell-on').removeData('colour colourName');
		
		numLoops = 0; // TODO: failsafe
		
		solvePass();
		
	}
	
	function solvePass() {
		
		changed = false;
		numLoops++; // TODO: failsafe
		
		// Loop through rules
		for (var rule of rules) {
			
			if (rule.done) continue;
			
			var target = 
				(rule.target === 'node') ? nodes :
				(rule.target === 'cell') ? cells :
				(rule.target === 'edge') ? edges :
				null;
			
			target = target.filter((i,e) => {
				if ($(e).data('done')[rule.name] === true) return false;
				return true;
			});
			
			if (target.length === 0) continue;
			
			//console.log(rule.target, target.length, rule.name);
			//console.log(rule.target, rule.name);
			
			target.each((i,e) => {
				var obj = $(e);
				var done = rule.function.call(this, obj.getRow(), obj.getCol(), obj);
				if (done === true) {
					obj.data('done')[rule.name] = true;
				}
			});
			
			if (rule.once) rule.done = true;
			
			if (changed) break;
			
		}
		
		// TODO: incorporate into ruleset?
		if (!changed) {
			ColourEdges();
		} //else
		
		if (changed) {
			window.setTimeout(solvePass, 0);
		} else {
			$('#sjo-button').removeAttr('disabled');
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
					
					if (colourName && edgeToCheck.getColourName() !== colourName) {
						
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
			}
			
			// Apply colour to whole group
			edgesFound.setColour(colour).setColourName(colourName);
			//edgesFound.getNodesFromEdge().setColour(colour).setColourName(colourName);
			
		});
		
	}
	
	
	
	
	
	
	
	
	
	//////////////////////////////////////////////////////////////////////////////////////////
	
	function ColourJoinRule(row, col) {
		
		// TODO: don't mark as invalid if this is the final edge of the solution
		
		var thisEdge = edges.getByRowCol(row, col);
		if (!thisEdge.isOff()) return true;
		
		var myNodes = thisEdge.getNodesFromEdge();
		
		if (myNodes.first().getColour() && myNodes.first().getColour() === myNodes.last().getColour()) {
			grid.setEdgeStateX(row, col);
			return true;
		}
		
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	//////////////////////////////////////////////////////////////////////////////////////////
	// Rules
	//////////////////////////////////////////////////////////////////////////////////////////
	
	function NodeCompleteRule(i, j) {
		
		if (grid.getType(i, j) !== 'node') return;
		
		if (grid.countNeighboursOn(i, j) === 2) {
			grid.setNeighboursX(i, j);
			return true;
		} else if (grid.countNeighboursOn(i, j) === 1 && grid.countNeighboursX(i, j) === 2) {
			grid.setNeighboursOn(i, j);
			return true;
		} else if (grid.countNeighboursX(i, j) === 3) {
			grid.setNeighboursX(i, j);
			return true;
		}
		
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////
	
	function CellCompleteRule(i, j) {
		
		if (grid.getType(i, j) !== 'cell') return;
		var cellValue = grid.getCellValue(i, j);
		if (cellValue === null) return true;
		
		// N neighbours have been set On, all unset edges can be set X
		if (grid.countNeighboursOn(i, j) === cellValue) {
			grid.setNeighboursX(i, j);
			return true;
		}
		
		// 4 - N neighbours are set X, all unset edges can be set On
		if (grid.countNeighboursX(i, j, 1) === 4 - cellValue) {
			grid.setNeighboursOn(i, j);
			return true;
		}
		
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////

	function RowOf3sRule(i, j, cell) {
		
		if (grid.countNeighboursOff(i, j) === 0) return true;
		
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
		
		return true;
		
		// TODO: check for neighbouring 2s
		
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////
	
	function Diagonal3sRule(i, j) {
		
		if (grid.countNeighboursOff(i, j) === 0) return true;
		
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
		
		return true;
		
		// TODO: check for inbetween 2s
		
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////
	
	function TriangleOf3sRule(row, col) {
		
		var cell = cells.getByRowCol(row, col);
		
		if (cell.getCellValue() !== null) return;
		if (cell.countEdgesOff() === 0) return;
		
		if (cell.getCellW().getCellValue() === 3 && cell.getCellN().getCellValue() === 3 && cell.getCellE().getCellValue() === 3) {
			cell.getEdgeS().setX()
		}
		if (cell.getCellN().getCellValue() === 3 && cell.getCellE().getCellValue() === 3 && cell.getCellS().getCellValue() === 3) {
			cell.getEdgeW().setX()
		}
		if (cell.getCellE().getCellValue() === 3 && cell.getCellS().getCellValue() === 3 && cell.getCellW().getCellValue() === 3) {
			cell.getEdgeN().setX()
		}
		if (cell.getCellS().getCellValue() === 3 && cell.getCellW().getCellValue() === 3 && cell.getCellN().getCellValue() === 3) {
			cell.getEdgeE().setX()
		}
		
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////
	
	function Corner3Rule(i, j) {
		
		if (grid.getCellValue(i, j) !== 3) return true;
		if (grid.countNeighboursOff(i, j) === 0) return true;
		
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
	
	function Corner2Rule(i, j, cell) {
		
		if (grid.getCellValue(i, j) !== 2) return true;
		if (grid.countNeighboursOff(i, j) === 0) return true;
		
		if (cell.getNodeNW().getEdgeN().getState() === -1 && cell.getNodeNW().getEdgeW().getState() === -1) {
			if (cell.getNodeSE().getEdgeS().getState() ===  1 || cell.getNodeSE().getEdgeE().getState() ===  1) {
				cell.getEdgeN().setOn()
				cell.getEdgeW().setOn()
			}
			if (cell.getEdgeS().getState() ===  1 || cell.getEdgeE().getState() ===  1) {
				cell.getEdgeS().setOn();
				cell.getEdgeE().setOn();
			}
			if (cell.getEdgeS().getState() === -1 || cell.getEdgeE().getState() === -1) {
				cell.getEdgeS().setX();
				cell.getEdgeE().setX();
			}
		}
		
		if (cell.getNodeNE().getEdgeN().getState() === -1 && cell.getNodeNE().getEdgeE().getState() === -1) {
			if (cell.getNodeSW().getEdgeS().getState() ===  1 || cell.getNodeSW().getEdgeW().getState() ===  1) {
				cell.getEdgeN().setOn()
				cell.getEdgeE().setOn()
			}
			if (cell.getEdgeS().getState() ===  1 || cell.getEdgeW().getState() ===  1) {
				cell.getEdgeS().setOn();
				cell.getEdgeW().setOn();
			}
			if (cell.getEdgeS().getState() === -1 || cell.getEdgeW().getState() === -1) {
				cell.getEdgeS().setX();
				cell.getEdgeW().setX();
			}
		}
		
		if (cell.getNodeSW().getEdgeS().getState() === -1 && cell.getNodeSW().getEdgeW().getState() === -1) {
			if (cell.getNodeNE().getEdgeN().getState() ===  1 || cell.getNodeNE().getEdgeE().getState() ===  1) {
				cell.getEdgeS().setOn()
				cell.getEdgeW().setOn()
			}
			if (cell.getEdgeN().getState() ===  1 || cell.getEdgeE().getState() ===  1) {
				cell.getEdgeN().setOn();
				cell.getEdgeE().setOn();
			}
			if (cell.getEdgeN().getState() === -1 || cell.getEdgeE().getState() === -1) {
				cell.getEdgeN().setX();
				cell.getEdgeE().setX();
			}
		}
		
		if (cell.getNodeSE().getEdgeS().getState() === -1 && cell.getNodeSE().getEdgeE().getState() === -1) {
			if (cell.getNodeNW().getEdgeN().getState() ===  1 || cell.getNodeNW().getEdgeW().getState() ===  1) {
				cell.getEdgeS().setOn()
				cell.getEdgeE().setOn()
			}
			if (cell.getEdgeN().getState() ===  1 || cell.getEdgeW().getState() ===  1) {
				cell.getEdgeN().setOn();
				cell.getEdgeW().setOn();
			}
			if (cell.getEdgeN().getState() === -1 || cell.getEdgeW().getState() === -1) {
				cell.getEdgeN().setX();
				cell.getEdgeW().setX();
			}
		}
		
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////
	
	function Corner1Rule(i, j) {
		
		if (grid.getCellValue(i, j) !== 1) return true;
		if (grid.countNeighboursOff(i, j) === 0) return true;
		
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
	
	function Tail3Rule(i, j, cell) {
		
		if (grid.getCellValue(i, j) !== 3) return true;
		if (grid.countNeighboursOff(i, j) === 0) return true;
		
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
	
	//////////////////////////////////////////////////////////////////////////////////////////
	
	function Tail2Rule(row, col, cell) {
		
		if (cell.getCellValue() !== 2) return true;
		if (cell.countEdgesOff() === 0) return true;
		
		if (cell.getNodeNW().getEdgeN().getState() === 1 || cell.getNodeNW().getEdgeW().getState() === 1) {
			if (cell.getEdgeS().getState() === -1 || cell.getEdgeE().getState() === -1) {
				cell.getEdgeS().setOn();
				cell.getEdgeE().setOn();
				cell.getNodeNW().getEdgeN().setX();
				cell.getNodeNW().getEdgeW().setX();
			}
		}
		
		if (cell.getNodeNE().getEdgeN().getState() === 1 || cell.getNodeNE().getEdgeE().getState() === 1) {
			if (cell.getEdgeS().getState() === -1 || cell.getEdgeW().getState() === -1) {
				cell.getEdgeS().setOn();
				cell.getEdgeW().setOn();
				cell.getNodeNE().getEdgeN().setX();
				cell.getNodeNE().getEdgeE().setX();
			}
		}
		
		if (cell.getNodeSW().getEdgeS().getState() === 1 || cell.getNodeSW().getEdgeW().getState() === 1) {
			if (cell.getEdgeN().getState() === -1 || cell.getEdgeE().getState() === -1) {
				cell.getEdgeN().setOn();
				cell.getEdgeE().setOn();
				cell.getNodeSW().getEdgeS().setX();
				cell.getNodeSW().getEdgeW().setX();
			}
		}
		
		if (cell.getNodeSE().getEdgeS().getState() === 1 || cell.getNodeSE().getEdgeE().getState() === 1) {
			if (cell.getEdgeN().getState() === -1 || cell.getEdgeW().getState() === -1) {
				cell.getEdgeN().setOn();
				cell.getEdgeW().setOn();
				cell.getNodeSE().getEdgeS().setX();
				cell.getNodeSE().getEdgeE().setX();
			}
		}
		
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////
	
	function Tail1Rule(row, col, cell) {
		
		if (cell.getCellValue() !== 1) return true;
		if (cell.countEdgesOff() === 0) return true;
		
		if (cell.getNodeNW().getEdgeN().getState() * cell.getNodeNW().getEdgeW().getState() === -1) {
			cell.getEdgeS().setX();
			cell.getEdgeE().setX();
		}
		
		if (cell.getNodeNE().getEdgeN().getState() * cell.getNodeNE().getEdgeE().getState() === -1) {
			cell.getEdgeS().setX();
			cell.getEdgeW().setX();
		}
		
		if (cell.getNodeSW().getEdgeS().getState() * cell.getNodeSW().getEdgeW().getState() === -1) {
			cell.getEdgeN().setX();
			cell.getEdgeE().setX();
		}
		
		if (cell.getNodeSE().getEdgeS().getState() * cell.getNodeSE().getEdgeE().getState() === -1) {
			cell.getEdgeN().setX();
			cell.getEdgeW().setX();
		}
		
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////
	
	function EitherOr2RuleA(row, col, cell) {
		
		if (cell.getCellValue() !== 2) return true;
		if (cell.countEdgesOff() === 0) return true;
		
		if (cell.getEdgeN().getState() * cell.getEdgeW().getState() === -1) {
			if (cell.getNodeSE().getEdgeS().getState() + cell.getNodeSE().getEdgeE().getState() === -1) {
				cell.getNodeSE().getEdgeS().setOn();
				cell.getNodeSE().getEdgeE().setOn();
			}
			if (cell.getNodeSE().getEdgeS().getState() + cell.getNodeSE().getEdgeE().getState() ===  1) {
				cell.getNodeSE().getEdgeS().setX();
				cell.getNodeSE().getEdgeE().setX();
			}
		}
		
		if (cell.getEdgeN().getState() * cell.getEdgeE().getState() === -1) {
			if (cell.getNodeSW().getEdgeS().getState() + cell.getNodeSW().getEdgeW().getState() === -1) {
				cell.getNodeSW().getEdgeS().setOn();
				cell.getNodeSW().getEdgeW().setOn();
			}
			if (cell.getNodeSW().getEdgeS().getState() + cell.getNodeSW().getEdgeW().getState() ===  1) {
				cell.getNodeSW().getEdgeS().setX();
				cell.getNodeSW().getEdgeW().setX();
			}
		}
		
		if (cell.getEdgeS().getState() * cell.getEdgeW().getState() === -1) {
			if (cell.getNodeNE().getEdgeN().getState() + cell.getNodeNE().getEdgeE().getState() === -1) {
				cell.getNodeNE().getEdgeN().setOn();
				cell.getNodeNE().getEdgeE().setOn();
			}
			if (cell.getNodeNE().getEdgeN().getState() + cell.getNodeNE().getEdgeE().getState() ===  1) {
				cell.getNodeNE().getEdgeN().setX();
				cell.getNodeNE().getEdgeE().setX();
			}
		}
		
		if (cell.getEdgeS().getState() * cell.getEdgeE().getState() === -1) {
			if (cell.getNodeNW().getEdgeN().getState() + cell.getNodeNW().getEdgeW().getState() === -1) {
				cell.getNodeNW().getEdgeN().setOn();
				cell.getNodeNW().getEdgeW().setOn();
			}
			if (cell.getNodeNW().getEdgeN().getState() + cell.getNodeNW().getEdgeW().getState() ===  1) {
				cell.getNodeNW().getEdgeN().setX();
				cell.getNodeNW().getEdgeW().setX();
			}
		}
		
		
		
	}
		
	//////////////////////////////////////////////////////////////////////////////////////////
	
	function EitherOr2RuleB(row, col, cell) {
		
		if (cell.getCellValue() !== 2) return true;
		if (cell.countEdgesOff() === 0) return true;
		
		if (cell.getNodeNW().getEdgeN().getState() * cell.getNodeNW().getEdgeW().getState() === -1) {
			if (cell.getEdgeS().getState() + cell.getEdgeE().getState() === -1) {
				cell.getEdgeS().setOn();
				cell.getEdgeE().setOn();
			}
			if (cell.getEdgeS().getState() + cell.getEdgeE().getState() ===  1) {
				cell.getEdgeS().setX();
				cell.getEdgeE().setX();
			}
		}
		
		if (cell.getNodeNE().getEdgeN().getState() * cell.getNodeNE().getEdgeE().getState() === -1) {
			if (cell.getEdgeS().getState() + cell.getEdgeW().getState() === -1) {
				cell.getEdgeS().setOn();
				cell.getEdgeW().setOn();
			}
			if (cell.getEdgeS().getState() + cell.getEdgeW().getState() ===  1) {
				cell.getEdgeS().setX();
				cell.getEdgeW().setX();
			}
		}
		
		if (cell.getNodeSW().getEdgeS().getState() * cell.getNodeSW().getEdgeW().getState() === -1) {
			if (cell.getEdgeN().getState() + cell.getEdgeE().getState() === -1) {
				cell.getEdgeN().setOn();
				cell.getEdgeE().setOn();
			}
			if (cell.getEdgeN().getState() + cell.getEdgeE().getState() ===  1) {
				cell.getEdgeN().setX();
				cell.getEdgeE().setX();
			}
		}
		
		if (cell.getNodeSE().getEdgeS().getState() * cell.getNodeSE().getEdgeE().getState() === -1) {
			if (cell.getEdgeN().getState() + cell.getEdgeW().getState() === -1) {
				cell.getEdgeN().setOn();
				cell.getEdgeW().setOn();
			}
			if (cell.getEdgeN().getState() + cell.getEdgeW().getState() ===  1) {
				cell.getEdgeN().setX();
				cell.getEdgeW().setX();
			}
		}
		
		
		
		
	}
		
	//////////////////////////////////////////////////////////////////////////////////////////
	
	function EitherOr1Rule(row, col, cell) {
		
		if (cell.getCellValue() !== 1) return true;
		if (cell.countEdgesOff() === 0) return true;
		
		if (cell.getEdgeN().getState() === -1 && cell.getEdgeW().getState() === -1) {
			if (cell.getNodeSE().getEdgeS().getState() + cell.getNodeSE().getEdgeE().getState() === -1) {
				cell.getNodeSE().getEdgeS().setOn();
				cell.getNodeSE().getEdgeE().setOn();
			}
			if (cell.getNodeSE().getEdgeS().getState() + cell.getNodeSE().getEdgeE().getState() ===  1) {
				cell.getNodeSE().getEdgeS().setX();
				cell.getNodeSE().getEdgeE().setX();
			}
		}
		
		if (cell.getEdgeN().getState() === -1 && cell.getEdgeE().getState() === -1) {
			if (cell.getNodeSW().getEdgeS().getState() + cell.getNodeSW().getEdgeW().getState() === -1) {
				cell.getNodeSW().getEdgeS().setOn();
				cell.getNodeSW().getEdgeW().setOn();
			}
			if (cell.getNodeSW().getEdgeS().getState() + cell.getNodeSW().getEdgeW().getState() ===  1) {
				cell.getNodeSW().getEdgeS().setX();
				cell.getNodeSW().getEdgeW().setX();
			}
		}
		
		if (cell.getEdgeS().getState() === -1 && cell.getEdgeW().getState() === -1) {
			if (cell.getNodeNE().getEdgeN().getState() + cell.getNodeNE().getEdgeE().getState() === -1) {
				cell.getNodeNE().getEdgeN().setOn();
				cell.getNodeNE().getEdgeE().setOn();
			}
			if (cell.getNodeNE().getEdgeN().getState() + cell.getNodeNE().getEdgeE().getState() ===  1) {
				cell.getNodeNE().getEdgeN().setX();
				cell.getNodeNE().getEdgeE().setX();
			}
		}
		
		if (cell.getEdgeS().getState() === -1 && cell.getEdgeE().getState() === -1) {
			if (cell.getNodeNW().getEdgeN().getState() + cell.getNodeNW().getEdgeW().getState() === -1) {
				cell.getNodeNW().getEdgeN().setOn();
				cell.getNodeNW().getEdgeW().setOn();
			}
			if (cell.getNodeNW().getEdgeN().getState() + cell.getNodeNW().getEdgeW().getState() ===  1) {
				cell.getNodeNW().getEdgeN().setX();
				cell.getNodeNW().getEdgeW().setX();
			}
		}
		
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	//////////////////////////////////////////////////////////////////////////////////////////
	// Rules index
	//////////////////////////////////////////////////////////////////////////////////////////
	
	var rules = [];
	///*
	rules.push({name: 'RowOf3sRule',      target: 'cell', once: true,  function: RowOf3sRule});
	rules.push({name: 'Diagonal3sRule',   target: 'cell', once: true,  function: Diagonal3sRule});
	rules.push({name: 'TriangleOf3sRule', target: 'cell', once: true,  function: TriangleOf3sRule});
	
	rules.push({name: 'NodeCompleteRule', target: 'node', once: false, function: NodeCompleteRule});
	rules.push({name: 'CellCompleteRule', target: 'cell', once: false, function: CellCompleteRule});
	
	rules.push({name: 'Corner3Rule',      target: 'cell', once: false, function: Corner3Rule});
	rules.push({name: 'Corner2Rule',      target: 'cell', once: false, function: Corner2Rule});
	rules.push({name: 'Corner1Rule',      target: 'cell', once: false, function: Corner1Rule});
	
	rules.push({name: 'Tail3Rule',        target: 'cell', once: false, function: Tail3Rule});
	rules.push({name: 'Tail2Rule',        target: 'cell', once: false, function: Tail2Rule});
	rules.push({name: 'Tail1Rule',        target: 'cell', once: false, function: Tail1Rule});
	
	rules.push({name: 'EitherOr2RuleA',   target: 'cell', once: false, function: EitherOr2RuleA});
	rules.push({name: 'EitherOr2RuleB',   target: 'cell', once: false, function: EitherOr2RuleB});
	rules.push({name: 'EitherOr1Rule',    target: 'cell', once: false, function: EitherOr1Rule});

	rules.push({name: 'ColourJoinRule',   target: 'edge', once: false, function: ColourJoinRule});
	//*/

	
	
	
	
	
	
	
	// Start automatically
	solve();
	
	
		
});
})(jQuery);
