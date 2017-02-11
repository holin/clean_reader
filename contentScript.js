new (function($) {
	function init($) {
		var toggle_key_press_count = 0;
		$(document).keyup(function(e) {
				// console.debug("content script key code", e.keyCode)
				if (e.keyCode == 82) { //keypess: r
					toggle_key_press_count += 1
					setTimeout(function() {
						toggle_key_press_count = 0
					}, 500);
					if (toggle_key_press_count > 1) {
						//only trigger toggle after `r` press more then once in one second.
						Reader.toggle();
					}
				} else {
					toggle_key_press_count = 0
				}
		});
	}
	init($);
})($);
