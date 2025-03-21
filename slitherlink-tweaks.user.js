// ==UserScript==
// @name           Slitherlink tweaks
// @namespace      sjorford@gmail.com
// @version        2025.03.22.0
// @author         Stuart Orford
// @match          https://www.puzzle-masyu.com/*
// @match          https://www.puzzle-shingoki.com/*
// @grant          none
// ==/UserScript==

(function($) {
$(function() {
	
	var debug = true;
	
	$(`<style>
		#MainContainer {overflow: scroll !important;}
		#puzzleContainer {margin-right: 10px !important;}
		#puzzleContainerOverflowDiv {overflow: initial !important;}
	</style>`).appendTo('head');
	
	var colors = [
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
		'gold',
		'indigo',
	];
	
	var colorStyles = colors.map(color => `.cell-on.color-${color} {background-color: ${color};}`);
	$('<style>\n' + colorStyles.join('\n') + '</style>').appendTo('head');
	
	
	
	
	
	var numCols, numRows;
	var horzLinesGrid = [];
	var vertLinesGrid = [];
	var nextColor = 1;
	var threshold = 15;
	
	var allLinesFlat = $('.loop-line');
	var horzLinesFlat = allLinesFlat.filter('.loop-horizontal');
	var vertLinesFlat = allLinesFlat.filter('.loop-vertical');
	
	if (debug) console.log('horzLinesFlat', horzLinesFlat);
	if (debug) console.log('vertLinesFlat', vertLinesFlat);
	
	indexLines();
	countLines();
	colorLines();
	
	if (debug) console.log('numCols', numCols, 'horzLinesGrid', horzLinesGrid);
	if (debug) console.log('numRows', numRows, 'vertLinesGrid', vertLinesGrid);
	
	function indexLines() {
		
		//numCols = horzLinesFlat.filter('[style*="top: 0px"],  [style*="top: 1px"]') .length;
		//numRows = vertLinesFlat.filter('[style*="left: 0px"], [style*="left: 1px"]').length;
		
		// Now with added algebra
		var nh = horzLinesFlat.length;
		var nv = vertLinesFlat.length;
		var foo = nh - nv + 1;
		numRows = Math.round(Math.sqrt((foo * foo + 4 * nv) / 4) - (foo / 2));
		numCols = nh / (numRows + 1);
		
		console.log('numRows', numRows, 'numCols', numCols);
		
		
		
		
		for (var row = 0; row <= numRows; row++) {
			horzLinesGrid[row] = [];
			for (var col = 0; col < numCols; col++) {
				horzLinesGrid[row][col] = horzLinesFlat.eq(row * numCols + col);
			}
		}
		
		for (var row = 0; row < numRows; row++) {
			vertLinesGrid[row] = [];
			for (var col = 0; col <= numCols; col++) {
				vertLinesGrid[row][col] = vertLinesFlat.eq(row * (numCols + 1) + col);
			}
		}
		
	}
	
	function getHorzLineColor(row, col) {
		if (row < 0 || row > numRows || col < 0 || col >= numCols) return null;
		return horzLinesGrid[row][col].data('sjo-color');
	}
	
	function getVertLineColor(row, col) {
		if (row < 0 || row >= numRows || col < 0 || col > numCols) return null;
		return vertLinesGrid[row][col].data('sjo-color');
	}
	
	function countLines() {
		
		// NOTE: this does not reset the grid, so it can just run once
		
		var gridChanged;
		
		var numLoops = 0; // failsafe
		
		do {
			numLoops++;
			
			gridChanged = false;
			
			// Horizontal lines
			for (var row = 0; row <= numRows; row++) {
				for (var col = 0; col < numCols; col++) {
					
					var adjColors = [];
					adjColors[0] = getHorzLineColor(row, col - 1);
					adjColors[1] = getHorzLineColor(row, col + 1);
					adjColors[2] = getVertLineColor(row - 1, col);
					adjColors[3] = getVertLineColor(row - 1, col + 1);
					adjColors[4] = getVertLineColor(row, col);
					adjColors[5] = getVertLineColor(row, col + 1);
					
					var lineChanged = updateLine(horzLinesGrid[row][col], adjColors, row, col);
					if (lineChanged) gridChanged = true;
					
				}
			}
			
			// Vertical lines
			for (var row = 0; row < numRows; row++) {
				for (var col = 0; col <= numCols; col++) {
					
					var adjColors = [];
					adjColors[0] = getVertLineColor(row - 1, col);
					adjColors[1] = getVertLineColor(row + 1, col);
					adjColors[2] = getHorzLineColor(row, col - 1);
					adjColors[3] = getHorzLineColor(row, col);
					adjColors[4] = getHorzLineColor(row + 1, col - 1);
					adjColors[5] = getHorzLineColor(row + 1, col);
					
					var lineChanged = updateLine(vertLinesGrid[row][col], adjColors, row, col);
					if (lineChanged) gridChanged = true;
					
				}
			}
			
		} while (gridChanged && numLoops < 1000);
		
	}
	
	function updateLine(line, adjColors, row, col) {
		if (!line.hasClass('cell-on')) return;
		
		var curColor = line.data('sjo-color');
		var lineChanged = false;
		
		// Find better color
		for (var c in adjColors) {
			if (curColor == null || (adjColors[c] != null && adjColors[c] < curColor)) {
				curColor = adjColors[c];
				lineChanged = true;
			}
		}
		
		// If still no color set, assign a new one
		if (curColor == null) {
			curColor = nextColor;
			nextColor++;
			lineChanged = true;
		}
		
		if (lineChanged) {
			line.data('sjo-color', curColor);
			line.removeClass(function(index, className) {
				var classes = className.split(' ');
				for (var i in classes) {
					if (classes[i].match(/^sjo-/)) return classes[i];
				}
				return '';
			});
			line.addClass('sjo-color-' + curColor);
		}
		
		return lineChanged;
	}
	
	function colorLines() {
		if (debug) console.log('colorLines', nextColor);
		
		for (var c = 1; c < nextColor; c++) {
			var lines = allLinesFlat.filter('.sjo-color-' + c);
			if (lines.length >= threshold) {
				var color = colors.shift();
				lines.addClass('color-' + color);
			}
		}
		
	}
	
});
})(jQuery);
