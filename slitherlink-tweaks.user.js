// ==UserScript==
// @name           Slitherlink tweaks
// @namespace      sjorford@gmail.com
// @version        2025.02.27.2
// @author         Stuart Orford
// @match          https://www.puzzle-loop.com/*
// @grant          none
// @require        https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

(function($) {
$(function() {
	
	$(`<style>
		#MainContainer {overflow: scroll !important;}
		#puzzleContainer {margin-right: 10px !important;}
		#puzzleContainerOverflowDiv {overflow: initial !important;}
	</style>`).appendTo('head');
	
	var debug = false;
	
	var numCols, numRows;
	var horzLinesGrid = [];
	var vertLinesGrid = [];
	var nextColor = 1;
	var threshold = 25;
	
	var allLinesFlat = $('.loop-line');
	var horzLinesFlat = allLinesFlat.filter('.loop-horizontal');
	var vertLinesFlat = allLinesFlat.filter('.loop-vertical');
	
	indexLines();
	countLines();
	colorLines();
	
	if (debug) console.log('numCols', numCols, 'horzLinesGrid', horzLinesGrid);
	if (debug) console.log('numRows', numRows, 'vertLinesGrid', vertLinesGrid);
	
	function indexLines() {
		
		numCols = horzLinesFlat.filter('[style*="top: 0px"]') .length;
		numRows = vertLinesFlat.filter('[style*="left: 0px"]').length;
		
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
		
		var colors = [
			'blue',
			'orange',
			'hotpink',
			'cornflowerblue',
			'olive',
			'rebeccapurple',
			'teal',
			'greenyellow',
			'lightblue',
			'mediumaquamarine',
			'indigo',
		];
		
		for (var c = 1; c < nextColor; c++) {
			var lines = allLinesFlat.filter('.sjo-color-' + c);
			if (lines.length >= threshold) {
				var color = colors.shift();
				lines.css("background-color", color);
			}
		}
		
	}
	
});
})(jQuery);
