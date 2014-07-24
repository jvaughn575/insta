// this file defines the extra javascript
// functions needed to :
// * trigger a file browser 
// * send files to PHP on your webserver
// * post images to a facebook user's photostream

var access_token = "";

  window.fbAsyncInit = function() {
  FB.init({
    appId      : '343763025748711',
    cookie     : true,  // enable cookies to allow the server to access 
                        // the session
    xfbml      : true,  // parse social plugins on this page
    version    : 'v2.0' // use version 2.0
  });
  };

// Load the SDK asynchronously
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));


// this function is called by jquery
// when the document loads
$(document).ready(function(){
	// find an element with the id 'yada' and 
	// set up a function to call when that element gets 
	// clicked
	// yada is in 'index.html'
	// and we do this because mobile safari
	// has some restrictions about what we are allowed to trigger
	// programatically 
    $("#yada").click(function(){// when they click it
		fbLogin(function(){ // call fbLogin and tell it to call
	    	postToPHP(); // this when it is ready!
		});
    });
});

// login to facebook
// this calls the fb api method 'login'
// which will popup a fb login window 
function fbLogin(callback){
    
    FB.login(function(response){
	// Handle the response object, like in statusChangeCallback() in our demo
	// code.
	console.log("login result");
	console.log(response);
	callback();
	// -> scope means what we are allowed to do 
    }, {scope:'publish_actions'});
}


// grab image data from the canvas
// and send it to a PHP script
// which can save it to disk as an image
// since we can't write files directly from javascript...
function postToPHP(){
    // from http://www.re-cycledair.com/html-5-canvas-saving-to-a-file-with-php
    // pull image data from Processing's canvas
    var data = document.getElementById(getProcessingSketchId()).toDataURL();
	// send it to PHP
    $.post("upload.php", {
	imageData : data
    }, function(data) {
	// when we've sent it, pop up some messages
	console.log("Image sent to PHP... PHP responsed with : "+data);
	console.log("PHP upload responded: "+data);
	postToFB(data);
    });
}

// here we use the facebook api to 
// post an image to the current fb user's photo 
// stream (look on the photos page of your profile...)
function postToFB(img_url){
    console.log("trying to post image "+img_url);
    // make a call to the facebook graph api
    FB.api('/me/photos', 'post', // send to the user's photo set
	   { 
	       url: img_url, // the location of the photo
	       href: img_url, // and again...
	       message:'Image created with InstaSpam', 
	       //message: body 
	   }, function(response) {
	if (!response || response.error) {
	    console.log('Error occured posting to facebook '+img_url);
	} else {
	    console.log('Facebook post worked! Post ID: ' + response.id);
	}
    });

}    


// this function fires when the user selects a file.
// It uses a javascript FileReader object
// to read the file from the file system
// then it sends the data to Processing
// thanks: http://www.html5rocks.com/en/tutorials/file/dndfiles/
function fireOnFileSelect(evt){
    var f = evt.target.files[0]; // FileList object
    // Only process image files.
    if (!f.type.match('image.*')) {
	console.log("Not an image file, ignoring!");
	return;
    }
    var reader = new FileReader();
    
    // Closure to capture the file information.
    reader.onload = (function(theFile) {
        return function(e) {
	    var proc;
	    // get access to the Processing sketch as an addressable
	    // object called 'proc';
	    proc = Processing.getInstanceById(getProcessingSketchId());
	    // call a function in the Processing sketch:
	    // sending it the image data
	    proc.setImage(e.target.result);
	};
    })(f);
    
    // Read in the image file as a data URL.
    reader.readAsDataURL(f);
}

function setupFileListener(){
    document.getElementById('file').addEventListener('change', fireOnFileSelect, false);
}

function selectFile(){
    document.getElementById("file").click();
    console.log(document.getElementById("file"));
}


