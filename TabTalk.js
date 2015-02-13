/*
 * TabTalk v1.0.0
 * https://github.com/MarkehMe/TabTalk
 *
 * Copyright (c) 2015 Mark Hughes
 * Released under the MIT license
 *
 */
	
	var TabTalk = {};
	
	TabTalk.options = {};
	TabTalk.options.ignoreMessagesFromSelf = true;
	TabTalk.options.updateInterval = 500;
	
	TabTalk.id = Math.floor(Math.random() * 1000000000);
	TabTalk.callback = null;
	TabTalk.ourLength = 0;
	TabTalk.read = null;
	
	TabTalk.load = function() {
		this.read = new Array();
		
		var tabTalkData = JSON.parse(localStorage.getItem("TabTalkData"));
		this.ourLength = tabTalkData.length
				
		// Mark anything existing as read
		for(row in tabTalkData) {
			if (!tabTalkData.hasOwnProperty(row)) { continue; }
			if(tabTalkData[row].from == this.id & this.options.ignoreMessagesFromSelf) { continue; }
			this.read.push(tabTalkData[row].timestamp + "/" + tabTalkData[row].from);
		}

		TabTalk.timer = setInterval(function() {
			if(this.callback != null) {
				var tabTalkData = JSON.parse(localStorage.getItem("TabTalkData"));
				
				// Check for changes
				if(this.ourLength != tabTalkData.length) {
					for (row in tabTalkData) {
						// Ensure it's what we're after
						if (!tabTalkData.hasOwnProperty(row)) {
							continue;
						}
						// Ensure its not a message we announced (if configured that way)
						if(tabTalkData[row].from == this.id & this.options.ignoreMessagesFromSelf) {
							continue;
						}
						if(this.read.indexOf(tabTalkData[row].timestamp + "/" + tabTalkData[row].from) > -1) {
							// TODO: Cleanup anything older than 10 seconds 
							continue;
						}
						// Store it as read
						this.read.push(tabTalkData[row].timestamp + "/" + tabTalkData[row].from);
						this.callback(tabTalkData[row]);
					}
				}
				
				this.ourLength = tabTalkData.length
			}
		}, this.options.updateInterval);
	};
	
	// A nicer way to set a callback function
	TabTalk.setCallback = function(func) {
		this.callback = func;
	};
	
	TabTalk.talk = function(data) {
		// Create the message object to pass along, this contains
		// a timestamp, this tab id, and a message
		var message = {
			timestamp: (new Date()).getTime(),
			from: this.id,
			message: data
		};
		// Fetch existing data, decode it from JSON
		var tabTalkData = JSON.parse(localStorage.getItem("TabTalkData"));
		
		// If it's null, we'll add some of our own information
		// otherwise, append our information
		if(tabTalkData == null) {
			tabTalkData = [];
		} else {
			tabTalkData.push(message);
		}
		// Store new data in a JSON format 
		localStorage.setItem("TabTalkData", JSON.stringify(tabTalkData));
	};
	
	if(window.addEventListener) {
		window.addEventListener("DOMContentLoaded", TabTalk.load);
	} else {
		window.attachEvent("onload", TabTalk.load);
	}
	
	// This is just an alias, it can be removed
	function Talk(data) {
		return(TabTalk.talk(data));
	}