var _wmVideos_ = new function() {

	this.init = function(prefix, id_url)
	{
		var initFun = function()
		{
			if (!id_url) {
				loadYTWatch(prefix);
			} else {
				doEmbed(prefix, id_url);	
			}
		}
		
		if (window.addEventListener) {
			window.addEventListener('load', initFun, false);
		} else if (window.attachEvent) {
			window.attachEvent('onload', initFun);
		}
	}
	
	var initYTVideoEmbedRewriter = function(prefix)
	{
		var initFun = function()
		{
			loadYTWatch(prefix);
		}
		
		if (window.addEventListener) {
			window.addEventListener('load', initFun, false);
		} else if (window.attachEvent) {
			window.attachEvent('onload', initFun);
		}
	}
	
	
	var loadYTWatch = function(prefix, videoid)
	{
	    var http = new XMLHttpRequest();
	    
	    http.onreadystatechange = function() {
	        if (http.readyState === 4){
	        	if (http.status == 200) {
	        		var groups = http.responseText.match(/initYTVideo\(\'([^']+)/);
	        		if (!groups || groups.length < 1) {
	        			return;
	        		}
	        		var id = groups[1];
	        		doEmbed(prefix, id);
	        	}
	        }
	    };
	    
	    var EMBED = "/embed/";
	    var idindex = document.location.href.indexOf(EMBED);
	    
	    if (idindex < 0) {
	    	return;
	    }
	    
	    var videoid = document.location.href.substr(idindex + EMBED.length);
	    
	    http.open('GET', prefix + "http://youtube.com/watch?v=" + videoid);
	    http.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
	    http.send();
	}
	
	var writeWatchPlayer = function(player, fullPathPrefix, flashUrl) {
		
		var fullWaybackUrl = fullPathPrefix + flashUrl;
		
		var width = "100%";
		var height = "100%";
			
		if (player.tagName != "div") {
			player = player.parentNode;
			if (!player.id) {
				player.id = "_wm_video_embed_" + new Date().getTime();
			}
		}
		
		var playerId = player.id;
	
		if (player.clientHeight) {
			height = player.clientHeight;
		}
	
		if (player.clientWidth) {
			width = player.clientWidth;
		}
		
	    
	    var doSetup = function(theType, autostart, onErrFallback)
	    {
	    	jwplayer(playerId).setup({
	            'height': height,
	            'width': width,
	            'autostart': autostart,
	            
	             playlist : [{
	               sources: [
	                 {'file': fullWaybackUrl, type: theType},
	               ]
	             }],
	             
	             events: { onError: onErrFallback }
	    	});
	    }
	    
	    var initByType = function (vidType) {
	    
		    if (vidType == null) {
		    	player.innerHTML = "Sorry, the Wayback Machine does not have this video archived.";
		    	player.style.paddingLeft = "0px";
		    	player.style.paddingTop = "24px";
		    } else if (vidType.indexOf('webm') >= 0) {
		    	doSetup('webm', false);
		    } else if (vidType.indexOf('flv') >= 0) {
		      	doSetup('flv', false);
		    } else {
		        doSetup('webm', false, function() { doSetup('flv', true); });	
		    }
	    }
	    
		// Ajax to check type
	    var http = new XMLHttpRequest();
	    http.onreadystatechange = function() {
	        if (http.readyState === 4){
	        	var theType = null;
	        	
	        	if (http.status == 200) {
	        		theType = http.getResponseHeader("Content-Type");
	        	}
	        	
	        	initByType(theType);
	        }
	    }
	    
	    http.open('HEAD', fullWaybackUrl);
	    http.setRequestHeader('X-Requested-With', 'XMLHttpRequest');	    
	    http.send();
	}
	
	var doEmbed = function(prefix, id)
	{
		var fakeUrl = "http://wayback-fakeurl.archive.org/youtube/" + id;
		findReplaceVideoPlayer(prefix + "2oe_/", [fakeUrl]);
	}
	
	var findReplaceVideoPlayer = function(fullPathPrefix, flashUrl) {
		
		var noMultipleVideos = (flashUrl.length > 1);
	
		// First try embeds, then objects
		var elems = document.getElementsByTagName("embed");
	
		if (elems && elems.length > 0) {
			
			var index = 0;
			if ((elems.length > 1) && (elems[0].src.indexOf("version") > 0)) {
				index = 1;
			}
			
			writeWatchPlayer(elems[index], fullPathPrefix, flashUrl[0]);
			return;
		}
	
		elems = document.getElementsByTagName("object");
	
		if (elems && elems.length > 0) {
			writeWatchPlayer(elems[0], fullPathPrefix, flashUrl[0]);
			return;
		}
	
		elems = document.getElementsByTagName("iframe");
	
		var iframes = [];
	
		for (i = 0; i < elems.length; i++) {
			iframes.push(elems[i]);
		}
	
		// Now try iframe, checking for youtube.com/embed/
		if (iframes.length > 0) {
			for (i = 0; i < iframes.length; i++) {
				if (iframes[i].src
						&& (iframes[i].src.indexOf("youtube.com/embed/") > 0)) {
					if (!iframes[i].id) {
						iframes[i].id = "__videoDest_" + i;
					}
	
					if (noMultipleVideos) {
						var errorDiv = document.createElement("div");
						errorDiv.style.cssText = "border: 1px; border-style: solid; text-align: center; position: relative";
						errorDiv.style.width = iframes[i].clientWidth + "px";
						errorDiv.style.height = iframes[i].clientHeight + "px";
						errorDiv.innerHTML = "Multiple Videos Not Supported Yet";
						//errorDiv.innerHTML = "<div style='position:absolute; top:50%; height:10em; margin-top:-5em'>"
						//		+ "<img src='archiveItUrl/static/images/logo_bw.png'/><br/>"
						//		+ "The original page contains a video here, "
						//		+ "but multiple inline videos per page are not yet supported<br/>"
						//		+ "<a target='_blank' href='videosUrl'>See All Captured Videos from this page.</a></div>";
	
						iframes[i].parentNode.replaceChild(errorDiv, iframes[i]);
					} else {
						writeWatchPlayer(iframes[i], fullPathPrefix, flashUrl[i]);
					}
				}
			}
		}
	}
	
	var writeWatchPlayer_old = function(player, fullPathPrefix, flashUrl) {
		var playerUrl = '/static/swf/player.swf';
		console.log(playerUrl);
		
		var fullWaybackUrl = encodeURIComponent(fullPathPrefix) + flashUrl;
		console.log(fullWaybackUrl);
	
		var width = "100%";
		var height = "100%";
		var playerId = player.id;
	
		if (player.clientHeight) {
			height = player.clientHeight;
		}
	
		if (player.clientWidth) {
			width = player.clientWidth;
		}
	
		var flashvars = {
			'file' : fullWaybackUrl,
			'autostart' : 'false',
			'type' : 'video'
		};
	
		var params = {
			'allowfullscreen' : 'true',
			'allowscriptaccess' : 'always',
			'bgcolor' : '#000000'
		};
	
		var attributes = {
			'id' : 'jwPlayer',
			'name' : 'jwPlayer'
		};
	}
};


