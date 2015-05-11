//	Default songs to be loaded
var defaults = {
	youtube : {
		CLEAR_LINK : 'https://www.youtube.com/watch?v=BLya0SiphU8',
		EMBED_LINK : 'https://www.youtube.com/embed/BLya0SiphU8?rel=0&showinfo=0'
	},
	soundcloud : {
		CLEAR_LINK : 'https://soundcloud.com/bennypagemusic/studio-mix-recorded-for-bbc1xtra-742015',
		EMBED_LINK : 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/200631238&color=ff5500&inverse=false&auto_play=false&show_user=true'
	},
	mixcloud : {
		CLEAR_LINK : 'https://www.mixcloud.com/modek/modek-mixtape-for-off-radio-3-spain/',
		EMBED_LINK : 'https://www.mixcloud.com/widget/iframe/?embed_type=widget_standard&embed_uuid=37b4ad1a-39be-4f76-a3a7-89eb741e8e2e&feed=https%3A%2F%2Fwww.mixcloud.com%2Fmodek%2Fmodek-mixtape-for-off-radio-3-spain%2F&hide_artwork=1&hide_cover=1&hide_tracklist=1&light=1&mini=1&replace=0'
	}
}
//	Platform information
var platforms = {
	youtube: {
		full_name : 'YouTube',
		iframe_link : localStorage.lastYouTubeEmbedLink || defaults.youtube.EMBED_LINK,
		times_clicked : 0,
		is_collapsed : true
	},
	soundcloud: {
		full_name : 'SoundCloud',
		iframe_link : localStorage.lastSoundCloudEmbedLink || defaults.soundcloud.EMBED_LINK,
		times_clicked : 0,
		is_collapsed : true
	},
	mixcloud: {
		full_name : 'MixCloud',
		iframe_link : localStorage.lastMixCloudEmbedLink || defaults.mixcloud.EMBED_LINK,
		times_clicked : 0,
		is_collapsed : true
	}
}
//	Time allowed for the iframe to load, before showing error page (Currently unused)
var IFRAME_LOAD_TIME_ALLOWED = 60000
//	Page title (Currently unused)
var BASE_TITLE = 'Office Player'
//	Location of the error page (RELATIVE path to index.html) (Currently unused)
var ERROR_PAGE_LOCATION = 'error.html'
//	Errors shown
var errors = {
	WRONG_LINK : 'Wrong %s link!'
}

//	Javascript Timeout, activated when an iframe is called to load
var iframeError

//	============================================================================================
//	Players
//	============================================================================================

var updateYouTubeLink = function (url) {
	//	Regex that matches a valid YouTube URL
	//	Source: http://stackoverflow.com/questions/3717115/regular-expression-for-youtube-links
	var yt_regex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
	if(yt_regex.test(url)) {
		var iframe = $('#youtube-iframe')
		inputOk('youtube')
		//	Regex that matches a YouTube video ID from a YouTube video URL
		var yt_id_regex = /[a-zA-Z0-9_-]{11,11}/
		var video_id = url.match(yt_id_regex)
		//	Replace video ID
		iframe.attr('src', iframe.attr('src').replace(yt_id_regex, video_id))
		iframeIsLoading('youtube')
		//	Web storage
		localStorage.lastYouTubeEmbedLink = iframe.attr('src')
	}
	else {
		console.log(errors.WRONG_LINK, 'YouTube')
		inputError('youtube')
	}
}

var updateSoundCloudLink = function (url) {
	//	My own. See docs at https://developers.soundcloud.com/docs
	var SOUNDCLOUD_CLIENT_ID = '3e9dd75156ca9e500e4798241f6ac840'
	//	Regex that matches a valid SoundCloud URL
	//	Source: http://stackoverflow.com/questions/18227087/validate-soundcloud-url-via-javascript-regex
	var sc_regex = /^https?:\/\/(soundcloud.com|snd.sc)\/(.*)$/
	//	Separate URL by slashes
	var url_separates = url.split('/')

	if(sc_regex.test(url) && url_separates.length > 4 && url_separates.length < 7) {
		inputOk('youtube')
		var iframe = $('#soundcloud-iframe')
		var artist = url_separates[3]
		var title = url_separates[4]
		//	Soundcloud developers API to get track information
		$.get('http://api.soundcloud.com/resolve.json?url=http://soundcloud.com/' + artist + '/' + title + '&client_id=' + SOUNDCLOUD_CLIENT_ID, function (data) {
			$('#soundcloud-url').css('border-color', '#ccc')
			iframe.attr('src', iframe.attr('src').replace(/[0-9]{9,9}/, data.id))
			iframeIsLoading('soundcloud')
			//	Web storage
			localStorage.lastSoundCloudEmbedLink = iframe.attr('src')
		})
	}
	else {
		console.log(errors.WRONG_LINK, 'SoundCloud')
		inputError('soundcloud')
	}
}

var updateMixcloudLink = function (url) {
	//	Regex that matches a valid Mixcloud URL
	var mc_regex = /^https?:\/\/www\.mixcloud\.com\/(.*)$/
	//	Separate URL by slashes
	var url_separates = url.split('/')

	if(mc_regex.test(url) && url_separates.length > 4 && url_separates.length < 7) {
		inputOk('mixcloud')
		var iframe = $('#mixcloud-iframe')
		var src_attr = iframe.attr('src').split('&')
		for(var i in src_attr) {
			if(/^feed=/.test(src_attr[i])) src_attr[i] = '&feed=' + encodeURIComponent(url) + (url[url.length - 1] == '/' ? '' : '%2F')
		}
		iframe.attr('src', src_attr.join('&'))
		iframeIsLoading('mixcloud')
		//	Web storage
		localStorage.lastMixCloudEmbedLink = iframe.attr('src')
	}
	else {
		console.log(errors.WRONG_LINK, 'Mixcloud')
		inputError('mixcloud')
	}
}

var showPlayer = function (platform) {
	//	Load platform default URL if not loaded yet
	//	Flag variable postincremented
	if(platforms[platform].times_clicked++ === 0) {
		console.log('Loading %s iframe', platforms[platform].full_name)
		$('#' + platform + '-iframe').attr('src', platforms[platform].iframe_link)
	}
	//	Show navbar
	$('.navbar-fixed-bottom').show()
	//	Collapse everyone else
	for(var p in platforms) {
		if(p != platform) platforms[p].is_collapsed = true
	}
	//	Set everyone as inactive
	$('.platform-link').removeClass('active')
	$('.platform-addon').removeClass('active')
	if(platforms[platform].is_collapsed) {
		$('.player').hide()
		$('#' + platform + '-player').show()
		$('#' + platform + '-link').addClass('active')
		$('#' + platform + '-addon').addClass('active')
		platforms[platform].is_collapsed = false
	}
	else {
		$('.navbar-fixed-bottom').hide()
		$('.player').hide()
		$('#' + platform + '-link').removeClass('active')
		$('#' + platform + '-addon').removeClass('active')
		platforms[platform].is_collapsed = true
	}
}

//	============================================================================================
//	Main iframe
//	============================================================================================

var loadPage = function (url) {
	//	Regex that matches a URL
	//	Source: http://code.tutsplus.com/tutorials/8-regular-expressions-you-should-know--net-6149
	var url_regex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
	//	Regex that matches a URL starting with 'http://' or 'https://'
	var no_http_regex = /^https?\:\/\//
	if(url_regex.test(url)) {
		if(url.indexOf('officeplayer') != -1) {
			console.log('Isn\'t one Office Player enough?')
			inputError('webpage')
			return
		}
		if(!no_http_regex.test(url)) {
			url = 'http://' + url
		}
		//	Pass parsed URL to input value
		$('#webpage-url').val(url)
		//	Reset default input style
		inputOk('webpage')
		//	Update src attribute
		$('#webpage-iframe').attr('src', url)
		//	Show loader
		iframeIsLoading('webpage')
		var encodedURL = encodeURIComponent(url)
		//	Start timeout
		// iframeError = window.setTimeout(function () {
		// 	$('#webpage-iframe').attr('src', ERROR_PAGE_LOCATION)
		// }, IFRAME_LOAD_TIME_ALLOWED)
	}
	else {
		console.log('Not an URL!')
		inputError('webpage')
	}
}

//	============================================================================================
//	Generic functions
//	============================================================================================

var inputError = function (platform) {
	if(!$('#' + platform + '-url')) return
	$('#' + platform + '-url').css('border-color', '#f00')
}

var inputOk = function (platform) {
	if(!$('#' + platform + '-url')) return
	$('#' + platform + '-url').css('border-color', '#ccc')
}

var iframeIsLoading = function (platform) {
	platforms[platform].times_clicked++
	$('#' + platform + '-button').html('<span class="fa fa-spinner fa-spin"></span>')
}

var iframeIsLoaded = function (platform) {
	$('#' + platform + '-button').html('<span class="fa fa-globe"></span>')
}

var updateTitle = function (data) {
	return
	if(data && data.length) {
		$('#title').html(data + ' | ' + BASE_TITLE)
	}
}

var updateFavicon = function (data) {
	return
	if(data && data.length) {
		$('#favicon').attr('href', favicon)
	}
}

//	============================================================================================
//	When ready document
//	============================================================================================

$(document).ready(function () {

	$('.navbar-fixed-bottom').hide()

	//	Variables
	var webpageIframe = $('#webpage-iframe')
	var youtubeIframe = $('#youtube-iframe')
	var soundcloudIframe = $('#soundcloud-iframe')
	var mixcloudIframe = $('#mixcloud-iframe')
	var webpageInput = $('#webpage-url')
	var youtubeInput = $('#youtube-url')
	var soundcloudInput = $('#soundcloud-url')
	var mixcloudInput = $('#mixcloud-url')

	//	Load events
	webpageIframe.load(function () {
		iframeIsLoaded('webpage')
		//	updateTitle($('#webpage-iframe').contents().find("title").html())
		//	updateFavicon($('#webpage-iframe').contents().find("link").html())
		//	$('#webpage-url').val(iframe.contentWindow.location.href)
		//	window.clearTimeout(iframeError)
		//	iframeError = null
	})
	youtubeIframe.load(function () {
		iframeIsLoaded('youtube')
	})	
	soundcloudIframe.load(function () {
		iframeIsLoaded('soundcloud')
	})	
	mixcloudIframe.load(function () {
		iframeIsLoaded('mixcloud')
	})	

    //	Show players
	$('#youtube-link').click(function () {
		showPlayer('youtube')
	})
	$('#soundcloud-link').click(function () {
		showPlayer('soundcloud')
	})
	$('#mixcloud-link').click(function () {
		showPlayer('mixcloud')
	})

	//	Click events
	$('#webpage-button').click(function () {
		loadPage(webpageInput.val())
	})
	$('#youtube-button').click(function () {
		updateYouTubeLink(youtubeInput.val())
	})
	$('#soundcloud-button').click(function () {
		updateSoundCloudLink(soundcloudInput.val())
	})
	$('#mixcloud-button').click(function () {
		updateMixcloudLink(mixcloudInput.val())
	})

	//	'Enter' key events
	webpageInput.keyup(function (event) {
		if(event.keyCode == 13){
			loadPage(webpageInput.val())
		}
	})
	youtubeInput.keyup(function (event) {
		if(event.keyCode == 13){
			updateYouTubeLink(youtubeInput.val())
		}
	})
	soundcloudInput.keyup(function (event) {
		if(event.keyCode == 13){
			updateSoundCloudLink(soundcloudInput.val())
		}
	})
	mixcloudInput.keyup(function (event) {
		if(event.keyCode == 13){
			updateMixcloudLink(mixcloudInput.val())
		}
	})
})
