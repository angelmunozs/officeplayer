var updateYouTubeLink = function (url) {
	if(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/.test(url)) {
		var yt_id_regex = /[a-zA-Z0-9-_]{11,11}/
		var video_id = url.match(yt_id_regex)
		$('#youtube-url').css('border-color', '#ccc')
		$('#youtube-iframe').attr('src', $('#youtube-iframe').attr('src').replace(yt_id_regex, video_id))
	}
	else {
		console.log('Wrong YouTube link!')
		$('#youtube-url').css('border-color', '#f00')
	}
}
var updateSoundCloudLink = function (url) {
	var soundcloud_client_id = '3e9dd75156ca9e500e4798241f6ac840'
	var url_words = url.split('/')
	
	if(/https?:\/\/soundcloud\.com/.test(url) && url_words.length == 5) {
		var artist = url_words[3]
		var title = url_words[4]

		$.get('http://api.soundcloud.com/resolve.json?url=http://soundcloud.com/' + artist + '/' + title + '&client_id=' + soundcloud_client_id, function (data) {
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
	var url_regex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
	if(url_regex.test(url)) {
		$('#webpage-url').css('border-color', '#ccc')
		$('#webpage-iframe').attr('src', url)
		console.log('Loading %s', url)
	}
	else {
		console.log('Not an URL!')
		$('#webpage-url').css('border-color', '#f00')
		return
	}
}

$(document).ready(function () {
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