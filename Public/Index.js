HTMLCollection.prototype.forEach = Array.prototype.forEach;


document.addEventListener('DOMContentLoaded',()=>{

	function toggleHidden() {
		if(this.classList.contains("-hidden")) {
			this.classList.remove("-hidden");
			this.nextElementSibling.style.height = this.nextElementSibling.scrollHeight+'px';
		}
		else {
			this.classList.add("-hidden");
			this.nextElementSibling.style.height = "0px";
		}
	}

	document.getElementsByClassName("nav-menu-dropdown-toggle").forEach(function(button) {
		button.addEventListener("click",toggleHidden);
	})

	document.getElementsByClassName('nav-menu-link').forEach((link)=>{
		link.onclick = (event)=>{
			if(event.ctrlKey||event.shiftKey) {return true;}
			var href = link.href;
			var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function(){
				if(this.readyState==4&&this.status==200) {
					window.history.pushState({},'',href);
					parser=new DOMParser();
					newdocument=parser.parseFromString(this.response, "text/html");

					Array.from(document.head.children).filter(k=>(!k.className||k.className!=='index'))
						.forEach(k=>{k.remove();});
					var i = 0;
					while ( i < newdocument.head.children.length) {
						k = newdocument.head.children[i];
						console.log('first: ',k)
						if(k.className && k.className=='index') {
							i++;
							continue;
						};
						console.log('second: ',k)
						if(k.tagName==="SCRIPT") {
							console.log(k);
							var newScript = document.createElement('script');
							//newScript.async=false;
							newScript.setAttribute('src',k.src);
							document.head.prepend(newScript);
							i++;
						}
						else {
							document.head.prepend(k);
						}
					}

					document.getElementsByClassName('super')[0].innerHTML = newdocument.getElementsByClassName('super')[0].innerHTML;
					document.dispatchEvent(new Event('SoftLoad'));
					delete parser;
				}
			};
			xhttp.open('GET',href);
			xhttp.send();
			event.preventDefault();
		};
	});


	


},{once:true}); //End On Document Load Event


document.ready = function(cb) {
		if (document.readyState=='complete'||document.readyState=='interactive') {
			cb();
			return;
		}
		function ready() {
			document.removeEventListener('SoftLoad',ready);
			document.removeEventListener('DOMContentLoaded',ready);
			cb();
		}
		document.addEventListener('DOMContentLoaded',ready);
		document.addEventListener('SoftLoad',ready);
	}