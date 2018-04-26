document.ready(()=>{

{
	var BGs = document.getElementsByClassName("super-bg"),
	Super = document.getElementsByClassName("super")[0],
	prevBG = 0;
	scollListener = document.addEventListener('scroll',()=>{
		var activeBG = ~~(document.body.scrollTop/(Super.scrollHeight/BGs.length));
		if(activeBG !==prevBG) {
			BGs[activeBG].style.opacity = 1;
			BGs[prevBG].style.opacity = 0;
			prevBG = activeBG;
			console.log(activeBG);
		}
	})

}
document.addEventListener('SoftLoad',()=>{
	document.removeEventListener('scroll',scollListener);
},{once:true});
},{once:true});