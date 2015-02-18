/*
 * TabTalk v1.1.0
 * https://github.com/MarkehMe/TabTalk
 *
 * Copyright (c) 2015 Mark Hughes <mark@markeh.me>
 * Released under the MIT license
 *
 */
	
	var TabTalk = {};
	
	TabTalk.options = {
		ignoreMessagesFromSelf: true,
		updateInterval: 1000,
		cleanupInterval: 5000,
		extraJSONParse: false
	};
		
	TabTalk.id = Math.floor(Math.random() * 1000000000);
	TabTalk.callback = null;
	TabTalk.ourLength = 0;
	TabTalk.read = null;
		
	TabTalk.load = function() {
		
		TabTalk.read = new Array();
		
		var tabTalkData = JSON.parse(localStorage.getItem("TabTalkData"));
		if(localStorage.getItem("TabTalkData") != null) {
			TabTalk.ourLength = tabTalkData.length
		} else {
			TabTalk.ourLength = -1;
		}
				
		// Mark anything existing as read
		for(row in tabTalkData) {
			if (!tabTalkData.hasOwnProperty(row)) { continue; }
			if(tabTalkData[row].from == TabTalk.id & TabTalk.options.ignoreMessagesFromSelf) { continue; }
			TabTalk.read.push(tabTalkData[row].timestamp + "/" + tabTalkData[row].from);
		}
		
		localStorage.setItem("TabTalkPing", Date());

		TabTalk.timer = setInterval(function() {
			localStorage.setItem("TabTalkPing", Date());
			
			if(TabTalk.callback != null & localStorage.getItem("TabTalkData") != null) {
				var tabTalkData = JSON.parse(localStorage.getItem("TabTalkData"));
				
				// Check for changes
				if(TabTalk.ourLength != tabTalkData.length) {
					console.log("ping: (changes!)");
					
					for (row in tabTalkData) {
						// Ensure it's what we're after
						if (!tabTalkData.hasOwnProperty(row)) {
							continue;
						}
						// Ensure its not a message we announced (if configured that way)
						if(tabTalkData[row].from == TabTalk.id & TabTalk.options.ignoreMessagesFromSelf) {
							continue;
						}
						if(TabTalk.read.indexOf(tabTalkData[row].timestamp + "/" + tabTalkData[row].from) > -1) {
							// If data is older than the specified time, we remove it
							if((new Date()).getTime() - tabTalkData[row].timestamp > TabTalk.options.cleanupInterval) {
								tabTalkData.splice(row, 1);
								
								// Just a bit of garbage collection, this is delayed to stop any conflicts
								setTimeout(function() { 
									TabTalk.read.splice(TabTalk.read.indexOf(tabTalkData[row].timestamp + "/" + tabTalkData[row].from), 1);
								}, TabTalk.options.updateInterval+1500);
							}
							
							continue;
						}
						// Store it as read
						TabTalk.read.push(tabTalkData[row].timestamp + "/" + tabTalkData[row].from);
						TabTalk.callback(tabTalkData[row]);
					}
				} else {
					console.log("ping: (no changes)");
				}
				
				// Incase we removed anything, we clean up
				localStorage.setItem("TabTalkData", JSON.stringify(tabTalkData, TabTalk.JSONReplacer));
				
				TabTalk.ourLength = tabTalkData.length
			}
		}, TabTalk.options.updateInterval);
	};
	
	// A nicer way to set a callback function
	TabTalk.setCallback = function(func) {
		TabTalk.callback = func;
	};
	
	TabTalk.talk = function(data) {
		// Create the message object to pass along, this contains
		// a timestamp, this tab id, and a message
		var message = {
			timestamp: (new Date()).getTime(),
			from: TabTalk.id,
			message: data
		};
		// Fetch existing data, decode it from JSON
		var tabTalkData = JSON.parse(localStorage.getItem("TabTalkData"));
		
		// If it's null, we'll create a default array
		// otherwise, append our new information
		if(tabTalkData == null) {
			tabTalkData = [];
		} else {
			tabTalkData.push(message);
		}
		// Store new data in a JSON format 
		var newData = JSON.stringify(tabTalkData, TabTalk.JSONReplacer);
		
		localStorage.setItem("TabTalkData", newData);
	};
	
	// to allow passing functions and string specifics, we prepend the object type to the start
	TabTalk.JSONReplacer = function(key, value) {
		// we don't want to break objects
		if(typeof value == "object") {
			return value;
		}
		
		// if this is disabled, then we'll just return a regular value
		if(!TabTalk.options.extraJSONParse) {
			return value;
		}
		
		// prepend the type
		return "[" + (typeof value) + "]" + value.toString();
	}
	
	TabTalk.JSONFixer = function (key, value) {
		if(!TabTalk.options.extraJSONParse) {
			return value;
		}
		
		var type;
		
		if (value && typeof value === 'object') {
			type = value.type;
			if (typeof type === 'string' && typeof window[type] === 'function') {
				return new (window[type])(value);
			}
		}
		
		return value;
	}
	
	TabTalk.fallbackType = null;
	TabTalk.dataStore = null;
	
	if(!("localStorage" in window)) {
	
		// No localStorage, lets write our own implementation 
		
		// === IE-only userData behavior === //
		// downfalls: if IE security settings are high it could cause issues 
		var myNav = navigator.userAgent.toLowerCase();
		var ieTEST = (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
		
		if(ieTEST < 8) {
			TabTalk.fallbackType = "userData";
			
			// let's prepare our userData stuff
			var style = document.createElement("style");
			style.type = "text/css";
			style.innerHTML = ".userDataLocalStorage { top: -9999px; position: absolute; visibility: hidden; BEHAVIOR: url(#default#userdata); }";
			document.getElementsByTagName('head')[0].appendChild(style);
			
			TabTalk.dataStore = document.createElement("div");
			storeDIV.className = "userDataLocalStorage";
			document.getElementsByTagName('body')[0].appendChild(style);
			
			TabTalk.dataStore.load("oDataStore");
		} else if("globalStorage" in window) {
			// === globalStorage === //
			// supported in firefox 2-13, as localStorage is only in firefox 3.5+
			
			TabTalk.fallbackType = "globalStorage";
			
			if (window.location.hostname == "localhost") {
				TabTalk.dataStore = window.globalStorage["localhost.localdomain"];
			} else {
				TabTalk.dataStore = window.globalStorage[window.location.hostname];
			}
		} else {
			// === Cookies === //
			// downfalls: maximum of 4096 bytes worth of storage (should not cause an issue)
			
			var cookiesEnabled = false;
			
			if(typeof navigator.cookieEnabled == "undefined") { 
				var backupCookie = document.cookie;
				document.cookie = "CookieTest=1"
				cookiesEnabled = (document.cookie.indexOf("CookieTest") != -1) ? true : false
				document.cookie = backupCookie;
			} else {
				cookiesEnabled = (navigator.cookieEnabled)? true : false
			}
			
			if(cookiesEnabled) {
				TabTalk.fallbackType = "cookies";
			} else {
				// TODO: add more fallbacks (flash?)
			}
		}
		
		// Let's build our new object, this is used to replicate localStorage 
		
		localStorage = {};
		
		localStorage.setItem = function(key, value) {
			if(TabTalk.fallbackType == "cookies") {
				// Here is our cookie, it's set to expire after 1hr
				var cookie =
					"localstorage_"+key+"="+escape(value) + ";" +
					"expires="+(new Date()).setTime(expires.getTime() + (60 * 60 * 1000));	
				
				return document.cookie = cookie;
			}
			
			if(TabTalk.fallbackType = "userData") {
				TabTalk.dataStore.setAttribute("localstorage_"+key, value);
				TabTalk.dataStore.save("oDataStore");
			}
			
			return null;
		};
		
		localStorage.getItem = function(key) {
			if(TabTalk.fallbackType == "cookies") {
				var cookieMatch = document.cookie.match(new RegExp("localstorage_"+key +"=[a-zA-Z0-9.()=|%/_]+($|;)", "g"));
				
				if(cookieMatch) {
					return(unescape(cookieMatch[0].substring("localstorage_"+key.length+1, cookieMatch[0].length).replace(";", "")));
				}
			}
			
			if(TabTalk.fallbackType = "userData") {
				TabTalk.dataStore.load("oDataStore");
				if(!TabTalk.dataStore.hasAttribute("localstorage_"+key)) {
					return null;
				}
				
				return TabTalk.dataStore.getAttribute("localstorage_"+key);
			}
			
			return null;
		};
		
		localStorage.removeItem = function(key) {
			if(TabTalk.fallbackType == "cookies") {
				document.cookie = "localstorage_"+key+"=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
			}
			
			if(TabTalk.fallbackType = "userData") {
				TabTalk.dataStore.removeAttribute("localstorage_"+key);
				TabTalk.dataStore.save("oDataStore");

			}
		};
		
		localStorage.clear = function() {
			if(TabTalk.fallbackType == "cookies") {
				var cookies = document.cookie.split(";");
				for(var i = 0; i < cookies.length; i++) {
					var fullItemName = cookies[i].split("=")[0];
					
					if(fullItemName.indexOf("localstorage_") == 0) {
						var itemName = fullItemName.split("storage_")[1];
						
						localStorage.removeItem(itemName);
					}
				}
			}
			
			if(TabTalk.fallbackType = "userData") {
				// Instead of calling our clear function, which will call .save() too many times, we'll
				// just do this ourself at the end.
				for(var i = 0; i < TabTalk.dataStore.attributes.length; i++) {
					var attrib = TabTalk.dataStore.attributes[i];
					if(attrib.specified && attrib.name.indexOf("localstorage_")) { // this is a must-have for IE! 
						TabTalk.dataStore.removeAttribute(attrib.name);
					}
				}
				
				TabTalk.dataStore.save("oDataStore");
			}
		};
		
		if(TabTalk.fallbackType == "globalStorage") {
			localStorage = TabTalk.dataStore;
		}
		
		window.localStorage = localStorage;
		
	}
	
	if(window.addEventListener) {
		window.addEventListener("DOMContentLoaded", TabTalk.load);
	} else {
		window.attachEvent("onload", TabTalk.load);
	}
	
	// This is just an alias, it can be removed
	function Talk(data) {
		return(TabTalk.talk(data));
	}