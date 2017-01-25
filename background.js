new (function($) {
	function init($) {

		var off_status = {}

		var off = true;
		var on_path = {
			"19": "assets/icon19.png",
			"38": "assets/icon38.png"
		};
		var off_path = {
			"19": "assets/icon19_off.png",
			"38": "assets/icon38_off.png"
		};
		chrome.browserAction.setIcon({
			path: on_path
		});

		chrome.extension.onMessage.addListener(
			function(request, sender, sendResponse) {
				off_status[sender.tab.id] = request.is_off
				// if (request.is_off) {
				// 	chrome.browserAction.setIcon({
				// 		path: off_path
				// 	});
				// } else {
				// 	chrome.browserAction.setIcon({
				// 		path: on_path
				// 	});
				// }
				chrome.browserAction.setBadgeText({
					tabId: sender.tab.id,
					text: request.is_off ? "" : "on"
				});
 			}
		);

		// Called when the user clicks on the browser action.
		chrome.browserAction.onClicked.addListener(function(tab) {
			// No tabs or host permissions needed!
			console.log('Turning ' + tab.url + ' red!');
			chrome.tabs.executeScript(
				null,
				{file: "libs/jquery.min.js"}
			);
			chrome.tabs.executeScript(
				null,
				{file: "reader.js"}
			);
 		});


	}
	init($);
})($);
