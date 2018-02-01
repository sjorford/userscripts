// ==UserScript==
// @name           Twitter sidebar
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @version        2018.02.01b
// @match          https://twitter.com
// @match          https://twitter.com/*
// @grant          GM_xmlhttpRequest
// @connect        api.jsonbin.io
// @run-at         document-idle
// @require        https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.20.1/moment.min.js
// @require        https://raw.githubusercontent.com/sjorford/userscripts/master/lib/uiSortable.js
// ==/UserScript==

// TODO:
// icons for different types
// allow different types of searches
// hashtags?
// something else I can't remember now

$(`<style>
	
	.sjo-sidebar-item {margin-bottom: 0.25em; padding-left: 0.5em;}
	.sjo-sidebar-item-url     {list-style: "?";}
	.sjo-sidebar-item-user    {list-style: "U";}
	.sjo-sidebar-item-list    {list-style: "L";}
	.sjo-sidebar-item-search  {list-style: "S";}
	.sjo-sidebar-item-hashtag {list-image: "#";}
	
	.sjo-sidebar-link {color: #14171a; font-size: 14px; font-weight: bold; }
	.sjo-sidebar-link:hover {color: #0084B4;}
	.sjo-sidebar-separator::before {content: "\u2053"; text-align: center; display: block; width: 100%;}
	
	.sjo-sidebar-input-key, .sjo-sidebar-input-secret {display: block;}
	.sjo-sidebar-button-delete {display: none; float: right;}
	
	.sjo-sidebar-button-editkey    {display: none;}
	.sjo-sidebar-functions-editkey {display: none;}
	.sjo-sidebar-functions-read    {display: none;}
	.sjo-sidebar-functions-edit    {display: none;}
	.sjo-sidebar-functions-locked  {display: none;}
	
	.sjo-sidebar-status-nokey   .sjo-sidebar-button-editkey    {display: inline-block;}
	.sjo-sidebar-status-editkey .sjo-sidebar-functions-editkey {display: inline-block;}
	.sjo-sidebar-status-read    .sjo-sidebar-button-editkey    {display: inline-block;}
	.sjo-sidebar-status-read    .sjo-sidebar-functions-read    {display: inline-block;}
	.sjo-sidebar-status-edit    .sjo-sidebar-functions-edit    {display: inline-block;}
	.sjo-sidebar-status-edit    .sjo-sidebar-button-delete     {display: inline-block;}
	.sjo-sidebar-status-locked  .sjo-sidebar-functions-locked  {display: inline-block;}
	
	.sjo-sidebar-status-edit .sjo-sidebar-link {cursor: text;}
	.sjo-sidebar-button-tick::before {content: "\u2713"; padding-left: 0.5em; color: green; font-weight: bold;}
	.sjo-sidebar-button-cross::before {content: "\u2715"; padding-left: 0.5em; color: red; font-weight: bold;}
	
</style>`).appendTo('head');

$(function() {
	
	var timer, sidebarItems = [], binID, secret;
	var pageID = Math.random();
	
	// Poll status once a second
	checkStatus();
	timer = setInterval(checkStatus, 1000);
	
	// Allow the timer to be stopped from the console
	window.sjoStopTimer = function() {clearTimeout(timer);};
	
	function checkStatus() {
		
		// Check if sidebar has been added
		var myModule = $('.sjo-sidebar-module');
		if (myModule.length == 0) {
			myModule = addSidebar();
			myModule = $('.sjo-sidebar-module');
		}
		if (myModule.length == 0) return;
		
		var editingPageID = localStorage.getItem('sjoSidebarPageID');
		//console.log(editingPageID);
		
		// Check if this page has lost editability
		if (editingPageID != pageID && myModule.hasClass('sjo-sidebar-status-edit')) {
			console.log(editingPageID, pageID, 'resetting sidebar');
			renderSidebarItems();
			$('.sjo-sidebar-list').sortable('option', 'disabled', true);
			setStatus('sjo-sidebar-status-read');
		}
		
		// Check if this page needs locking
		if (editingPageID && editingPageID != pageID && !myModule.hasClass('sjo-sidebar-status-locked')) {
			console.log(editingPageID, pageID, 'locking sidebar');
			setStatus('sjo-sidebar-status-locked');
		}
		
		// Check if this page can be unlocked
		if (!editingPageID && myModule.hasClass('sjo-sidebar-status-locked')) {
			console.log(editingPageID, pageID, 'unlocking sidebar');
			loadSidebarItems();
		}
		
	}
	
	// Page event handlers
	$(window).on('unload beforeunload', event => {
		console.log('unload event');
		var editingPageID = localStorage.getItem('sjoSidebarPageID');
		if (editingPageID == pageID) {
			console.log('unlocking due to unload event');
			localStorage.setItem('sjoSidebarPageID', '');
		}
	});
	
	function addSidebar() {
		
		var twitterModules = $('.dashboard, .SidebarCommonModules').find('.module');
		if (twitterModules.length == 0) return;
		console.debug('addSidebar');
		
		// Add sidebar
		var module = $('<div class="module sjo-sidebar-module"></div>').insertAfter(twitterModules.first()).addClass('sjo-sidebar-status-read');
		var flexModule = $('<div class="flex-module"></div>').appendTo(module);
		var flexModuleHeader = $('<div class="flex-module-header"><h3>More</h3></div>').appendTo(flexModule);
		var flexModuleInner = $('<div class="flex-module-inner sjo-sidebar"></div>').appendTo(flexModule);
		
		// Add jQueryUI Sortable if missing
		// Loading it with @require fails because of conflict with in-page scripts
		if (!$.fn.sortable) uiSortable();
		
		// Add sortable list
		// TODO: should this be update instead of stop?
		var sortableContainer = $('<ul class="sjo-sidebar-list"></ul>').appendTo(flexModuleInner).sortable({disabled: true});
		
		// Add buttons
		var buttonWrapper = $(`<div>
				<a href="" class="sjo-sidebar-button-editkey">Key</a>
				<span class="sjo-sidebar-functions-editkey">
					<input type="text" class="sjo-sidebar-input-key">
					<input type="text" class="sjo-sidebar-input-secret">
					<a href="" class="sjo-sidebar-button-setkey">Set</a>
				  • <a href="" class="sjo-sidebar-button-cancelkey">Cancel</a>
				</span>
				<span class="sjo-sidebar-functions-read">
				  • <a href="" class="sjo-sidebar-button-edit">Edit</a>
				</span>
				<span class="sjo-sidebar-functions-edit">
					<a href="" class="sjo-sidebar-button-add">Add current page</a>
				  • <a href="" class="sjo-sidebar-button-separator">Add separator</a>
				<br><a href="" class="sjo-sidebar-button-done">Done</a>
				  • <a href="" class="sjo-sidebar-button-cancel">Cancel</a>
				</span>
				<span class="sjo-sidebar-functions-locked">
					<a href="" class="sjo-sidebar-button-unlock">Unlock</a>
				</span>
			</div>`).appendTo(flexModuleInner);
		
		// Get data URL
		binID = localStorage.getItem('sjoSidebarBinID');
		secret = localStorage.getItem('sjoSidebarSecret');
		//console.log('storage keys', binID, secret);
		if (binID) {
			$('.sjo-sidebar-input-key').val(binID);
			$('.sjo-sidebar-input-secret').val(secret);
			loadSidebarItems();
		} else {
			setStatus('sjo-sidebar-status-nokey');
		}
		
	}
	
	// Button event handlers
	$('body')
		.on('click', '.sjo-sidebar-button-editkey', enterStorageKey)
		.on('click', '.sjo-sidebar-button-setkey', setStorageKey)
		.on('click', '.sjo-sidebar-button-cancelkey', cancelStorageKey)
		.on('click', '.sjo-sidebar-button-edit', editSidebar)
		.on('click', '.sjo-sidebar-button-add', addSidebarItem)
		.on('click', '.sjo-sidebar-button-delete', deleteSidebarItem)
		.on('click', '.sjo-sidebar-button-separator', addSeparator)
		.on('click', '.sjo-sidebar-button-done', saveSidebarChanges)
		.on('click', '.sjo-sidebar-button-cancel', cancelEditing)
		.on('click', '.sjo-sidebar-button-unlock', unlockSidebar)
		.on('click', '.sjo-sidebar-status-edit .sjo-sidebar-link', editSidebarItem);
	
	// Edit storage key
	function enterStorageKey(event) {
		event.preventDefault();
		console.log('enter storage key');
		setStatus('sjo-sidebar-status-editkey');
		$('.sjo-sidebar-input-key').focus();
	}
	
	// Save storage key
	function setStorageKey(event) {
		event.preventDefault();
		console.log('set storage keys');
		binID = $('.sjo-sidebar-input-key').val();
		secret = $('.sjo-sidebar-input-secret').val();
		//console.log(binID, secret);
		localStorage.setItem('sjoSidebarBinID', binID);
		localStorage.setItem('sjoSidebarSecret', secret);
		resetSidebar();
		if (binID) {
			loadSidebarItems();
		} else {
			setStatus('sjo-sidebar-status-nokey');
		}
	}
	
	function cancelStorageKey(event) {
		event.preventDefault();
		console.log('cancel storage key editing');
		if (binID) {
			setStatus('sjo-sidebar-status-read');
		} else {
			setStatus('sjo-sidebar-status-nokey');
		}
	}
	
	// Switch to edit mode
	function editSidebar(event) {
		event.preventDefault();
		console.log('edit sidebar');
		localStorage.setItem('sjoSidebarPageID', pageID);
		$('.sjo-sidebar-list').sortable('option', 'disabled', false);
		setStatus('sjo-sidebar-status-edit');
	}
	
	// Add current page to sidebar
	// TODO: add different types of items
	function addSidebarItem(event) {
		event.preventDefault();
		
		var newItem = {};
		
		var urlMatch = window.location.href.match(/^https:\/\/twitter.com\/(([_A-Za-z0-9]+)$|search\?(.+&)?q=([^&]*)(&.*)?$|([_A-Za-z0-9]+)\/lists\/([-_A-Za-z0-9]+)$|.*$)/);
		console.log(urlMatch);
		
		if (urlMatch[2]) {
			newItem.type = 'user';
			newItem.user = urlMatch[2];
		} else if (urlMatch[4]) {
			newItem.type = 'search';
			newItem.query = urlMatch[4];
		} else if (urlMatch[6]) {
			newItem.type = 'list';
			newItem.user = urlMatch[6];
			newItem.list = urlMatch[7];
		} else {
			newItem.type = 'url';
			newItem.href = window.location.href;
		}
		
		newItem.display = $('.SearchNavigation-titleText, .js-list-name, .ProfileHeaderCard-nameLink').text().trim() || 'TBA';
		console.log(newItem);
		
		renderItem(newItem);
		
	}
	
	// Delete a sidebar item
	function deleteSidebarItem(event) {
		event.preventDefault();
		var li = $(event.target).closest('li');
		var data = li.data('sjoSidebarItem');
		li.remove();
	}
	
	function addSeparator(event) {
		event.preventDefault();
		var newItem = {type: 'separator'};
		renderItem(newItem);
	}
	
	// Edit a sidebar item
	function editSidebarItem(event) {
		event.preventDefault();
		console.log('editSidebarItem');
		
		// Check if another item is being edited
		// TODO: if another item is clicked, refocus on that item?
		if ($('.sjo-sidebar-input-text').length == 0) {
			
			// Disable other actions
			$('.sjo-sidebar-list').sortable('option', 'disabled', true);
			$('.sjo-sidebar-button-delete').hide();
			
			// Get the item to be edited
			var link = $(event.target).hide();
			var li = link.closest('li');
			var data = li.data('sjoSidebarItem');
			var newData = JSON.parse(JSON.stringify(data));
			li.data('sjoSidebarItem', newData);
			
			// Create an input box
			var wrapper = $('<span></span>').appendTo(li);
			var input = $('<input type="text" class="sjo-sidebar-input-text">').appendTo(wrapper).val(data.display).focus();
			$('<a href="" class="sjo-sidebar-button-tick"></span>').appendTo(wrapper).click(event => end(event, true));
			$('<a href="" class="sjo-sidebar-button-cross"></span>').appendTo(wrapper).click(event => end(event, false));
			
		}
		
		function end(event, update) {
			event.preventDefault();
			console.log('editSidebarItem', 'end', update);
			if (update) {
				newData.display = input.val();
				link.text(input.val());
			}
			wrapper.remove();
			link.show();
			$('.sjo-sidebar-list').sortable('option', 'disabled', false);
			$('.sjo-sidebar-button-delete').show();
		}
		
	}
	
	
	
	
	
	// Save changes and switch back to read mode
	function saveSidebarChanges(event) {
		event.preventDefault();
		console.log('save sidebar');
		sidebarItems = $('.sjo-sidebar-list li').toArray().map(element => $(element).data('sjoSidebarItem'));
		console.log(sidebarItems);
		localStorage.setItem('sjoSidebarItems', JSON.stringify(sidebarItems));
		var options = {
			method: 'PUT',
			url: 'https://api.jsonbin.io/b/' + binID,
			headers: {
				'content-type': 'application/json',
				'secret-key': secret
			},
			data: JSON.stringify(sidebarItems),
			onload: response => console.log('sidebar online save succeeded', response), 
			onerror: response => console.log('sidebar online save failed', response.statusText, response)
		};
		GM_xmlhttpRequest(options);
		localStorage.setItem('sjoSidebarUpdated', moment().format('YYYY-MM-DD HH:mm:ss'));
		renderSidebarItems();
		localStorage.setItem('sjoSidebarPageID', '');
		setStatus('sjo-sidebar-status-read');
	}
	
	// Cancel editing and switch back to read mode
	function cancelEditing(event) {
		event.preventDefault();
		console.log('cancel editing');
		renderSidebarItems();
		$('.sjo-sidebar-list').sortable('option', 'disabled', false);
		localStorage.setItem('sjoSidebarPageID', '');
		setStatus('sjo-sidebar-status-read');
	}
	
	// Unlock sidebar
	function unlockSidebar(event) {
		event.preventDefault();
		console.log('unlock sidebar');
		$('.sjo-sidebar-list').sortable('option', 'disabled', false);
		localStorage.setItem('sjoSidebarPageID', '');
		setStatus('sjo-sidebar-status-read');
	}
	
	
	
	
	
	// Blank the sidebar
	function resetSidebar() {
		$('.sjo-sidebar-list').empty();
	}
	
	// Load sidebar items from storage
	function loadSidebarItems() {
		console.log('load sidebar items');
		var lastUpdate = localStorage.getItem('sjoSidebarUpdated');
		//console.log('last update', lastUpdate);
		if (!lastUpdate || moment(lastUpdate, 'YYYY-MM-DD HH:mm:ss').isBefore(moment().subtract(1, 'minutes'))) {
			console.log('updating from online storage', lastUpdate);
			var options = {
				method: 'GET',
				url: 'https://api.jsonbin.io/b/' + binID + '/latest',
				headers: {
					'secret-key': secret
				},
				onload: loadSidebarItemsCallback,
				onerror: response => console.log(response.statusText)
			};
			//console.log('GM_xmlhttpRequest', options);
			GM_xmlhttpRequest(options);
		} else {
			sidebarItems = JSON.parse(localStorage.getItem('sjoSidebarItems'));
			//console.log(JSON.stringify(sidebarItems));
			renderSidebarItems();
			setStatus('sjo-sidebar-status-read');
		}
	}
	
	function loadSidebarItemsCallback(response) {
		//console.log('online storage response', response);
		if (response.status == 200) {
			console.log('online storage found');
			if (response.responseText) {
				var data = response.responseText ? JSON.parse(response.responseText) : {};
				sidebarItems = data;
				localStorage.setItem('sjoSidebarItems', JSON.stringify(sidebarItems));
				renderSidebarItems();
			}
			setStatus('sjo-sidebar-status-read');
		} else {
			console.log('online storage not found', response.status, response.statusText, response.responseText);
		}
	}
	
	// Render all sidebar items
	function renderSidebarItems() {
		console.log('render sidebar items');
		$('.sjo-sidebar-list').empty();
		$.each(sidebarItems, (index, item) => renderItem(item));
	}
	
	// Render an item
	// TODO: hashtags
	// TODO: properly escape list names etc.
	function renderItem(item) {
		
		var li = $('<li></li>').data({sjoSidebarItem: item}).appendTo('.sjo-sidebar-list');
		
		if (item.type == 'separator') {
			li.addClass('sjo-sidebar-separator');
			
		} else {
			li.addClass('sjo-sidebar-item').append('<a href="" class="sjo-sidebar-button-delete">X</a>');
			var a = $('<a class="sjo-sidebar-link"></a>').appendTo(li).text(item.display);
			
			if (item.type == 'url') {
				li.addClass('sjo-sidebar-item-url');
				a.attr('href', item.href);
				
			} else if (item.type == 'user') {
				li.addClass('sjo-sidebar-item-user');
				a.attr('href', `/${item.user}`);
				
			} else if (item.type == 'list') {
				li.addClass('sjo-sidebar-item-list');
				a.attr('href', `/${item.user}/lists/${item.list}`);
				
			} else if (item.type == 'search') {
				li.addClass('sjo-sidebar-item-search');
				a.attr('href', `/search?f=tweets&q=${item.query}`);
				
			}
		}
		
	}
	
	// Utility function to set status of sidebar
	var classList = ['nokey', 'editkey', 'read', 'edit', 'locked'].map(value => 'sjo-sidebar-status-' + value).join(' ');
	function setStatus(newClass) {
		$('.sjo-sidebar-module').removeClass(classList).addClass(newClass);
	}
	
});
