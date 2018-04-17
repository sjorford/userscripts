// ==UserScript==
// @name        Democracy Club downloads new
// @namespace   sjorford@gmail.com
// @include     https://candidates.democracyclub.org.uk/help/api
// @version     2018.04.17.1
// @grant       GM_xmlhttpRequest
// @connect     raw.githubusercontent.com
// @require     https://cdnjs.cloudflare.com/ajax/libs/PapaParse/4.1.4/papaparse.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/chosen/1.6.2/chosen.jquery.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.17.1/moment.min.js
// @require     https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// @require     https://raw.githubusercontent.com/sjorford/fun-with-elections/master/dc-lib.js
// @require     https://raw.githubusercontent.com/sjorford/fun-with-elections/master/areas.json
// @require     https://raw.githubusercontent.com/sjorford/fun-with-elections/master/parties.json
// @require     https://raw.githubusercontent.com/sjorford/fun-with-elections/master/election-types.json
// @require     ukprocessed.js
// ==/UserScript==

// so this is new
//var console = Raven.p;

// Global variables
var tableData = null;
var pageNo = 1, maxPageNo = 1;
var sortColumn = -1, sortOrder = 1;
var currentExtract, currentTemplate, currentSet, currentIndex; // TODO: singletonize this
var tableColumns = {};
var dupesActive = true;
var maxTableRows = 100;
//var areas, areasByKey, parties, electionTypes;
var areasByKey;

// Dupe checking parameters
var minTotalScore = 0.90;
var minNameScore = 0.95;
	
// TODO: add London Assembly to this?
var electionMappings = {}; //{'parl': 'Parliament'};

// Styles
$('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/chosen/1.6.2/chosen.css">').appendTo('head');
$(`<style>
	
	#sjo-api-header {margin: 1rem;}
	.sjo-api-wrapper {margin-top: 0.5rem;}
	.sjo-api-option-extract {background-color: white; margin-right: 0.5rem; border: 1px solid black; padding: 1px 3px;}
	.sjo-api-option-extract-selected {background-color: #77f; color: white;}
	#sjo-api-select-extract {width: 30rem;}
	#sjo-api-select-template {width: 15rem;}
	#sjo-api-status {font-style: italic; margin-right: 1rem;}
	#sjo-api-error {font-weight: bold; color: red;}
	#sjo-api-button-truncate {margin-right: 1rem;}
	.sjo-api-disabled {color: #bbb; pointer-events:none;}
	.sjo-api-paging-current {color: black; pointer-events:none;}
	
	#sjo-api-table {margin: 0.5rem 0;}
	#sjo-api-table th, #sjo-api-table td, #sjo-api-table-dupes th, #sjo-api-table-dupes td {padding: 0.25rem; font-size: 0.75rem !important;}
	#sjo-api-table th {user-select: none; -moz-user-select: none; text-align: center; background-repeat: no-repeat; background-position: center right;}
	#sjo-api-table th.sjo-api-th-sort-up {background-image:url(//en.wikipedia.org/w/resources/src/jquery/images/sort_up.png);}
	#sjo-api-table th.sjo-api-th-sort-down {background-image:url(//en.wikipedia.org/w/resources/src/jquery/images/sort_down.png);}
	
	.sjo-api-col				{width: 1.5em;	min-width: 1.5em;}
	.sjo-api-col-id				{width: 3em;	min-width: 3em;}
	.sjo-api-col-name			{width: 12em;	min-width: 12em;}
	.sjo-api-col-election_date	{width: 5em;	min-width: 5em;}
	.sjo-api-col-_country		{width: 2em;	min-width: 2em;}
	.sjo-api-col-_election_area	{width: 12em;	min-width: 12em;}
	.sjo-api-col-_election_name	{width: 12em;	min-width: 12em;}
	.sjo-api-col-_post_label		{width: 12em;	min-width: 12em;}
	.sjo-api-col-party_id		{width: 5em;	min-width: 5em;}
	.sjo-api-col-party_name		{width: 12em;	min-width: 12em;}
	.sjo-api-col-birth_date		{width: 5em;	min-width: 5em;}
	.sjo-api-col-birth_date		{width: 5em;	min-width: 5em;}
	.sjo-api-col-age			{width: 3em;	min-width: 3em;}
	
	#sjo-api-row-filter td {font-weight: normal; vertical-align: middle;}
	#sjo-api-row-filter ul {font-size: 0.75rem !important;}
	.sjo-api-filter-checkbox {margin: 0 !important;}
	.sjo-api-filter {min-width: 4rem; max-width: 20rem;}
	#sjo-api-row-filter .chosen-results .sjo-api-filter-unavailable {color: #ccc;}
	
	.sjo-api-row-elected {background-color: #fbf2af !important;}
	#sjo-api-table td.sjo-api-cell-icon {font-size: 1rem !important; text-align: center;}
	xxx.sjo-api-cell-party_list_position, xxx.sjo-api-cell-_elected_icon {display: none;}
	xxx.sjo-api-table-has-party-lists .sjo-api-cell-party_list_position {display: table-cell;}
	xxx.sjo-api-table-has-results .sjo-api-cell-_elected_icon {display: table-cell;}
	td.sjo-api-invalid {background-color: #ffd4d4 !important;}
	#sjo-api-table.sjo-api-invalidonly tbody tr {display: none;}
	#sjo-api-table.sjo-api-invalidonly tbody tr.sjo-api-invalid {display: table-row;}
	
	.sjo-api-dupes-first {border-top: 1px black solid;}
	.sjo-api-dupes-verymuch {background-color: bisque !important;}
	#sjo-api-button-help {margin-top: 0.5rem;}
	
	#sjo-api-textarea-raw {min-height: 10em;}
	
</style>`).appendTo('head');

// Validation functions
var isValid = {
	'name':		(val, cand) => val.match(/^[A-ZÓ]/) && val.match(/^[-.' a-zàáâçèéëíòóôöüŷ]+$/i) && !val.match(/[A-Z]{2,}/) && !val.match(/Mc[^A-Z]/),
	'email':	(val, cand) => true || !val.match(/\.gov\.uk$/),
	'fb': 		(val, cand) => val.match(/^https?:\/\/((www|en-gb)\.)?facebook\.com\//),
	'wp': 		(val, cand) => val.match(/^https?:\/\/en\.wikipedia\.org\//),
	'li': 		(val, cand) => val.match(/^https?:\/\/((uk|www)\.)?linkedin\.com\//),
	'hp': 		(val, cand) => !isValid.fb(val) && !isValid.wp(val) && !isValid.li(val),
	'ppc': 		(val, cand) => !isValid.fb(val) && !isValid.wp(val) && !isValid.li(val),
	'gender': 	(val, cand) => cand._gender !== '?',
	'party': 	(val, cand) => !((cand.party_id == 'party:130' && cand._country != 'SC') || (cand.party_id == 'party:63' && cand._country == 'SC')),
};

// Available fields
var dataFields = {
	'_row':							{'display': '#',								'sort': '#',																		},
	'id':							{'display': 'ID',								'sort': '#',																		},
	'old_person_ids':				{'display': 'Old IDs',																												},
	
	'name':							{'display': 'Name',			'filter': true,		'link': '/person/@@id@@',								'validate': isValid.name,	},
	'honorific_prefix':				{},
	'honorific_suffix':				{},
	'_first_name':					{'display': 'First Name',	'filter': true, 																						},
	'_middle_names':				{'display': 'Middle Names',	'filter': true, 																						},
	'_last_name':					{'display': 'Surname',		'filter': true, 																						},
	'_short_name':					{'display': 'Short Name',	'filter': true, 																						},
	'_suffix':						{'display': 'Suffix',		'filter': true, 	/* TODO: include honorific_suffix? */												},
	
	'gender':						{},
	'_gender':						{																										'validate': isValid.gender,	},
	'_gender_icon':					{							'filter': false,	'icon': true,											'validate': isValid.gender,	},
	'_maleness':					{'display': 'M',								'dp': 2,																			},
	
	'birth_date':					{'display': 'DOB',																													},
	'_age_at_election':				{'display': 'Age',																													},

	'election':						{'display': 'Election',		'filter': true, 																						},
	'_election':					{'display': 'Election',		'filter': true, 																						},
	'_election_area':				{'display': 'Election',		'filter': true, 																						},
	'_election_name':				{'display': 'Election',		'filter': true, 																						},
	'_election_type':				{'display': 'Type', 		'filter': true, 																						},
	'election_date':				{'display': 'Date',			'filter': true, 																						},
	'_election_year':				{'display': 'Year',			'filter': true, 	'sort': '#',																		},
	'election_current':				{},
	'_byelection':					{'display': 'By',								'abbr': 'by', 																		},
	'_country':						{'display': 'Co',			'filter': true, 																						},
	'_county':						{'display': 'County',		'filter': true, 																						},

	'party_id':						{'display': 'ID',																						'validate': isValid.party,	},
	'party_name':					{'display': 'Party',		'filter': true, 	'link': '/election/@@election@@/party/@@party_id@@/',	'validate': isValid.party,	},
	'_party':						{'display': 'Party',																												},
	'post_id':						{'display': 'ID',																													},
	'post_label':					{'display': 'Post',			'filter': true, 	'link': '/election/@@election@@/post/@@post_id@@/',									},
	'_post_label':					{'display': 'Post',			'filter': true, 	'link': '/election/@@election@@/post/@@post_id@@/',									},
	'party_lists_in_use':			{},
	'party_list_position':			{'display': 'Pos',								'sort': '#',																		},
	'elected':						{							'abbr': '\u2605',	'icon': true,																		},

	'email':						{'display': 'Email',		'abbr': '@',														'validate': isValid.email,	'group': 'links'},
	'twitter_username':				{'display': 'Twitter',		'abbr': 'tw',		'link': '//twitter.com/@@twitter_username@@',								'group': 'links'},
	'facebook_personal_url':		{'display': 'FB profile',	'abbr': 'fbp',		'link': '@@facebook_personal_url@@',			'validate': isValid.fb,		'group': 'links'},
	'facebook_page_url':			{'display': 'FB page',		'abbr': 'fbc',		'link': '@@facebook_page_url@@',				'validate': isValid.fb,		'group': 'links'},
	'homepage_url':					{'display': 'Homepage',		'abbr': 'hp',		'link': '@@homepage_url@@',						'validate': isValid.hp,		'group': 'links'},
	'wikipedia_url':				{'display': 'Wikipedia',	'abbr': 'wp',		'link': '@@wikipedia_url@@',					'validate': isValid.wp,		'group': 'links'},
	'_wikipedia':					{'display': 'Wikipedia',	'abbr': 'wp',		'link': '@@wikipedia_url@@',					'validate': isValid.wp,		'group': 'links'},
	'linkedin_url':					{'display': 'LinkedIn',		'abbr': 'li',		'link': '@@linkedin_url@@',						'validate': isValid.li,		'group': 'links'},
	'party_ppc_page_url':			{'display': 'Party page',	'abbr': 'ppc',		'link': '@@party_ppc_page_url@@',				'validate': isValid.ppc,	'group': 'links'},
	'twitter_user_id':				{},
	
	'image_url':					{'display': 'Image',		'abbr': '\u263A',	'icon': true,																		},
	'proxy_image_url_template':		{},
	'image_copyright':				{},
	'image_uploading_user':			{},
	'image_uploading_user_notes':	{},
	'mapit_url':					{},
	'gss_code':						{},
	'parlparse_id':					{},
	'theyworkforyou_url':			{},
	'party_ec_id':					{},
	
	'favourite_biscuits':			{'display': 'Biscuit',																												},
	'biography':					{'display': 'Biography',																											},
	
};

// Download buttons
var allCandidatesUrl = '/media/candidates-all.csv';
var buttonSpecs = {
	'all':			{text: 'All', 		template: 'brief',  	urls: [allCandidatesUrl]},
	'local18':		{text: 'LE 18', 	template: 'superbrief',	urls: [allCandidatesUrl],	limits: {election_date: ['2018-05-03'], _election_type: ['local', 'mayor']}},
	'local17':		{text: 'LE 17', 	template: 'standard',	urls: [allCandidatesUrl],	limits: {election_date: ['2017-05-04']}},
	'ge15':			{text: 'GE 15', 	template: 'ge', 		urls: ['/media/candidates-2015.csv']},
	'ge17':			{text: 'GE 17', 	template: 'ge', 		urls: ['/media/candidates-parl.2017-06-08.csv']},
	'ge1715':		{text: 'GE 17/15', 	template: 'ge2', 		urls: ['/media/candidates-parl.2017-06-08.csv', '/media/candidates-2015.csv']},
	'ge1715elec':	{text: 'GE 17/15 Elected', 	template: 'ge2elec', 	urls: ['/media/candidates-parl.2017-06-08.csv', '/media/candidates-2015.csv']},
	'wa1716email':	{text: 'WA 17/16',	template: 'email3', 	urls: ['/media/candidates-parl.2017-06-08.csv', '/media/candidates-naw.c.2016-05-05.csv', '/media/candidates-naw.r.2016-05-05.csv'], limits: {_country: ['WA']}},
	'ni':			{text: 'NI', 		template: 'standard', 	urls: [allCandidatesUrl],	limits: {_country: ['NI']}},
	'county':		{text: 'Counties', 	template: 'county', 	urls: [allCandidatesUrl]},
	//'test':  		{text: 'Test', 		template: 'ge2bio', 	urls: ['/media/candidates-local.huntingdonshire.2017-05-04.csv', '/media/candidates-local.huntingdonshire.2016-05-05.csv']},
	'other':		{text: 'Other',   	template: 'standard',	urls: null},
};
var defaultButton = buttonSpecs.test ? 'test' : 'local18';

// Fields to be displayed
var templates = {
	
	standard: {
		display: 'Standard', 
		columns: [
			'id',
			'name',
			'election_date',
			'_election_year',
			'_country',
			'_election_type',
			'_election_name',
			'_post_label',
			'has:_byelection',
			'party_list_position',
			'party_id',
			'party_name',
			'has:email',
			'has:twitter_username',
			'has:facebook_personal_url',
			'has:facebook_page_url',
			'has:homepage_url',
			'has:wikipedia_url',
			'has:linkedin_url',
			'has:party_ppc_page_url',
			'birth_date',
			'_age_at_election',
			'_maleness',
			'_gender_icon',
			'has:image_url',
			'has:elected',
	]},
	
	brief: {
		display: 'Brief', 
		columns: [
			'id',
			'name',
			'election_date',
			'_election_year',
			'_country',
			'_election_type',
			'_election_name',
			'_post_label',
			'party_id',
			'party_name',
			'has:elected',
	]},
	
	superbrief: {
		display: 'Superbrief', 
		columns: [
			'id',
			'name',
			'_election_type',
			'_election_name',
			'_post_label',
			'party_name',
	]},
	
	ge: {
		display: 'General Election', 
		columns: [
			'id',
			'name',
			'_country',
			'_post_label',
			'party_id',
			'party_name',
			'has:email',
			'has:twitter_username',
			'has:facebook_personal_url',
			'has:facebook_page_url',
			'has:homepage_url',
			'has:wikipedia_url',
			'has:linkedin_url',
			'has:party_ppc_page_url',
			'birth_date',
			'_age_at_election',
			'_maleness',
			'_gender_icon',
			'has:image_url',
			'has:elected',
	]},
	
	ge2: {
		display: 'General Election comparison', 
		columns: [
			'id',
			'name',
			'_country/0',
			'_post_label/0',
			'party_id/0',
			'party_name/0',
			'has:elected/0',
			'_country/1',
			'_post_label/1',
			'party_id/1',
			'party_name/1',
			'has:elected/1',
			'has:email',
			'has:twitter_username',
			'has:facebook_personal_url',
			'has:facebook_page_url',
			'has:homepage_url',
			'has:wikipedia_url',
			'has:linkedin_url',
			'has:party_ppc_page_url',
			'birth_date',
			'_age_at_election/0',
			'_maleness',
			'_gender_icon',
			'has:image_url',
			'favourite_biscuits',
	]},
	
	ge2elec: {
		display: 'General Election comparison brief', 
		columns: [
			'id',
			'name',
			'_country/0',
			'_post_label/0',
			'party_id/0',
			'party_name/0',
			'has:elected/0',
			'_country/1',
			'_post_label/1',
			'party_id/1',
			'party_name/1',
			'has:elected/1',
			'birth_date',
			'_age_at_election/0',
			'_maleness',
			'_gender_icon',
	]},
	
 	ge2bio: {
		display: 'General Election comparison with biographies', 
		process: getBios,
		columns: [
			'id',
			'name',
			'_country/0',
			'_post_label/0',
			'party_id/0',
			'party_name/0',
			'has:elected/0',
			'_country/1',
			'_post_label/1',
			'party_id/1',
			'party_name/1',
			'has:elected/1',
			'has:email',
			'has:twitter_username',
			'has:facebook_personal_url',
			'has:facebook_page_url',
			'has:homepage_url',
			'has:wikipedia_url',
			'has:linkedin_url',
			'has:party_ppc_page_url',
			'birth_date',
			'_age_at_election/0',
			'_maleness',
			'_gender_icon',
			'has:image_url',
			'favourite_biscuits',
			'biography',
	]},
	
	email3: {
		display: '3-way comparison with emails', 
		columns: [
			'id',
			'name',
			'has:email',
			'email',
			'has:_post_label/0',
			'_post_label/0',
			'_party/0',
			'has:_post_label/1',
			'_post_label/1',
			'_party/1',
			'has:_post_label/2',
			'_post_label/2',
			'_party/2',
	]},
	
	mergeall: {
		display: 'All elections comparison', 
		process: mergeAllElections, 
		columns: ['id', 'name'].concat((Array.from(' '.repeat(21))).map((value, index) => `_party/${index}`).join('|').split('|')),
	},
	
	county: {
		display: 'Counties', 
		columns: [
			'id',
			'name',
			'election_date',
			'_election_year',
			'_country',
			'_election_type',
			'_election_name',
			'_post_label',
			'_county',
			'has:_byelection',
			'party_list_position',
			'party_id',
			'party_name',
			'has:elected',
	]},
	
	wp: {
		display: 'Wikipedia', 
		columns: [
			'id',
			'name',
			'election_date',
			'_election_year',
			'_country',
			'_election_type',
			'_election_name',
			'_post_label',
			'has:_byelection',
			'party_list_position',
			'party_id',
			'party_name',
			'_wikipedia',
			'has:elected',
	]},
	
	wpge: {
		display: 'Wikipedia (GE)', 
		columns: [
			'id',
			'name',
			'_country',
			'_post_label',
			'party_id',
			'party_name',
			'_wikipedia',
			'has:elected',
	]},
	
	names: {display: 'Name split', 		columns: ['id', 'name', 'honorific_prefix', '_first_name', '_middle_names', '_last_name', 'honorific_suffix', '_short_name']},
	type:  {display: 'Election type', 	columns: ['id', '_election_year', 'election_date', '_election_type', '_election', '_election_name', '_election_area', '_post_label']},
	id:    {display: 'ID only', 		columns: ['id']},
	idmap: {display: 'ID mappings', 	columns: ['id', 'old_person_ids']},
	
};

// Initialize page
$(function() {
	console.log('initialize', dataFields);

	// Insert wrapper at top of page
	var wrapper = $('<div id="sjo-api-header"></div>').prependTo('.content');
	
	// Add checkboxes for options
	var optionsWrapper = $('<div></div>').appendTo(wrapper);
	$('<input type="checkbox" id="sjo-api-option-raw" value="raw" checked><label for="sjo-api-option-raw">Raw output</label>').appendTo(optionsWrapper);
	$('<input type="checkbox" id="sjo-api-current" value="current"><label for="sjo-api-current">Current only</label>').appendTo(optionsWrapper).change(applyCurrentFlag);
	$('<input type="checkbox" id="sjo-api-autotruncate" value="truncate" checked><label for="sjo-api-autotruncate">Auto truncate</label>').appendTo(optionsWrapper);
	
	function redoRender() {
		if (!tableData) return;
		resetPage();
		prepareRender();
	}
	
	// Add extract options
	var extractWrapper = $('<div class="sjo-api-wrapper"></div>').appendTo(wrapper);
	$.each(buttonSpecs, (key, extract) => {
		var button = $(`<input type="button" id="sjo-api-option-extract-${key}" class="sjo-api-option-extract" value="${extract.text}">`).data('sjo-api-extract', JSON.stringify(extract)).appendTo(extractWrapper);
		if (key == 'other') button.wrap('<div class="sjo-api-wrapper"></div>');
		if (key == defaultButton) button.addClass('sjo-api-option-extract-selected');
	});
	
	$('.sjo-api-option-extract').click(event => {
		var button = $('.sjo-api-option-extract').removeClass('sjo-api-option-extract-selected').filter(event.target).addClass('sjo-api-option-extract-selected');
		var extract = JSON.parse(button.data('sjo-api-extract'));
		console.log('click', button, extract);
		$('#sjo-api-select-template').val(extract.template).trigger('chosen:updated');
	});
	
	// Add extract dropdown
	var dropdown = $('<select id="sjo-api-select-extract"></select>').insertAfter('#sjo-api-option-extract-other');
	buildDownloadList(dropdown);
	dropdown.change(event => $('#sjo-api-option-extract-other').click());
	
	// Add template dropdown
	$('<select id="sjo-api-select-template"></select>').append(Object.keys(templates).map(key => `<option value="${key}">${templates[key].display}</option>`).join(''))
		.appendTo(wrapper).wrap('<div class="sjo-api-wrapper"></div>').before('Template: ')
		.val(buttonSpecs[defaultButton].template)
		.chosen();
	
	// Add start button
	$('<input type="button" id="sjo-api-button-download" value="Extract">').appendTo(wrapper).wrap('<div class="sjo-api-wrapper"></div>').click(startDownload).attr('disabled', true);
	$('<input type="button" id="sjo-api-button-redo" value="Re-render">').insertAfter('#sjo-api-button-download').click(redoRender).hide();
	
	// Add other options
	$('<span id="sjo-api-status"></span>').appendTo(wrapper).wrap('<div class="sjo-api-wrapper"></div>').hide();
	$('<input type="button" id="sjo-api-button-truncate" value="Truncate">').insertAfter('#sjo-api-status').hide().click(truncateDataTable);
	$('<div class="sjo-api-wrapper" id="sjo-api-error"></div>').appendTo(wrapper).hide();
	$('<div class="sjo-api-wrapper" id="sjo-api-invalidonly-wrapper"><input type="checkbox" id="sjo-api-invalidonly" value="invalidonly"><label for="sjo-api-invalidonly">Show only exceptions</label></div>').appendTo(wrapper).hide().click(toggleInvalidOnly);
	
	// Add dupe finding buttons
	var dupesWrapper = $('<div class="sjo-api-wrapper" id="sjo-api-dupes-wrapper"></div>').appendTo(wrapper).hide();
	$('<input type="button" id="sjo-api-button-dupes" value="Find duplicates">').appendTo(dupesWrapper).click(findDuplicates);
	$('<input type="button" id="sjo-api-button-dupes-pause" value="Pause">').appendTo(dupesWrapper).hide().click(pauseDuplicates);
	$('<input type="button" id="sjo-api-button-dupes-resume" value="Resume">').appendTo(dupesWrapper).hide().click(resumeDuplicates);
	$('<span id="sjo-api-status-dupes"></span>').appendTo(dupesWrapper);
	$('<table id="sjo-api-table-dupes"></table>').appendTo(dupesWrapper).hide();
	$('<input type="button" id="sjo-api-button-dupes-more" value="More...">').appendTo(dupesWrapper).hide().click(resumeDuplicates);
	
	// Create table
	var table = $(`<table id="sjo-api-table"></table>`).appendTo(wrapper).hide();
	
	// Create raw output area
	$('<textarea id="sjo-api-textarea-raw" readonly="readonly"></textarea>').appendTo(wrapper).hide().click((event) => event.target.select());
	
	// Paging buttons
	table.before('<div class="sjo-api-paging"></div>');
	table.after('<div class="sjo-api-paging"></div>');
	$('.sjo-api-paging').append('<a class="sjo-api-paging-all" role="button">All</a> <a class="sjo-api-paging-prev" role="button">Previous</a> <span class="sjo-api-paging-pages"></span> <a class="sjo-api-paging-next" role="button">Next</a>').hide();
	$('.sjo-api-paging-prev').click(event => gotoPage(pageNo - 1));
	$('.sjo-api-paging-next').click(event => gotoPage(pageNo + 1));
	$('.sjo-api-paging-all').click(event => gotoPage(Infinity));
	$('.sjo-api-paging-pages').on('click', 'a', event => gotoPage(parseInt(event.target.innerHTML)));
	
	// Hide rest of page
	var helpWrapper = $('.help-api').hide();
	$('<input type="button" id="sjo-api-button-help" value="Show/hide API help">')
		.appendTo(wrapper).click(event => $(helpWrapper).toggle());
	
	// Reapply filters on filter change
	$('body').on('change', 'select.sjo-api-filter', function(event) {
		applyFilters();
	});
	
	// Click on column header to sort
	$('body').on('click', '#sjo-api-row-header th', function() {
		sortData($(this).prop('cellIndex'));
		renderTable();
	});
	
	// Select table body on click
	$('body').on('click', '#sjo-api-table tbody', function(event) {
		if (event.ctrlKey || event.shiftKey || event.altKey || event.target.tagName == 'A') return;
		$(this).selectRange();
	});
		
	// Get lookup tables
	//GM_xmlhttpRequest({url: 'https://raw.githubusercontent.com/sjorford/fun-with-elections/master/areas.json', onload: preloader});
	//GM_xmlhttpRequest({url: 'https://raw.githubusercontent.com/sjorford/fun-with-elections/master/parties.json', onload: preloader});
	//GM_xmlhttpRequest({url: 'https://raw.githubusercontent.com/sjorford/fun-with-elections/master/election-types.json', onload: preloader});

	$('#sjo-api-button-download').attr('disabled', false);
	
	areasByKey = {};
	$.each(areas, (index, element) => areasByKey[element.type + '|' + element.area] = element);
	
	function preloader(data, x, y) {
		
		// Parse area data
		if (data.areas) {
			areas = data.areas;
			areasByKey = {};
			$.each(areas, (index, element) => areasByKey[element.type + '|' + element.area] = element);
		}
		
		if (data.parties) parties = data.parties;
		if (data['election-types']) electionTypes = data['election-types'];
		
		// If all data loaded, enable extract button
		if (areas && parties && electionTypes) $('#sjo-api-button-download').attr('disabled', false);
		
	}
	
});

// Build list of download options
function buildDownloadList(dropdown) {
	
	// Loop through groups of elections
	var dropdownHtml = '';
	$('a[href$=".csv"]').closest('ul').each(function(index, element) {
		var list = $(element);
		
		// Get CSV links
		var links = list.find('a');
		//console.log(links.length, links.attr('href'));
		if (links.length == 1 && links.attr('href') == allCandidatesUrl) return;
		
		// Find headings
		var h3 = list.prevAll('h3').first();
		var h4 = list.prevUntil(h3, 'h4').first();
		var h5 = list.prevUntil(h4, 'h5').first();
		var groupName = 
			h5.length > 0 ? h5.text() + ' (' + h4.text().substr(-4) + ')' :
			h4.length > 0 ? h4.text() :
			h3.text();
		
		// Process all links in this group
		var groupHtml = '';
		links.each((index, element) => {
			
			// Add option to group
			var downloadName = element.innerHTML.trim().match(/^Download the (\d{4} )?(The )?(.*?)( (local|mayoral) election)? candidates$/)[3];
			downloadName = downloadName.replace(/^(City|City and County|Council|Mayor|London Borough) of (the )?|Comhairle nan /, '').trim();
			downloadName = downloadName.replace(/((City|County|County Borough|Borough) )?Council|Combined Authority|Mayoral Election/, '').trim();
			downloadName = downloadName.replace(/\./, '').trim();
			downloadName = downloadName.replace(/London Corporation/, 'City of London').trim();
			groupHtml += `<option value="${element.href}">${downloadName}</option>`;
			
			// Add election to mapping table
			var electionIdMatch = element.href.match(/\/candidates-(.+)\.csv$/);
			if (electionIdMatch) {
				var electionId = electionIdMatch[1];
				if (!electionMappings[electionId]) {
					var electionName = downloadName.replace(/\s+by-election.*$/, '');
					electionMappings[electionId] = electionName;
				}
			}
			
		});
		
		// Add group to dropdown
		groupHtml = `<optgroup label="${groupName}">${groupHtml}</option>`;
		dropdownHtml += groupHtml;
		
	});
	console.log('buildDownloadList', electionMappings);
	
	// Add all downloads to dropdown
	dropdown.html(dropdownHtml);
	
	// Select default election
	var lastUrl = localStorage.getItem('sjo-api-url');
	console.log('buildDownloadList', lastUrl);
	if (lastUrl) {
		dropdown.find(`option[value="${lastUrl}"]`).first().prop({selected: true});
		dropdown.trigger('change');
	}
	
	// Style dropdown after adding options
	dropdown.chosen();

}

function applyCurrentFlag() {
	if ($('#sjo-api-option-raw').is(':checked')) {
		outputRaw();
	} else {
		applyFilters();
	}
}

function gotoPage(newPageNo) {
	console.log('gotoPage', newPageNo);
	if ((newPageNo >= 1 && newPageNo <= maxPageNo) || newPageNo == Infinity) {
		pageNo = newPageNo;
		renderTable();
	}
}

function pauseDuplicates() {
	dupesActive = false;
	$('#sjo-api-button-dupes-pause').hide();
	$('#sjo-api-button-dupes-resume').show();
	$('#sjo-api-button-dupes-more').show();
}

function resumeDuplicates() {
	dupesActive = true;
	$('#sjo-api-button-dupes-pause').show();
	$('#sjo-api-button-dupes-resume').hide();
	$('#sjo-api-button-dupes-more').hide();
}

function toggleInvalidOnly() {
	$('#sjo-api-table').toggleClass('sjo-api-invalidonly', $('#sjo-api-invalidonly').prop('checked'));
}

function startDownload(event) {
	
	var extract = JSON.parse($('.sjo-api-option-extract-selected').data('sjo-api-extract'));
	if (!extract.urls) {
		extract.urls = [$('#sjo-api-select-extract').val()];
		localStorage.setItem('sjo-api-url', extract.urls[0]);
	}
	currentExtract = extract;
	currentTemplate = templates[$('#sjo-api-select-template').val()];
	console.log('startDownload', currentExtract, currentTemplate);
	
	// Reset download status
	$('#sjo-api-status').empty().hide();
	$('#sjo-api-error').empty().hide();
	resetPage();
	
	// Reset dupe finding
	$('#sjo-api-dupes-wrapper').hide();
	$('#sjo-api-button-dupes-pause, #sjo-api-button-dupes-resume, #sjo-api-button-dupes-more').hide();
	$('#sjo-api-status-dupes').empty();
	$('#sjo-api-table-dupes').empty().hide();
	
	// Download first file
	tableData = [];
	currentSet = 0;
	currentIndex = 0;
	doDownload();
	
}

function resetPage() {
	
	// Reset page before re-rendering
	$('#sjo-api-invalidonly').prop('checked', false);
	$('#sjo-api-invalidonly-wrapper').hide();
	$('#sjo-api-textarea-raw').hide();
	$('#sjo-api-table').empty().hide();
	$('.sjo-api-paging').hide();
	pageNo = 1;

}

function doDownload() {
	console.log('doDownload', currentSet, currentExtract);
	
	// Download and parse CSV
	Papa.parse(currentExtract.urls[currentSet], {
		'download': true,
		'header': true,
		'delimiter': ',',
		'newline': '\r\n',
		'quoteChar': '"',
		'skipEmptyLines': true,
		'complete': parseComplete,
	});
	
}

function parseComplete(results) {
	console.log('parseComplete', results);
	
	// Display errors
	if (results.errors.length > 0) {
		$('#sjo-api-error').append(results.errors.map(error => `<div>${error}</div>`).join('')).show();
	}
	
	// Check for new fields in metadata
	if (results.meta.fields) {
		var newFields = $.grep(results.meta.fields, fieldName => !dataFields[fieldName]);
		if (newFields.length > 0) {
			$('#sjo-api-error').append(`<div>New fields found: ${newFields.join(', ')}</div>`).show();
		}
	}
	
	if (results.data && results.data.length > 0) {
		
		// Clean data
		console.log('parseComplete', results.data.length);
		$.each(results.data, (index, candidate) => cleanData(index, candidate));
		console.log('parseComplete', results.data);
			
		// Call custom merge routine
		if (currentTemplate.process) {
			currentTemplate.process.call(this, results.data, mergeData, nextDownload);
		} else {
			mergeData();
		}
		
	}
	
	function mergeData() {
		console.log('mergeData', currentSet);
		
		if (currentSet === 0) {
			
			// Convert into multi-candidacy array
			tableData = results.data.map(candidacy => {
				var record = [candidacy];
				record.minIndex = 0;
				record.id = candidacy.id;
				return record;
			});
			
		} else {
			
			// Merge with existing data set
			// for() is twice as fast as $.grep()
			var numExistingRecords = tableData.length;
			$.each(results.data, (index, candidacy) => {
				
				var found = false;
				for (var dataIndex = 0; dataIndex < numExistingRecords; dataIndex++) {
					if (!tableData[dataIndex][currentSet] && tableData[dataIndex].id == candidacy.id) {
						tableData[dataIndex][currentSet] = candidacy;
						found = true;
						break;
					}
				}
				
				if (!found) {
					var record = [];
					record[currentSet] = candidacy;
					record.minIndex = currentSet;
					record.id = candidacy.id;
					tableData.push(record);
				}
				
			});
			
		}
		
		console.log('mergeData', tableData);
		nextDownload();
	}
	
	function nextDownload() {
		
		// Do the next download, or render the data if no more downloads
		currentSet++;
		currentIndex = 0;
		if (currentSet < currentExtract.urls.length) {
			doDownload();
		} else {
			prepareRender();
		}
		
	}
	
}

var badElections = [
	'2017-05-04|local.merthyr-tydfil|Cyfarthfa',
	'2016-05-05|local.south-buckinghamshire|Farnham Royal and Hedgerley',
	'2016-05-05|local.st-edmondsbury|Haverhill North',
	'2016-05-05|local.torquay|Tormohun',
];

// Download biographies
// FIXME: need to do all this before finishing?
function getBios(data, mergeCallback, finishCallback) {
	console.log('getBios', data);
	
	// Only check bios on current election
	if (currentSet !== 0) {
		mergeCallback.call();
		return;
	}
	
	// Loop through all source data rows
	var maxThreads = 8;
	var numThreads = 0;
	var threadQueue = data.slice(0);
	console.log('getBios', 'start', threadQueue.length, numThreads);
	$('#sjo-api-status').show();
	getNext();
	
	function getNext() {
		//console.log('getNext', threadQueue.length, numThreads);
		if (threadQueue.length === 0) return;
		$('#sjo-api-status').text(`Downloading biographies, ${threadQueue.length} remaining`);
		numThreads++;
		var candidacy = threadQueue.pop();
		$.getJSON(`https://candidates.democracyclub.org.uk/api/v0.9/persons/${candidacy.id}.json`, person => addBio(person, candidacy));
		if (numThreads < maxThreads) {
			//console.log('getNext', 'next');
			//setTimeout(getNext, 100);
			getNext();
		}
	}
	
	function addBio(person, candidacy) {
		//console.log('addBio', threadQueue.length, numThreads, person, candidacy);
		numThreads--;
		candidacy.biography = candidacy.biography || person.biography || person.versions[0].data.biography;
		//if (candidacy.biography) console.log('addBio', 'bio found!', candidacy.biography);
		if (numThreads === 0 && threadQueue.length === 0) {
			console.log('addBio', 'run callback');
			mergeCallback.call();
		} else {
			//console.log('addBio', 'next');
			getNext();
		}
	}
	
}

// Distribute multiple elections across columns
function mergeAllElections(data, mergeCallback, finishCallback) {
	console.log('mergeAllElections', data);
	
	// Loop through all source data rows
	tableData = [];
	$.each(data, (oldIndex, candidacy) => {
		
		// Hacks for messy data
		if (badElections.indexOf(candidacy.election_date + '|' + candidacy._election_area + '|' + candidacy._post_label) >= 0) return;
		
		// Find the table row for this person
		var row;
		for (var newIndex = 0; newIndex < tableData.length; newIndex++) {
			if (tableData[newIndex].id == candidacy.id) {
				row = tableData[newIndex];
				break;
			}
		}
		
		// Add this person to the table
		if (!row) {
			row = [];
			row.id = candidacy.id;
			tableData.push(row);
		}
		
		// Find the position of this election
		var set = null;
		for (var typeIndex = 0; typeIndex < electionTypes.length; typeIndex++) {
			if (electionTypes[typeIndex].date == candidacy.election_date &&  electionTypes[typeIndex].type == candidacy._election_type) {
				for (var testSet = electionTypes[typeIndex].min; testSet <= electionTypes[typeIndex].max; testSet++) {
					if (!row[testSet]) {
						set = testSet;
						break;
					}
				}
				break;
			}
		}
		
		if (set === null) {
			console.warn('mergeAllElections', 'candidacy could not be placed', oldIndex, candidacy);
		} else {
			row[set] = candidacy;
			if (!row.minIndex || set < row.minIndex) row.minIndex = set;
		}
		
	});
	
	finishCallback.call();
}

function prepareRender() {
	console.log('prepareRender', tableData.length);
	
	// Auto truncate
	// FIXME: handle multiple sets - truncate at cleanData stage?
	if (currentExtract.urls[0] == allCandidatesUrl) {
		
		// Limit to current candidates only
		if ($('#sjo-api-current').is(':checked') && $('#sjo-api-autotruncate').is(':checked')) {
			tableData = $.grep(tableData, record => record[0].election_current);
			console.log('prepareRender', tableData.length);
		}
		
	}
	
	// Limit by values
	// FIXME: handle multiple sets - truncate at cleanData stage?
	// FIXME: is this slow?
	if (currentExtract.limits) {
		$.each(currentExtract.limits, (key, values) => {
			console.log('prepareRender', 'limits', key, values);
			tableData = $.grep(tableData, record => !record[0] || values.indexOf(record[0][key]) >= 0);
		});
		console.log('prepareRender', tableData.length);
	}
	
	// Parse template
	console.log('prepareRender', 'currentTemplate', currentTemplate);
	tableColumns = currentTemplate.columns.map(fieldName => {
		var column = {'name': fieldName, 'has': false, 'set': -1};
		if (column.name.substr(0, 4) == 'has:') {
			column.name = column.name.slice(4);
			column.has = true;
		}
		if (column.name.indexOf('/') >= 0) {
			[column.name, column.set] = column.name.split('/');
			column.set = column.set - 0;
		}
		return column;
	});
	console.log('prepareRender', 'tableColumns', tableColumns);
	
	// Set initial sort
	sortColumn = currentTemplate.columns.indexOf('_row');
	sortOrder = 1;
	console.log('prepareRender', 'sortColumn', sortColumn, sortOrder);
	updateSortIcon();
	
	// Render table
	if ($('#sjo-api-option-raw').is(':checked')) {
		outputRaw();
	} else {
		initializeTable();
	}
	
	// Display buttons
	$('#sjo-api-dupes-wrapper').show();
	$('#sjo-api-button-dupes').show();
	$('#sjo-api-button-redo').show();

}

// TODO: make a class
function cleanData(index, candidate) {
	
	candidate._row = index + 1;
	candidate.__filters = [];
	
	// Parse integer values
	candidate.id = candidate.id === '' ? '' : parseInt(candidate.id);
	candidate.party_list_position = candidate.party_list_position === '' ? '' : parseInt(candidate.party_list_position);
	
	// Parse boolean values
	// TODO: parse party_list_position here?
	candidate.election_current = candidate.election_current == 'True';
	candidate.party_lists_in_use = candidate.party_lists_in_use == 'True';
	candidate.elected = candidate.elected == 'True';
	
	// Tweak historical general election IDs for consistency
	candidate._election = 
		candidate.election == '2010' ? 'parl.2010-05-06' :
		candidate.election == '2015' ? 'parl.2015-05-07' :
		candidate.election;
	
	// Tweak ward names
	candidate._post_label = candidate.post_label.replace(/^(Police and Crime Commissioner for|London Borough of) | (ward|Police|Constabulary|Combined Authority|Borough Council)$/g, '').trim();
	if (candidate._post_label == 'Sheffield Brightside and Hillsborough') candidate._post_label = 'Sheffield, Brightside and Hillsborough';
	
	// Election
	// TODO: rejig this, including one that includes local.umpshire for local only
	/*
	var electionMatch = candidate._election.match(/^(parl|pcc|nia|(local|sp|naw|gla|mayor)\.[^\.]+)\.(.+\.)?(\d{4}-\d{2}-\d{2})$/);
	candidate._election_area = electionMatch[1];
	candidate._election_name = electionMappings[candidate._election_area];
	candidate._byelection = electionMatch[3] ? electionMatch[3] : '';
	var areaSplit = candidate._election_area.split('.');
	candidate._election_type = areaSplit[0] + (areaSplit[1] && areaSplit[1].length == 1 ? '.' + areaSplit[1] : '');
	*/
	var electionMatch = candidate._election.match(/^((parl|nia|pcc|mayor)|((sp|naw|gla)\.[a-z])|((local)\.[^\.]+))\.(.+\.)?(\d{4}-\d{2}-\d{2})$/);
	candidate._election_type = electionMatch[2] || electionMatch[3] || electionMatch[6] || null;
	candidate._election_area = electionMatch[1];
	candidate._election_name = electionMappings[candidate.election];
	
	// Get area ID and country from JSON
	// TODO: this is a mess
	var areaName = 
		candidate._election_area == 'gla.a' ? 'London' : 
		candidate._election_type == 'local' || candidate._election_type == 'mayor' ? candidate._election_name : 
		candidate._post_label;
	var area = areasByKey[candidate._election_type + '|' + areaName];
	if (area) {
		candidate.__area = area;
		candidate._county = area.county;
		candidate._country = area.country;
	} else {
		console.warn('cleanData', 'area not found', candidate._election_type, areaName);
	}
	
	// Country
	// TODO: get from new JSON
	//var place = candidate._election_area + (candidate._election_area == candidate._election_type ? '.' + candidate._post_label.toLowerCase().trim().replace(/\s+/g, '-') : '');
	//candidate._country = getCountryForElection(place);
	
	// Election year and age at election
	// TODO: fix sorting of ages outside the range 10-99
	candidate._election_year = +candidate.election_date.substr(0, 4);
	if (candidate.birth_date) {
		if (candidate.birth_date.length == 4) {
			var ageThisYear = candidate._election_year - candidate.birth_date;
			candidate._age_at_election = (ageThisYear - 1) + '-' + ageThisYear;
		} else {
			candidate._age_at_election = '' + moment(candidate.election_date).diff(moment(candidate.birth_date), 'years');
		}
	} else {
		candidate._age_at_election = '';
	}
	
	// Split name
	// TODO: deal with peerage titles like Lord Cameron of Roundwood
	// TODO: deal with loony names like Sir Dudley the Crazed
	var name = candidate.name.trim();
	var nameMatch = name.match(/^(.*?)\s+([JS]n?r\.?)$/);
	if (nameMatch) {
		candidate._suffix = nameMatch[2];
		name = nameMatch[1];
	} else {
		candidate._suffix = '';
	}
	nameMatch = name.match(/^(.*?)\s+(((st\.?|de|de la|le|van|van de|van der|von|di|da|ab|ap|\u00D3|N\u00ED|al|el)\s+.*?)|\S+)$/i);
	if (nameMatch) {
		candidate._last_name = nameMatch[2];
		nameMatch = nameMatch[1].match(/^(\S+)(\s+(.*?))?$/);
		candidate._first_name = nameMatch[1];
		candidate._middle_names = nameMatch[3] ? nameMatch[3] : '';
	} else {
		candidate._last_name = name;
		candidate._first_name = '';
		candidate._middle_names = '';
	}
	candidate._short_name = (candidate._first_name + ' ' + candidate._last_name).trim();
	candidate._normal_name = (nameNorms[candidate._first_name] ? nameNorms[candidate._first_name] : candidate._first_name) + ' ' + candidate._last_name;
	
	// Gender
	// TODO: clean up name-gender mapping file and put on Github
	candidate.gender = candidate.gender.trim();
	candidate._gender = 
		candidate.gender === '' ? '' : 
		candidate.gender.match(/^(m|male|mr\.?)$/i) ? 'm' :
		candidate.gender.match(/^(f|female|(mrs|miss|ms)\.?)$/i) ? 'f' :
		'?';
	candidate._gender_icon = {'m': '\u2642', 'f': '\u2640', '?': '?', '': ''}[candidate._gender];
	//candidate._maleness = candidate._gender ? ['f', '?', 'm'].indexOf(candidate._gender) / 2 : genderData[candidate._first_name] ? genderData[candidate._first_name].est.male : 0.5;
	var g = null; //genderData[candidate._first_name];
	candidate._maleness = g ? (g.count.male + 1) / (g.count.male + g.count.female + 2) : 0.5;
	
	// Party group
	// TODO: use parties.json
	candidate._party_group = 
		partyGroups[candidate.party_id] ? partyGroups[candidate.party_id] : 
		//candidate.party_id == 'ynmp-party:2' ? null :
		candidate.party_name.indexOf('Independent') >= 0 ? 'Independent' :
		candidate.party_name;
	candidate._party = parties[candidate.party_name] ? parties[candidate.party_name] : 'Oth';
	
	// Initialize biography field (not in CSV)
	candidate.biography = candidate.biography || '';
	
	// Parse Wikipedia titles
	var urlMatch = candidate.wikipedia_url ? candidate.wikipedia_url.match(/\/wiki\/(.*)$/) : null;
	candidate._wikipedia = !candidate.wikipedia_url ? '' : !urlMatch ? '?' : decodeURIComponent(urlMatch[1]).replace(/_/g, ' ');
	
	// TODO: parse list of old IDs?
	
	return candidate;
	
}

// TODO: improve this
// TODO: build this from real data
var partyGroups = {
	'party:53':				'Labour',		// Labour Party
	'joint-party:53-119':	'Labour',		// Labour and Co-operative Party
	'party:52':				'Conservative',	// Conservative and Unionist Party	
	'party:51':				'Conservative',	// Conservative and Unionist Party [NI]
	'party:85':				'UKIP',			// UK Independence Party (UKIP)
	'party:84':				'UKIP',			// UK Independence Party (UKIP) [NI]
	'party:63':				'Green',		// Green Party
	'party:130':			'Green',		// Scottish Green Party
	'party:305':			'Green',		// Green Party [NI]
	'party:804': 			'TUSC',			// Trade Unionist and Socialist Coalition
	'party:2045': 			'TUSC',			// Left Unity
	'joint-party:804-2045':	'TUSC',			// Left Unity - Trade Unionists and Socialists
};

// Truncate the data table
function truncateDataTable() {
	console.log('truncateDataTable');
	
	// Reduce the data table to just the filtered rows
	tableData = $.grep(tableData, record => record.every(candidacy => candidacy.__filters.every(value => value)));
	
	// Rebuild the filters
	buildFilters();

}

// Reapply filters on checkbox change
// https://css-tricks.com/indeterminate-checkboxes/
function cycleCheckbox(event) {
	
	var filter = $(event.target);
	var colIndex = filter.closest('td').prop('cellIndex');
	var column = tableColumns[colIndex];
	var field = dataFields[column.name];
	console.log(colIndex, field.group, event.ctrlKey);
	
	// If Ctrl is pressed, apply the change to all columns in the same group
	var checkboxes = (field.group && event.ctrlKey) ? $('.sjo-api-filter-group-' + field.group) : filter;
	console.log(checkboxes);
	
	switch(filter.data('sjo-api-checked')) {

	// unchecked, going indeterminate
	case 0:
		checkboxes.data('sjo-api-checked', 1);
		checkboxes.prop('indeterminate', true);
		break;

	// indeterminate, going checked
	case 1:
		checkboxes.data('sjo-api-checked', 2);
		checkboxes.prop('indeterminate', false);
		checkboxes.prop('checked', true);                
		break;

	// checked, going unchecked
	default:
		checkboxes.data('sjo-api-checked', 0);
		checkboxes.prop('indeterminate', false);
		checkboxes.prop('checked', false);

	}
	
	applyFilters();
	
}

function initializeTable() {
	console.log('initializeTable');
	
	// Create table header
	// TODO: specify fixed widths to stop table from jumping
	var colGroupsHtml = tableColumns.map(column => '<col class="sjo-api-col sjo-api-col-' + (column.has ? '__has_' : '') + column.name + '">');
	var headerCellsHtml = tableColumns.map(column => 
		'<th class="sjo-api-cell-' + (column.has ? '__has_' : '') + column.name + '">' + 
			(dataFields[column.name].display && !column.has ? escapeHtml(dataFields[column.name].display) : '\u00B7') + '</th>');
	var filterCellsHtml = tableColumns.map(column => '<td class="sjo-api-cell-' + (column.has ? '__has_' : '') + column.name + '"></td>');
	$('#sjo-api-table').empty().html(`<colgroup>${colGroupsHtml.join('')}</colgroup><thead>
		<tr id="sjo-api-row-header">${headerCellsHtml.join('')}</tr>
		<tr id="sjo-api-row-filter">${filterCellsHtml.join('')}</tr></thead><tbody></tbody>`);
	
	// Build filters
	buildFilters();
	
}

// Display filters on selected columns
function buildFilters() {
	console.log('buildFilters');
	
	// Remove existing filters
	var cells = $('#sjo-api-row-filter td').empty();
	
	// Don't build filters on short data set
	// TODO: parameterise this
	if (tableData.length >= 10) {
		
		// Loop through filterable fields
		var values;
		$.each(tableColumns, (colIndex, column) => {
			var field = dataFields[column.name];
			
			if (column.has) {
				
				// Add checkbox to table header
				// TODO: add checkboxes to other sparse data (DOB, link fields, image, gender, elected)
				$(`<input type="checkbox" class="sjo-api-filter-checkbox" id="sjo-api-filter-__has_${column.name}">`)
					.addClass(field.group ? 'sjo-api-filter-group-' + field.group : '')
					.prop('indeterminate', true).data('sjo-api-checked', 1).click(cycleCheckbox).appendTo(cells[colIndex]);
				
			} else if (field.filter) {
				
				// Build list of filter options
				values = [];
				$.each(tableData, (index, record) => {
					var set = column.set >= 0 ? column.set : record.minIndex;
					if (!record[set]) return;
					if (values.indexOf(record[set][column.name]) < 0) {
						values.push(record[set][column.name]);
						
						// Add wildcard options
						if (column.name == '_election_area' && currentExtract.urls[0] == allCandidatesUrl && record[set]._election_type != record[set]._election_area) {
							var wildcardOption = record[set]._election_type + '.*';
							if (values.indexOf(wildcardOption) < 0) {
								values.push(wildcardOption);
							}
						}
						
					}
				});
				
				// Don't show filter for only one value
				console.log('buildFilters', column, field, values);
				if (values.length <= 1) return;
				
				// Add dropdown to table header
				var dropdownId = 'sjo-api-filter-' + column.name + (column.set >= 0 ? '__' + column.set : '');
				var dropdown = $(`<select multiple class="sjo-api-filter" id="${dropdownId}"></select>`)
					.data('sjo-api-set', column.set)
					.html(values.sort().map(value => `<option>${escapeHtml(value)}</option>`).join(''))
					.appendTo(cells[colIndex]);
				
			}
			
		});
			
	}
	
	// Apply the new filters
	applyFilters(formatFilters);
	
	function formatFilters() {
		$('select.sjo-api-filter').chosen({
			'placeholder_text_multiple': ' ',
			'search_contains': true,
			'inherit_select_classes': true,
			//'width': field['filter-width'],
			'width': '100%',
		});

	}
	
}

// Apply a filter selection
function applyFilters(callback) {
	if (!tableData) return;
	console.log('applyFilters', tableData);
	
	// Reset the null record flag
	$.each(tableData, (index, record) => {
		$.each(record, (index, candidacy) => {
			if (candidacy) candidacy.__filters[tableColumns.length + 1] = true;
		});
	});

	$('select.sjo-api-filter, .sjo-api-filter-checkbox').each(function(index, element) {
		
		// Get filter parameters
		var filter = $(element);
		var colIndex = filter.closest('td').prop('cellIndex');
		var column = tableColumns[colIndex];
		
		if (filter.is('[type="checkbox"]')) {
			
			// Get checkbox status
			var checked = filter.prop('checked');
			var indeterminate = filter.prop('indeterminate');
			console.log('applyFilters', colIndex, column, checked, indeterminate, filter);
			
			// Update the data set with the filter value
			$.each(tableData, (index, record) => {
				var set = column.set >= 0 ? column.set : record.minIndex;
				if (!record[set]) {
					if (checked && !indeterminate) record[record.minIndex].__filters[tableColumns.length + 1] = false;
				} else {
					record[set].__filters[colIndex] = indeterminate || checked === !!record[set][column.name];
				}
			});
			
		} else {
			
			// Get selected values
			var values = filter.val();
			console.log('applyFilters', colIndex, column, values, filter);
			
			// Parse numeric values
			// TODO: rename "sort" as something like "type"
			if (values && dataFields[column.name].sort == '#') {
				values = values.map(value => value === '' ? '' : parseInt(value));
			}
			
			// Update the data set with the filter value
			$.each(tableData, (index, record) => {
				var set = column.set >= 0 ? column.set : record.minIndex;
				if (!record[set]) {
					if (values) record[record.minIndex].__filters[tableColumns.length + 1] = false;
					return;
				}
				record[set].__filters[colIndex] = values === null || values.indexOf(record[set][column.name]) >= 0 || 
					(column.name == '_election_area' && values.indexOf(record[set][column.name].split('.')[0] + '.*') >= 0);
			});
			
			// Hide extra space in dropdowns
			// TODO: this makes it impossible to type a second search term
			filter.closest('td').find('.search-field').toggle(!values);
			
		}
		
	});
	
	// Apply the current elections filter
	var current = currentExtract.urls[0] == allCandidatesUrl && $('#sjo-api-current').is(':checked');
	console.log('applyFilters', current);
	$.each(tableData, (index, record) => {
		if (!record[0]) return;
		record[0].__filters[tableColumns.length] = current ? record[0].election_current : true;
	});
	
	// Render table
	renderTable(callback);
	
}

// Sort data on selected column
function sortData(col) {
	console.log('sortData', col);
	
	var column = tableColumns[col];
	var field = dataFields[column.name];
	
	// Reverse sort if column is already sorted
	sortOrder = column == sortColumn ? -sortOrder : 1;
	sortColumn = column;
	console.log('sortData', sortColumn, sortOrder, field);
	
	// Store current order to produce a stable sort
	$.each(tableData, (index, record) => record.__index = index);
	console.log('sortData', tableData);
	
	// Sort data
	tableData.sort(function(a, b) {
		
		// Check for missing records
		if (column.set >= 0) {
			if (!a[column.set] && !b[column.set]) return a.__index - b.__index;
			if (!a[column.set]) return +1;
			if (!b[column.set]) return -1;
		}
		
		// Get values
		var aValue = column.set >= 0 ? a[column.set][column.name] : a[0] ? a[0][column.name] : a[1][column.name];
		var bValue = column.set >= 0 ? b[column.set][column.name] : b[0] ? b[0][column.name] : b[1][column.name];
		
		// Check for blank values
		if (isNull(aValue) && isNull(bValue)) return a.__index - b.__index;
		if (isNull(aValue)) return +1;
		if (isNull(bValue)) return -1;
		
		// Don't sort abbreviation fields
		if (column.has) return a.__index - b.__index;
		
		// If values are the same, keep in current order
		if (aValue == bValue) return a.__index - b.__index;
		
		// Sort numbers and strings correctly
		if (field.sort == '#') {
			return sortOrder * (aValue - bValue);
		} else {
			return sortOrder * aValue.localeCompare(bValue, {'sensitivity': 'base', 'ignorePunctuation': true});
		}
		
	});
	
	function isNull(value) {
		return value === null || value === '' || (column.has && value === false);
	}
	
	// Remove the temporary index column
	$.each(tableData, (index, record) => delete record.__index);
	
	// Update the column header
	updateSortIcon();
	
}

function updateSortIcon() {
	
	// Display icon in header
	// TODO: prettify this
	if (sortColumn >= 0) {
		$('#sjo-api-row-header th')
			.removeClass('sjo-api-th-sort-down sjo-api-th-sort-up')
			.eq(sortColumn).addClass(sortOrder == 1 ? 'sjo-api-th-sort-up' : 'sjo-api-th-sort-down');
	}
	
}

// Rebuild table
function renderTable(callback) {
	console.log('renderTable');
	
	// Build the table rows to be displayed
	var renderData = buildTableRows();
	console.log('renderTable', renderData);
	
	// Check that the selected page shows some rows
	maxPageNo = Math.ceil(renderData.numRowsMatched / maxTableRows);
	maxPageNo = maxPageNo < 1 ? 1 : maxPageNo;
	if (pageNo > maxPageNo && pageNo < Infinity) {
		pageNo = maxPageNo;
		if (renderData.numRowsMatched > 0) {
			renderData = buildTableRows();
		}
	}
	console.log('renderTable', pageNo, maxPageNo);
	
	// Replace the table body
	$('#sjo-api-table tbody').html(renderData.bodyHtml.join(''));
	$('#sjo-api-table').show();
	$('#sjo-api-table tr:has(.sjo-api-invalid)').addClass('sjo-api-invalid');
	
	// Change status message
	$('#sjo-api-status').text('Matched ' + 
		(renderData.numRowsMatched == tableData.length ? '' : 
			renderData.numRowsMatched + ' of ') + tableData.length + ' rows' + 
		(renderData.numRowsDisplayed == renderData.numRowsMatched ? '' : 
			' (displaying ' + (renderData.startRowNo) + '-' + (renderData.startRowNo + renderData.numRowsDisplayed - 1) + ')')).show();
	
	// Display paging buttons
	// TODO: if there are a lot, only ... display ... selected ... pages
	$('.sjo-api-paging-pages').html((new Array(maxPageNo)).fill(0).map((value, index) => 
		'<a role="button"' + (index + 1 == pageNo ? ' class="sjo-api-paging-current"' : '') + '">' + (index + 1) + '</a>').join(' '));
	$('.sjo-api-paging-prev').toggleClass('sjo-api-disabled', pageNo == 1 || pageNo == Infinity);
	$('.sjo-api-paging-next').toggleClass('sjo-api-disabled', pageNo == maxPageNo || pageNo == Infinity);
	$('.sjo-api-paging-all').toggleClass('sjo-api-paging-current', pageNo == Infinity);
	$('.sjo-api-paging').show(); //toggle(renderData.numRowsMatched > maxTableRows);
	
	// Toggle display of columns
	$('#sjo-api-table').toggleClass('sjo-api-table-has-party-lists', tableData.some(record => record[0] && record[0].party_lists_in_use));
	$('#sjo-api-table').toggleClass('sjo-api-table-has-results', tableData.some(record => record[0] && record[0].elected));
	
	// Toggle display of truncation button
	// TODO: base this on row count?
	var current = $('#sjo-api-current').is(':checked');
	var currents = new Set(tableData.map(record => !record[0] ? null : record[0].election_current));
	console.log('renderTable', current, currents);
	$('#sjo-api-button-truncate').toggle((current && currents.has(false)) || $('.sjo-api-filter option:selected').length > 0 || $('.sjo-api-filter-checkbox').filter((index, element) => $(element).data('sjo-api-checked') != 1).length > 0);
	
	// Display dupes button
	$('#sjo-api-button-dupes').show();
	
	// Display invalid rows only
	$('#sjo-api-invalidonly-wrapper').show();
	toggleInvalidOnly();
	
	// Set up filters on first render
	if (callback) callback.call();
	
	// Clean up the filter lists
	tidyFilters();
	
}

// Build table as raw HTML for rendering speed
function buildTableRows() {
	console.log('buildTableRows');

	// Initialise row count
	var bodyHtml = [];
	var numRowsMatched = 0;
	var numRowsDisplayed = 0;
	var startRowNo = pageNo == Infinity ? 1 : maxTableRows * (pageNo - 1) + 1;
	var endRowNo = pageNo == Infinity ? Infinity : startRowNo + maxTableRows;
	console.log('buildTableRows', pageNo, maxTableRows, startRowNo, endRowNo);
	
	// Loop through all data rows
	$.each(tableData, function(index, record) {
		
		// Check if this row passes all the filters
		if (!record.every(candidacy => candidacy.__filters.every(value => value))) return;
		numRowsMatched++;
		
		// Show only selected page
		if (numRowsMatched >= startRowNo && numRowsMatched < endRowNo) {
			
			// Add row to table body
			bodyHtml.push('<tr' + (record[0] && record[0].elected ? ' class="sjo-api-row-elected"' : '') + '>' + buildTableRowCells(record).join('') + '</tr>');
			numRowsDisplayed++;
			
		}
		
	});
	
	// Calculate actual end row
	endRowNo = startRowNo + numRowsDisplayed;
	
	// Return values as an object
	return {
		'bodyHtml': 		bodyHtml,
		'numRowsMatched': 	numRowsMatched,
		'numRowsDisplayed': numRowsDisplayed,
		'startRowNo': 		startRowNo,
		'endRowNo': 		endRowNo,
	};
	
}

// Build cells for a single table row
function buildTableRowCells(record) {
	
	// Loop through columns
	var cellsHtml = tableColumns.map(column => {
		
		// Get field
		var field = dataFields[column.name];
		var set = column.set >= 0 ? column.set : record.minIndex;
		
		// Build cell content
		// TODO: add popups for has: values
		var content = '', title = '';
		if (record[set] && record[set][column.name] !== null && record[set][column.name] !== false && record[set][column.name] !== '') {
			var value = column.has ? (field.abbr ? field.abbr : 'Y') : field.dp ? record[set][column.name].toFixed(field.dp) : escapeHtml(record[set][column.name]);
			content = field.link ? `<a href="${getLinkAddress(field, record[set])}">${value}</a>` : value;
			title = column.has ? escapeHtml(record[set][column.name]) : '';
		}
		
		// Set classes
		var classes = [`sjo-api-cell-${column.has ? '__has_' : ''}${column.name}`];
		if (field.icon) classes.push('sjo-api-cell-icon');
		if (content && field.validate && !field.validate.call(this, record[set][column.name], record[set])) classes.push('sjo-api-invalid');
		
		// Return cell HTML
		return `<td class="${classes.join(' ')}" title="${title}">${content}</td>`;
		
	});
	
	return cellsHtml;
	
}

// Sort available filters at the top, and grey out others
function tidyFilters() {
	
	// Check if current flag is checked
	var current = currentExtract.urls[0] == allCandidatesUrl && $('#sjo-api-current').is(':checked');
	console.log('tidyFilters', current);
	
	// Go through all filterable fields
	// TODO: make this loop the same as buildFilters, or vice versa
	$.each(tableColumns, (colIndex, column) => {
		var field = dataFields[column.name];
		if (!field.filter) return;
		
		// Get the dropdown for this field
		var dropdown = $('#sjo-api-filter-' + (column.has ? '__has_' : '') + column.name);
		if (dropdown.length === 0) return;
		console.log('tidyFilters', dropdown.val(), dropdown);
		
		// Reset all options for this dropdown
		var options = dropdown.find('option');
		options.removeClass('sjo-api-filter-unavailable');
		dropdown.append(options.toArray().sort((a, b) => a.innerHTML > b.innerHTML));
		options = dropdown.find('option');
		
		// Only sort this dropdown if other dropdowns are selected
		if (current || $('.sjo-api-filter').not(dropdown).find(':checked').length > 0) {
			
			// Go through data and find values that are valid when accounting for other filters
			var values = [];
			$.each(tableData, function(index, record) {
				var set = column.set >= 0 ? column.set : record.minIndex;
				if (record[set].__filters.every((value, filterIndex) => filterIndex == colIndex || value)) {
					values.push(record[set][column.name]);
					
					// Add wildcard options
					// TODO: this is duplicate code?
					if (column.name == '_election_area' && currentExtract.urls[0] == allCandidatesUrl && record[set]._election_type != record[set]._election_area) {
						if (values.indexOf(record[set]._election_type + '.*') < 0) {
							values.push(record[set]._election_type + '.*');
						}
					}
					
				}
			});
			
			// Sort the available options at the top
			var validOptions = options.filter((index, option) => values.indexOf(option.value) >= 0);
			dropdown.prepend(validOptions);
			options.not(validOptions).addClass('sjo-api-filter-unavailable');
		}
		
		// Refresh the fancy dropdown
		dropdown.trigger('chosen:updated');
		
	});
	
}

// ================================================================
// Output raw data
// ================================================================

function outputRaw() {
	
	var renderData = buildRawOutput();
	
	$('#sjo-api-textarea-raw').html(renderData.bodyHtml.join('\r\n')).show();

	// Change status message
	$('#sjo-api-status').text('Matched ' + 
		(renderData.numRowsMatched == tableData.length ? '' : 
			renderData.numRowsMatched + ' of ') + tableData.length + ' rows').show();
	
	$('#sjo-api-button-truncate').hide();
	$('#sjo-api-invalidonly-wrapper').hide();
	$('#sjo-api-button-dupes').show();
	
}

function buildRawOutput() {
	console.log('buildRawOutput');

	// Initialise row count
	var bodyHtml = [];
	var numRowsMatched = 0;
	var numRowsDisplayed = 0;
	var current = $('#sjo-api-current').is(':checked');
	console.log('buildRawOutput', current, tableData);
	
	// Loop through all data rows
	$.each(tableData, function(index, dataRow) {
		//console.log(index, dataRow);
		
		// Check if this row passes all the filters
		if (current && (!dataRow[0] || !dataRow[0].election_current)) return;
		numRowsMatched++;
		
		// Add row to table body
		bodyHtml.push(buildRawOutputRow(dataRow).join('\t'));
		numRowsDisplayed++;
		
	});
	console.log('buildRawOutput', numRowsMatched, numRowsDisplayed);
	
	// Return values as an object
	return {
		'bodyHtml': 		bodyHtml,
		'numRowsMatched': 	numRowsMatched,
		'numRowsDisplayed': numRowsDisplayed,
	};
	
}

function buildRawOutputRow(dataRow) {
	
	var cellValues = tableColumns.map(column => {
		
		// Get field
		var field = dataFields[column.name];
		
		// Get candidacy to use
		// TODO: this is used everywhere, make a function
		var set = column.set >= 0 ? column.set : dataRow.minIndex;
		
		if (!dataRow[set]) {
			return '';
		} else if (dataRow[set][column.name] === null || dataRow[set][column.name] === false || dataRow[set][column.name] === '') {
			return '';
		} else {
			return column.has ? field.abbr : 
				   field.dp ? dataRow[set][column.name].toFixed(field.dp) : 
				   typeof dataRow[set][column.name] == 'string' ? dataRow[set][column.name].replace(/\s+/g, ' ') : 
				   dataRow[set][column.name];
		}
		
	});
	
	return cellValues;
	
}

// ================================================================
// Find likely duplicates
// ================================================================

function findDuplicates() {
	console.log('findDuplicates');
	
	// Clear previous results
	var table = $('#sjo-api-table-dupes').empty();
	$('#sjo-api-button-dupes-pause').show();
	$('#sjo-api-button-dupes').hide();
	
	// Initialise data
	var groups = [];
	var processed = [];
	var unmatched = tableData.map(record => $.extend({}, record[0] ? record[0] : record[1]));
	var index = 0;
	console.log('findDuplicates', unmatched);
	
	checkData();
	
	// Check the next candidate in the data set
	function checkData() {
		var candidate = unmatched[index];
		$('#sjo-api-status-dupes').text(`Checking ${index + 1} of ${tableData.length}; ${groups.length} groups found`);
		
		// Start with an unmatched 2018 candidate
		if (!candidate.__matched && candidate._election_year === 2018) {
		//if (!candidate.__matched && candidate.election_date === '2017-06-08') {
		//if (true) {
			
			// Add this candidate to the pending list
			candidate.__matched = true;
			var pending = [candidate];
			var matches = [];
			var found = false;
			
			// Work through the pending list, adding more as we go
			while (pending.length > 0) {
				var c1 = pending.pop();
				matches.push(c1);
				
				// Loop through all other unmatched rows
				$.each(unmatched, (index2, c2) => {
					if (c2.__matched) return;
					//if (c2._election_type != 'parl') return; // *******************
					if (c2._election_year == 2010) return;
					
					//if ((c1.id == 5812 && c2.id == 10249) || (c2.id == 5812 && c1.id == 10249)) console.log(c1, c2);
					
					// Check score
					var score = calcScore(c1, c2);
					if (score.nameScore >= minNameScore && score.totalScore >= minTotalScore) {
						
						// Add this candidacy
						c2.__matched = true;
						pending.push(c2);
						if (c1.id != c2.id) found = true;
						
					}
					
				});
				
			}
			
			// Add to the table
			if (found) {
				groups.push(matches);
				writeDupesTable(groups.length - 1, matches);
			}
			
		}
		
		index++;
		if (index < unmatched.length) {
			checkActiveFlag();
		} else {
			$('#sjo-api-button-dupes-pause, #sjo-api-button-dupes-resume, #sjo-api-button-dupes-more').hide();
			$('#sjo-api-status-dupes').text(`Search complete; ${groups.length} groups found`);
		}
		
	}
	
	function checkActiveFlag() {
		if (dupesActive) {
			setTimeout(checkData, 0);
		} else {
			setTimeout(checkActiveFlag, 1000);
		}
	}
	
	function calcScore(c1, c2) {
		
		if (c1.id == c2.id) return {'totalScore': 1, 'nameScore': 1};
		
		var zeroScore = {'totalScore': 0, 'nameScore': 0};
		var totalScore = 1;
		
		// Weight down different countries
		totalScore = totalScore * (c1._country === c2._country ? 1 : 0.95);
		if (totalScore < minTotalScore) return zeroScore;
		
		// Weight down different parties
		totalScore = totalScore * (c1._party_group === c2._party_group ? 1 : c1._party_group === null || c2._party_group === null ? 0.95 : 0.90);
		if (totalScore < minTotalScore) return zeroScore;
		
		// Weight down different middle names 
		totalScore = totalScore * (c1._middle_names !== '' && c2._middle_names !== '' && c1._middle_names !== c2._middle_names ? 0.90 : 1);
		if (totalScore < minTotalScore) return zeroScore;
		
		// Weight down conflicting elections
		if (c1.election_date == c2.election_date && c1._election_type == c2._election_type) {
			totalScore = totalScore * 0.95;
			if (totalScore < minTotalScore) return zeroScore;
		}
		
		// Weight down 2010 (no SOPNs)
		if (c1._election_year < 2015 || c2._election_year < 2015) {
			totalScore = totalScore * 0.99;
			if (totalScore < minTotalScore) return zeroScore;
		}
		
		if (c1.__area && c2.__area && c1.__area.id != c2.__area.id) {
			
			// Find area overlap
			if (c1.__area.overlaps.indexOf(c2.__area.id) < 0) {
				totalScore = totalScore * 0.99;
				if (totalScore < minTotalScore) return zeroScore;
			}
		
			// Check for matching counties
			var countyOverlap = false;
			$.each(c1.__area.county, (index, county) => countyOverlap = countyOverlap || c2.__area.county.indexOf(county) >= 0);
			if (!countyOverlap) {
				totalScore = totalScore * 0.99;
				if (totalScore < minTotalScore) return zeroScore;
			}
			
		}
		
		// Calculate name similarity
		var nameScore = Math.max(                                                    jaroWinkler(c1.name,         c2.name),
			(                               c2._short_name  === c2.name        ? 0 : jaroWinkler(c1.name,         c2._short_name)),
			(                               c2._normal_name === c2._short_name ? 0 : jaroWinkler(c1.name,         c2._normal_name)),
			
			(c1._short_name  === c1.name                                       ? 0 : jaroWinkler(c1._short_name,  c2.name)),
			(c1._short_name  === c1.name || c2._short_name  === c2.name        ? 0 : jaroWinkler(c1._short_name,  c2._short_name)),
			(c1._short_name  === c1.name || c2._normal_name === c2._short_name ? 0 : jaroWinkler(c1._short_name,  c2._normal_name)),
			
			(c1._normal_name === c1.name                                       ? 0 : jaroWinkler(c1._normal_name, c2.name)),
			(c1._normal_name === c1.name || c2._short_name  === c2.name        ? 0 : jaroWinkler(c1._normal_name, c2._short_name)),
			(c1._normal_name === c1.name || c2._normal_name === c2._short_name ? 0 : jaroWinkler(c1._normal_name, c2._normal_name)));
		
		// Calculate overall score
		totalScore = totalScore * nameScore;
		if (totalScore < minTotalScore) return zeroScore;
		
		return {'totalScore': totalScore, 'nameScore': nameScore};
		
	}
	
	function writeDupesTable(groupIndex, matches) {
		console.log('writeDupesTable', groupIndex, matches);
		
		// Show table if any matches found
		table.show();
		
		var groupClass = `sjo-api-dupes-group-${groupIndex + 1}`;
		
		// Sort the group by ID and date
		matches.sort((a, b) => a.id > b.id || (a.id == b.id && a.election_date > b.election_date));
		$.each(matches, (matchIndex, match) => {
			
			// Recalculate the score against all the other matches
			var score = matches.reduce((acc, other, otherIndex) => Math.max(acc, match.id == other.id ? 0 : calcScore(match, other).totalScore), 0);
			
			// Write to the dupes table
			var row = $(`<tr class="${groupClass}"></tr>`)
				.addClass(matchIndex === 0 ? 'sjo-api-dupes-first' : '')
				.addCell(groupIndex + 1)
				.addCell(match.id)
				.addCell('') // blank column for links
				.addCellHTML('<a href="' + getLinkAddress(dataFields.name, match) + '">' + match.name + '</a>')
				.addCell(match.election_date)
				.addCell(match._election_area)
				.addCell(match._post_label)
				.addCell(match.party_name)
				.addCell(score.toFixed(2))
				.appendTo(table);
				
			if (score >= 1) {
				row.addClass('sjo-api-dupes-verymuch');
				//pauseDuplicates();
			}
			
		});
		
	}
	
}

// ================================================================
// General functions
// ================================================================

// Escape angle brackets in values
function escapeHtml(string) {
	return string ? ('' + string).replace(/</g, '&lt;').replace(/>/g, '&gt;') : string;
}

// Get the link for a display field
function getLinkAddress(field, candidate) {
	var href = field.link;
	var match;
	while (match = href.match(/^(.*?)@@(.*?)@@(.*)$/)) {
		href = match[1] + candidate[match[2]] + match[3];
	}
	return href;
}

// ================================================================
// Calculate difference between two strings
// ================================================================

// Based on http://en.wikipedia.org/wiki/Levenshtein_distance
function levenshtein(s, t) {
	if (s == t) return 0;
	if (s.length === 0) return t.length;
	if (t.length === 0) return s.length;
	var v0 = new Array(t.length + 1);
	var v1 = new Array(t.length + 1);
	var i, j;
	for (i = 0; i < v0.length; i++) {
		v0[i] = i;
	}
	for (i = 0; i < s.length; i++) {
		v1[0] = i + 1;
		for (j = 0; j < t.length; j++) {
			var cost = (s[i] == t[j]) ? 0 : 1;
			v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
		}
		for (j = 0; j < v0.length; j++) {
			v0[j] = v1[j];
		}
	}
	return v1[t.length];
}

// Based on https://github.com/jordanthomas/jaro-winkler/blob/master/index.js
function jaroWinkler(s1, s2) {
	var m = 0;
	var i, j;
	if (!s1 || !s2) return 0;
	if (s1 === s2) return 1;
	var range = (Math.floor(Math.max(s1.length, s2.length) / 2)) - 1;
	var s1Matches = new Array(s1.length);
	var s2Matches = new Array(s2.length);
	for (i = 0; i < s1.length; i++) {
		var low = (i >= range ? i - range : 0);
		var high = (i + range <= s2.length - 1 ? i + range : s2.length - 1);
		for (j = low; j <= high; j++) {
			if (s1Matches[i] !== true && s2Matches[j] !== true && s1[i] === s2[j]) {
				m++;
				s1Matches[i] = true;
				s2Matches[j] = true;
				break;
			}
		}
	}
	if (m === 0) return 0;
	var k = 0;
	var numTrans = 0;
	for (i = 0; i < s1.length; i++) {
		if (s1Matches[i] === true) {
			for (j = k; j < s2.length; j++) {
				if (s2Matches[j] === true) {
					k = j + 1;
					break;
				}
			}
			if (s1[i] !== s2[j]) numTrans++;
		}
	}
	var weight = (m / s1.length + m / s2.length + (m - (numTrans / 2)) / m) / 3;
	/*
	var l = 0;
	var p = 0.1;
	if (weight > 0.7) {
		while (s1[l] === s2[l] && l < 4) l++;
		weight = weight + l * p * (1 - weight);
	}
	*/
	return weight;
}

// ================================================================
// Supplementary data for name comparisons
// ================================================================

// TODO: move this to Github
// TODO: properly pair names so e.g. Samuel does not match Samantha
var nameNorms = {
	'Alex':		'Alexander',
	'Mandy':	'Amanda',
	'Andy':		'Andrew',
	'Angie':	'Angela',
	'Ben':		'Benjamin',
	'Beverly':	'Bev',
	'Cat':		'Catherine',
	'Cath':		'Catherine',
	'Cathy':	'Catherine',
	'Charlie':	'Charles',
	'Chris':	'Christopher',
	'Dan':		'Daniel',
	'Danny':	'Daniel',
	'Dave':		'David',
	'Des':		'Desmond',
	'Dom':  	'Dominic',
	'Don':  	'Donald',
	'Donnie':	'Donald',
	'Doug': 	'Douglas',
	'Dougie': 	'Douglas',
	'Ed':		'Edward',
	'Eddie':	'Edward',
	'Ted':		'Edward',
	'Beth':		'Elizabeth',
	'Liz':		'Elizabeth',
	'Lizzie':	'Elizabeth',
	'Lizzy':	'Elizabeth',
	'Fra':		'Francis',
	'Frank':	'Francis',
	'Fred':		'Frederick',
	'Freddie':	'Frederick',
	'Freddy':	'Frederick',
	'Geoff':	'Geoffrey',
	'Gill': 	'Gillian',
	'Gregory': 	'Greg',
	'Gregor': 	'Greg',
	'Jackie':	'Jacqueline',
	'Jamie':	'James',
	'Jim':		'James',
	'Jimmy':	'James',
	'Jan':  	'Janet',
	'Jeff':		'Jeffrey',
	'Jenny':	'Jennifer',
	'Jill': 	'Jillian',
	'Jo':		'Joanne',
	'Jack':		'John',
	'Johnny':	'John',
	'Jon':		'Jonathan',
	'Joe':		'Joseph',
	'Kath':		'Katherine',
	'Kathy':	'Katherine',
	'Kate':		'Katherine',
	'Katie':	'Katherine',
	'Katy': 	'Katherine',
	'Kim':		'Kimberly',
	'Kris':		'Kristian',
	'Les':		'Leslie',
	'Matt':		'Matthew',
	'Mick':		'Michael',
	'Mike':		'Michael',
	'Nick':		'Nicholas',
	'Norm':		'Norman',
	'Pam':		'Pamela',
	'Pete':		'Peter',
	'Philip':	'Phil',
	'Phillip':	'Phil',
	'Phill':	'Phil',
	'Pippa':	'Philippa',
	'Dick':		'Richard',
	'Rich':		'Richard',
	'Rick':		'Richard',
	'Ricky':	'Richard',
	'Bob':		'Robert',
	'Rob':		'Robert',
	'Robbie':	'Robert',
	'Robby':	'Robert',
	'Rod':		'Rodney',
	'Ron':		'Ronald',
	'Samuel':	'Sam',
	'Samantha':	'Sam',
	'Sammy':	'Sam',
	'Si':		'Simon',
	'Steve':	'Stephen',
	'Steven':	'Stephen',
	'Stevie':	'Stephen',
	'Sue':		'Susan',
	'Tom':		'Thomas',
	'Tommy':	'Thomas',
	'Terry':	'Terence',
	'Tim':		'Timothy',
	'Anthony':	'Tony',
	'Antony':	'Tony',
	'Val':  	'Valerie',
	'Vicky':	'Victoria',
	'Vikki':	'Victoria',
	'Bill':		'William',
	'Billy':	'William',
	'Will':		'William',
	'Willie':	'William',
};
