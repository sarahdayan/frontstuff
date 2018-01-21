var App = (function() {
	var THEMES = ['light', 'dark']
	var CURRENT_THEME = 'light'

	var ls = (function() {
		return {
			get: function(key) {
				return JSON.parse(localStorage.getItem(key))
			},
			set: function(key, value) {
				try {
					localStorage.setItem(key, JSON.stringify(value))
					return true
				} catch (e) {
					return false
				}
			}
		}
	})()

	var isTheme = function(theme) {
		return THEMES.indexOf(theme) !== -1
	}

	var setCurrentTheme = function(theme) {
		if (isTheme(theme)) return theme
	}

	var toggleCurrentTheme = function() {
		return THEMES.find(function(theme) {
			return theme !== CURRENT_THEME
		})
	}

	var applyLayout = function(theme) {
		if (isTheme(theme)) {
			THEMES.forEach(function(theme) {
				document.body.classList.remove('theme--' + theme)
				document
					.getElementById('theme-toggle')
					.classList.remove('theme__switch--' + theme)
			})
			document.body.classList.add('theme--' + theme)
			document
				.getElementById('theme-toggle')
				.classList.add('theme__switch--' + theme)
		}
	}

	var saveTheme = function(theme) {
		if (isTheme(theme)) return ls.set('theme', theme)
	}

	var switchTheme = function(theme) {
		CURRENT_THEME = theme
		applyLayout(CURRENT_THEME)
		saveTheme(CURRENT_THEME)
	}

	var bind = function() {
		document
			.getElementById('theme-toggle')
			.addEventListener('click', function() {
				switchTheme(toggleCurrentTheme())
			})
	}

	return {
		init: function() {
			bind()
			switchTheme(ls.get('theme'))
		}
	}
})()
