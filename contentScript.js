new (function($) {
	function init($) {
		$(document).keyup(function(e) {
				console.debug("content script key code", e.keyCode)
				if (e.keyCode == 82) { //r
						Reader.toggle();
				}
		});
	}
	init($);
})($);
