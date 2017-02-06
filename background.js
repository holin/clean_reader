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
			path: off_path
		});


		function update_icon_for_tab(tabId) {
			var is_off = off_status[tabId];
			if (is_off === undefined) {
				is_off = true;
			}
			// console.log("update_icon_for_tab", tabId, off_status, is_off);
			if (is_off) {
				chrome.browserAction.setIcon({
					path: off_path
				});
				chrome.browserAction.setBadgeText({
					tabId: tabId,
					text: ""
				});
			} else {
				chrome.browserAction.setIcon({
					path: on_path
				});
				chrome.browserAction.setBadgeText({
					tabId: tabId,
					text: "on"
				});
			}
		}

		chrome.tabs.onActivated.addListener( function(info) {
				var tabId = info.tabId;
				update_icon_for_tab(tabId);
		});

		chrome.extension.onMessage.addListener(
			function(request, sender, sendResponse) {
				var tabId = sender.tab.id;
				var action = request.action || 'toggle'
				switch (action) {
					case "toggle":
						off_status[tabId] = request.is_off
						update_icon_for_tab(tabId);
						sendResponse({'toggle': 'success'})
						break;
					case "init_zoom_percents":
						// console.log("init_zoom_percents action")
						sendResponse(ReaderDb.zoomPercents)
						break;
					case "update_zoom_percent":
						// console.log("update_zoom_percent action")
						ReaderDb.zoomPercents[request.domain] = request.percent
						ReaderDb.save()
						sendResponse({'update_zoom_percent': 'success'})
						break;
					default:
						off_status[tabId] = request.is_off
						update_icon_for_tab(tabId);
						sendResponse({'toggle': 'success'})
						break;
				}

 			}
		);

		chrome.browserAction.onClicked.addListener(function(tab) {
			// chrome.tabs.executeScript(
			// 	null,
			// 	{file: "libs/jquery.min.js"}
			// );
			chrome.tabs.executeScript(
				null,
				{code: "Reader.toggle()"}
			);
 		});


	}
	init($);
})($);
