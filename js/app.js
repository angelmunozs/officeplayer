//	Javascript Timeout, activated when an iframe is called to load
var iframeError
//	Flags to collapse players
var isCollapsed = {
	soundcloud : true,
	youtube : true,
	mixcloud : true
}

//	Time allowed for the iframe to load, before showing error page
var IFRAME_LOAD_TIME_ALLOWED = 60000
//	Location of the error page
var ERROR_PAGE_LOCATION = 'error.html'
//	Errors shown
var errors = {
	WRONG_LINK : 'Wrong %s link!'
}

//	============================================================================================
//	Players
//	============================================================================================

var updateYouTubeLink = function (url) {
	//	Regex that matches a valid YouTube URL
	//	Source: http://stackoverflow.com/questions/3717115/regular-expression-for-youtube-links
	var yt_regex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
	if(yt_regex.test(url)) {
		inputOk('youtube')
		//	Regex that matches a YouTube video ID from a YouTube video URL
		var yt_id_regex = /[a-zA-Z0-9_-]{11,11}/
		var video_id = url.match(yt_id_regex)
		//	Replace video ID
		$('#youtube-iframe').attr('src', $('#youtube-iframe').attr('src').replace(yt_id_regex, video_id))
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
		var artist = url_separates[3]
		var title = url_separates[4]
		//	Soundcloud developers API to get track information
		$.get('http://api.soundcloud.com/resolve.json?url=http://soundcloud.com/' + artist + '/' + title + '&client_id=' + SOUNDCLOUD_CLIENT_ID, function (data) {
			$('#soundcloud-url').css('border-color', '#ccc')
			$('#soundcloud-iframe').attr('src', $('#soundcloud-iframe').attr('src').replace(/[0-9]{9,9}/, data.id))
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
		var src_attr = $('#mixcloud-iframe').attr('src').split('&')
		for(var i in src_attr) {
			if(/^feed=/.test(src_attr[i])) src_attr[i] = '&feed=' + encodeURIComponent(url) + (url[url.length - 1] == '/' ? '' : '%2F')
		}
		console.log(src_attr.join('&'))
		$('#mixcloud-iframe').attr('src', src_attr.join('&'))
	}
	else {
		console.log(errors.WRONG_LINK, 'Mixcloud')
		inputError('mixcloud')
	}
}

var inputError = function (platform) {
	if(!$('#' + platform + '-url')) return
	$('#' + platform + '-url').css('border-color', '#f00')
}

var inputOk = function (platform) {
	if(!$('#' + platform + '-url')) return
	$('#' + platform + '-url').css('border-color', '#ccc')
}

var showPlayer = function (platform) {
	$('.navbar-fixed-bottom').show()
	for(var p in isCollapsed) {
		if(p != platform) isCollapsed[p] = true
	}
	$('.platform-link').removeClass('active')
	$('.platform-addon').removeClass('active')
	if(isCollapsed[platform]) {
		$('.player').hide()
		$('#' + platform + '-player').show()
		$('#' + platform + '-link').addClass('active')
		$('#' + platform + '-addon').addClass('active')
		isCollapsed[platform] = false
	}
	else {
		$('.navbar-fixed-bottom').hide()
		$('.player').hide()
		$('#' + platform + '-link').removeClass('active')
		$('#' + platform + '-addon').removeClass('active')
		isCollapsed[platform] = true
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
		}
		if(!no_http_regex.test(url)) {
			url = 'http://' + url
		}
		$('#webpage-url').val(url)
		inputOk('webpage')
		$('#webpage-iframe').attr('src', url)
		console.log('Loading %s', url)
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
//	When ready document
//	============================================================================================

$(document).ready(function () {

	$('.navbar-fixed-bottom').hide()

	// var iframe = $('#webpage-iframe')
	//   iframe.load(function () {
	//   		$('#webpage-url').val(iframe.contentWindow.location.href)
	//		window.clearTimeout(iframeError)
	//		iframeError = null
	//   })

	var webpageInput = $('#webpage-url')
	var youtubeInput = $('#youtube-url')
	var soundcloudInput = $('#soundcloud-url')
	var mixcloudInput = $('#mixcloud-url')

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

	//	Load webpage
	$('#webpage-button').click(function () {
		loadPage(webpageInput.val())
	})
	//	Load music
	$('#youtube-button').click(function () {
		updateYouTubeLink(youtubeInput.val())
	})
	$('#soundcloud-button').click(function () {
		updateSoundCloudLink(soundcloudInput.val())
	})
	$('#mixcloud-button').click(function () {
		updateMixcloudLink(mixcloudInput.val())
	})

	//	On 'enter' key press
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
