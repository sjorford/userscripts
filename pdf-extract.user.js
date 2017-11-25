// ==UserScript==
// @name           PDF extract
// @namespace      sjorford@gmail.com
// @version        2017-11-25
// @author         Stuart Orford
// @include        *.PDF
// @include        *.pdf
// @include        *.pdf#*
// @include        *.pdf?*
// @require        https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// @grant          none
// ==/UserScript==

$(function() {
	
	polyfill();
	
	$(`<style>
		.sjo-pdf-extract {width: auto;}
		.sjo-pdf-box {display: inline-block; position: fixed; width: calc(100% - 200px); height: 40%; left: 100px; top: 100px; overflow-y: scroll; border: 1px solid blue; background-color: white;}
		.sjo-pdf-toolbar {display: inline-block; position: absolute; top: 0px; right: 0px; border: 1px solid blue; background-color: white;}
		.sjo-pdf-toolbar span {padding: 2px 10px; font-weight: bold;}
	</style>`).appendTo('head');
	
	var numBoxes = [];
	var numPagesDone = 0;
	var timer;
	var box, table;
	
	// Add button to toolbar
	$('<button class="sjo-pdf-extract toolbarButton">Extract text</button>')
		.prependTo('#toolbarViewerRight')
		.click(() => box ? box.show() : startExtract());
	
	function startExtract() {
		
		box = $('<div class="sjo-pdf-box"></div>').appendTo('body')
		table = $('<table class="sjo-pdf-table"></table>').appendTo(box);
		
		// Add a toolbar
		var toolbar = $('<div class="sjo-pdf-toolbar"></div>').prependTo('.sjo-pdf-box');
		$('<span>Select all</span>').appendTo(toolbar).click(() => selectRange(table));
		$('<span class="sjo-pdf-status">Working...</span>').appendTo(toolbar);
		$('<span>Close</span>').appendTo(toolbar).click(() => box.hide());
		
		timer = window.setInterval(checkPages, 200);
		checkPages();
		
	}
	
	function checkPages() {
		
		// Loop through pages
		var allPages = $('.page');
		allPages.each(function(index, element) {
			var page = $(element);
			window.console.log(page);
			//var pageNo = page.attr('id').replace(/^pageContainer/, '');
			var pageNo = page.attr('data-page-number');
			
			// Check if this page has been processed already
			var textBoxes = page.find('.textLayer div');
			window.console.log(textBoxes.length, numBoxes[pageNo]);
			if (textBoxes.length == 0) return;
			if (numBoxes[pageNo] && textBoxes.length <= numBoxes[pageNo]) return;
			
			if (!numBoxes[pageNo]) {
				numPagesDone++;
				$('.sjo-pdf-status').text(numPagesDone + ' of ' + allPages.length + ' pages done');
			}
			numBoxes[pageNo] = textBoxes.length;
			window.console.log(pageNo, numBoxes[pageNo], textBoxes);
			
			// Remove existing rows for this page
			$('tr[sjo-pdf-page=' + pageNo + ']', table).remove();
			
			// Loop through elements on this page and store them
			var outputBoxes = [];
			var boxNo = 0;
			textBoxes.each(function(index, element) {
				
				// Add this box to the stack
				var textBox = $(element);
				var text = textBox.text();
				var canvasWidth = textBox.attr('data-canvas-width');
				var scalingMatches = textBox.css('transform').match(/^matrix\(([0-9\.]+), 0, 0, 1, 0, 0\)$/);
				var scaling = scalingMatches ? scalingMatches[1] : 1;
				var outputBox = {
					'ok': true,
					'index': boxNo++,
					'row': '',
					'col': '',
					'colspan': 1,
					'text': text,
					'showme': '"' + text + '"',
					'top': Math.round10(textBox.position().top, -3),
					'left': Math.round10(textBox.position().left, -3),
					'height': Math.round10(textBox.height(), -3),
					'width': Math.round10(canvasWidth ? canvasWidth : textBox.width() * scaling, -3),
					'width1': canvasWidth ? Math.round10(canvasWidth, -3) : '',
					'width2': Math.round10(textBox.width(), -3),
					'width3': Math.round10(textBox.width() * scaling, -3),
					'scaling': scaling
				};
				outputBoxes.push(outputBox);
				
			});
			
			// Loop through all boxes from top to bottom and assign row numbers
			outputBoxes.sort(function(a, b) {
				return a.top - b.top
			});
			var rowNo = 0;
			var rowGuide = 0;
			$.each(outputBoxes, function(index, element) {
				var thisBox = element;
				if (thisBox.ok) {
					if (thisBox.top > rowGuide) {
						rowNo++;
						rowGuide = thisBox.top + thisBox.height / 2;
					}
				}
				thisBox.row = rowNo;
			});
			
			// Loop through all boxes and consolidate adjacent boxes
			var changed;
			do {
				changed = false;
				$.each(outputBoxes, function(index, element) {
					var thisBox = element;
					if (!thisBox.ok) return;
					
					// Find next adjacent box
					var thatBox = $.grep(outputBoxes, function(element, index) {
						return element.ok && element.row == thisBox.row && element.index != thisBox.index && Math.abs(element.left - (thisBox.left + thisBox.width)) < (element.height / 2);
					})[0];
					if (!thatBox) return;
					
					// Consolidate boxes
					var addSpace = thisBox.text.slice(-1) != ' ' && Math.abs(thatBox.left - (thisBox.left + thisBox.width)) > 0.5;
					thisBox.text = thisBox.text + (addSpace ? ' ' : '') + thatBox.text;
					thisBox.showme = thisBox.showme + ' + ' + (addSpace ? '" " + ' : '') + thatBox.showme;
					thisBox.width = Math.round10(thatBox.left + thatBox.width - thisBox.left, -3);
					thatBox.ok = false;
					changed = true;
					
				});
			} while (changed);
			
			// Loop through all boxes from left to right and assign columns
			outputBoxes.sort(function(a, b) {
				return a.left - b.left;
			});
			var colNo = 1;
			//var colStart = 0;
			$.each(outputBoxes, function(index, element) {
				var thisBox = element;
				if (thisBox.ok) {
					
					// Find an existing box in this column on this row
					var prevBoxes = $.grep(outputBoxes, function(element, index) {
						return element.col == colNo && element.row == thisBox.row; // && element.left > colStart;
					});
					
					if (prevBoxes.length > 0) {
						
						// Increment column
						colNo++;
						var maxColStart = element.left;
						
						// 1 AAAAAA                 FFFFFFFFFFFFFFFF               LLLLLLLLLL
						// 2 BBBBBBBBBB           GGGGGGGGGGGGGGGGGGGGGGGGGG        MMMMMMMMMMMM
						// 3 CCCCCCCCC              HHHH                          NNNNNNNNNNNNNNNNN
						// 4                   JJJJJJJJJJJJJJJJJJ
						// 5 DDDD                      KKKKKKKKKKKKKKK
						// 6 EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
						// 7 KKKKKKKKKKKKKK
						
						// search from left
						// A+B+C+D+E = column 1
						// J = column 1, because nothing is to the left of it
						// G = column 2, because B is to the left of it
						// so column 2 must start somewhere between the end of B and start of G
						// ignore E, as it starts before the end of B and ends after the start of G
						// J overlaps the start of G but not the end of B
						// so move the end of the column 2 start range back to the start of J
						// and put J in column 2
						// K overlaps the end of B but not the start of G
						// so leave it in column 1
						// we now have the start position of column 2
						// so find anything from column 1 that overlaps it (E), and increment colspan
						
						// Find the furthest left that this column can start
						var minColStart = 0;
						for (var a = 0; a < index; a++) {
							var prevRight = outputBoxes[a].left + outputBoxes[a].width;
							if (prevRight > minColStart && prevRight < maxColStart) {
								minColStart = prevRight;
							}
						}
						
						// Walk back through boxes and move them into this column if necessary
						for (var b = index - 1; b >= 0; b--) {
							if (outputBoxes[b].left > minColStart && outputBoxes[b].left + outputBoxes[b].width > maxColStart) {
								maxColStart = outputBoxes[b].left + outputBoxes[b].width;
								outputBoxes[b].col = colNo;
							}
						}
						
						// Find all boxes in previous columns that overlap this new column, and increment their colspan
						window.console.log(colNo, 'maxColStart', maxColStart);
						$.each(outputBoxes, function(index, element) {
							if (element.col && element.left + element.width > maxColStart) {
								element.colspan++;
							}
						});
						
					}
					
				}
				thisBox.col = colNo;
			});
			
			// Sort all boxes by row and column
			outputBoxes.sort(function(a, b) {
				if (a.row == b.row) {
					return a.col - b.col;
				} else {
					return a.row - b.row;
				}
			});
			
			// Output boxes
			$.each(outputBoxes, function(index, element) {
				
				if (false) {
					
					// Output raw data
					$('<tr></tr>')
						.attr({'sjo-pdf-page': pageNo})
						.css({'background-color': element.ok ? 'auto' : 'lightgrey'})
						.append('<td>' + pageNo + '</td>')
						.append('<td>' + element.row + '</td>')
						.append('<td>' + element.col + '</td>')
						.append('<td>' + element.colspan + '</td>')
						.append('<td>' + element.text + '</td>')
						.append('<td>' + element.top + '</td>')
						.append('<td>' + element.left + '</td>')
						.append('<td>' + element.height + '</td>')
						.append('<td>' + element.width + '</td>')
						.append('<td>' + element.width1 + '</td>')
						.append('<td>' + element.width2 + '</td>')
						.append('<td>' + element.width3 + '</td>')
						.append('<td style="color: blue;">' + element.scaling + '</td>')
						.append('<td>' + element.showme + '</td>')
						.appendTo(table);
						
				} else {
					if (!element.ok) return;
					
					// Get table row
					var outputRow = $('tr[sjo-pdf-page=' + pageNo + '][sjo-pdf-row=' + element.row + ']');
					if (outputRow.length == 0) {
						outputRow = $('<tr></tr>')
							.attr({'sjo-pdf-page': pageNo, 'sjo-pdf-row': element.row})
							.appendTo(table);
						for (var i = 1; i <= colNo; i++) {
							outputRow.append('<td sjo-pdf-col=' + i + '></td>');
						}
					}
					
					// Populate cell
					var outputCell = outputRow.find('td[sjo-pdf-col=' + element.col + ']').eq(0);
					if (outputCell.length == 0) {
						outputRow.css({'background-color': 'pink'});
					} else {
						outputCell.text(element.text);
						if (element.colspan > 1) {
							outputCell.attr('colspan', element.colspan);
							for (i = element.col + 1; i < element.col + element.colspan; i++) {
								outputRow.find('td[sjo-pdf-col=' + i + ']').remove();
							}
						}
					}
					
				}
				
			});
			
			// Move table rows to the correct place in the table
			$('tr', table).filter(function(index, element) {
				return $(element).attr('sjo-pdf-page') - pageNo > 0;
			}).appendTo(table);
			
		});
		
	}
	
	function selectRange(element) {
		var range = document.createRange();
		range.selectNodeContents($(element).get(0));
		var selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
	}
	
});

// Polyfill
function polyfill() {
  /**
   * Decimal adjustment of a number.
   *
   * @param {String}  type  The type of adjustment.
   * @param {Number}  value The number.
   * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
   * @returns {Number} The adjusted value.
   */
  function decimalAdjust(type, value, exp) {
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // If the value is not a number or the exp is not an integer...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  }

  // Decimal round
  if (!Math.round10) {
    Math.round10 = function(value, exp) {
      return decimalAdjust('round', value, exp);
    };
  }
  // Decimal floor
  if (!Math.floor10) {
    Math.floor10 = function(value, exp) {
      return decimalAdjust('floor', value, exp);
    };
  }
  // Decimal ceil
  if (!Math.ceil10) {
    Math.ceil10 = function(value, exp) {
      return decimalAdjust('ceil', value, exp);
    };
  }
}
