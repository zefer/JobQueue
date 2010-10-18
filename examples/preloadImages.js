$(document).ready(function()
{
	example.getSomePhotosFromFlickr();
});

var example = {
	flickrPhotoData: []
};

// do the example (this fires when we have the sample image data from Flickr)
example.start = function()
{
	example.createJobs();
	example.processJobQueue();
}

// preload an image - this method is the 'Job' that the 'JobQueue' will run
example.imagePreloadJob = function(args,queue)
{
	var that = this;
	
	var img = new Image();
	
	img.onload = function(){
		queue.next();
	};
	img.onerror = function(){
		alert('ERROR preloading image <a href="' + img.src + '">' + img.src + '</a>');
		queue.next();
	};
	img.onabort = function(){
		alert('preloading ABORTED on image <a href="' + img.src + '">' + img.src + '</a>');
	};
	
	img.src = magsoft.connector.getAPIURL("image.getImage", o, magsoft.defaultResponseFormat);
	
};

example.createJobs = function()
{
	var queue = new zefer.JobQueue("myPhotoQueue");
	
	for(var i=0; i<example.flickrPhotoData.length; i++)
	{
		var job = new zefer.Job();
		
		// build the url for the flickr image
		var url = "http://farm{$farm}.static.flickr.com/{$server}/{$id}_{$secret}.jpg";
		url = url.replace("{$farm}", example.flickrPhotoData[i].farm);
		url = url.replace("{$server}", example.flickrPhotoData[i].server);
		url = url.replace("{$id}", example.flickrPhotoData[i].id);
		url = url.replace("{$secret}", example.flickrPhotoData[i].secret);
		
		// this data is available to the job, when it runs
		job.setData({
			url: url
		});
		
		// define what happens when the job is run (use a closure to bind it to 'that')
		job.run = function(args,queue){
			example.imagePreloadJob.apply(job, [args,queue]);
		};
		
		// queue-up the job
		queue.addJob(job);
	}
}

example.processJobQueue = function()
{
	
}

example.getSomePhotosFromFlickr = function()
{
	// get some photos from flickr, using YQL
	var req = $.ajax({
		url: "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20flickr.photos.search%20where%20text%3D%22Monkey%22%20limit%2010&format=json",
		dataType: "jsonp",
		success: function(data, textStatus, XMLHttpRequest) {
			example.flickrPhotoData = data.query.results.photo;
			example.start();
		},
		error: function(XMLHttpRequest, textStatus, errorThrown)
		{
			alert("problem making yql ajax request");
		}
	});
}