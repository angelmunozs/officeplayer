//	Time allowed for the iframe to load
var iframeLoadTimeAllowed = 5000
//	Error shown in concole when an iframe fails to load because the resource denies it
var iframeLoadingError = 'Load denied by X-Frame-Options: %s does not permit cross-origin framing'
var iframeError

var updateYouTubeLink = function (url) {
	//	Regex that matches a valid YouTube URL
	//	Source: http://stackoverflow.com/questions/3717115/regular-expression-for-youtube-links
	var yt_regex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
	if(yt_regex.test(url)) {
		//	Regex that matches a YouTube video ID from a YouTube video URL
		var yt_id_regex = /[a-zA-Z0-9_-]{11,11}/
		var video_id = url.match(yt_id_regex)
		$('#youtube-url').css('border-color', '#ccc')
		//	Replace video ID
		$('#youtube-iframe').attr('src', $('#youtube-iframe').attr('src').replace(yt_id_regex, video_id))
	}
	else {
		console.log('Wrong YouTube link!')
		$('#youtube-url').css('border-color', '#f00')
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
	
	if(/https?:\/\/soundcloud\.com/.test(url) && url_separates.length == 5) {
		var artist = url_separates[3]
		var title = url_separates[4]
		//	Soundcloud developers API to get track information
		$.get('http://api.soundcloud.com/resolve.json?url=http://soundcloud.com/' + artist + '/' + title + '&client_id=' + SOUNDCLOUD_CLIENT_ID, function (data) {
			$('#soundcloud-url').css('border-color', '#ccc')
			$('#soundcloud-iframe').attr('src', $('#soundcloud-iframe').attr('src').replace(/[0-9]{9,9}/, data.id))
		})
	}
	else {
		console.log('Wrong SoundCloud link!')
		$('#soundcloud-url').css('border-color', '#f00')
	}
}
var loadPage = function (url) {
	//	Regex that matches a URL
	//	Source: http://code.tutsplus.com/tutorials/8-regular-expressions-you-should-know--net-6149
	var url_regex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
	if(url_regex.test(url)) {
		$('#webpage-url').css('border-color', '#ccc')
		$('#webpage-iframe').attr('src', url)
		console.log('Loading %s', url)
		//	Start timeout
		iframeError = setTimeout(function () {
			$('#webpage-url').css('border-color', '#f00')
			alert(iframeLoadingError, url)
		}, iframeLoadTimeAllowed)
	}
	else {
		console.log('Not an URL!')
		$('#webpage-url').css('border-color', '#f00')
		return
	}
}

$(document).ready(function () {
    $('#webpage-iframe').on('load', function () {
        clearTimeout(iframeError);
    })
	$('.youtube').hide()
	$('#youtube-link').click(function () {
		$('#soundcloud-player').hide()
		$('#youtube-player').show()
	})
	$('#soundcloud-link').click(function () {
		$('#youtube-player').hide()
		$('#soundcloud-player').show()
	})
	$('#youtube-button').click(function () {
		updateYouTubeLink($('#youtube-url').val())
	})
	$('#soundcloud-button').click(function () {
		updateSoundCloudLink($('#soundcloud-url').val())
	})
	$('#webpage-load').click(function () {
		loadPage($('#webpage-url').val())
	})
})
