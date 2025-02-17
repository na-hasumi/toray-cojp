	(function(){
		var efmovietimer2,
				$mov = $('#movEffect'),
				$btn = $(".movBtn",$mov),
				$set = $(".movSet",$mov),
				$start = $(".movStart",$mov);

		//tec_002.html
		if($btn.length){
			setMovie2();
		}

		function setMovie2(){
			$btn.bind('click',function(){
				$btn.unbind('click');
				clearTimeout(efmovietimer2);
				$set.hide();
				$start.show();
				
				// var userAgent = navigator.userAgent.toLowerCase();
				// if (userAgent.indexOf('msie') != -1) {
				// 	efmovietimer2 = setTimeout(movieEnd2,15000);
				// }else{
				//	efmovietimer2 = setTimeout(movieEnd2,6000);
				// }
				efmovietimer2 = setTimeout(movieEnd2,6000);
				$(this).find("a").css("background-position","0 100%");
				return false;
			})
		}

		function movieEnd2(){
			clearTimeout(efmovietimer2);
			var imgObj = new Image()
			imgObj.src = "images/002_start.gif?"+ new Date().getTime();
			$(imgObj).bind('load',function(){
				$start.html($(imgObj));
				$btn.find("a").css("background-position","0 0");
				$set.show();
				$start.hide();
				setMovie2();
			});
		}
	})();