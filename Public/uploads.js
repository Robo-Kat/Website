document.addEventListener('DOMContentLoaded',()=>{
var input = document.getElementById('upload-input');

document.getElementById('upload-button').addEventListener('click',()=>{
	input.click();
});

input.addEventListener('change',()=>{
	if(input.files.length>0){
		var formData = new FormData();
		for (var i = 0; i < files.length; i++) {
      		formData.append('uploads[]', files[i], files[i].name);
      	}
	}
});



},{once:true});