$(document).ready(function()
{
	example.log("searching for some random photos from Flickr using YQL...");
	example.getSomePhotosFromFlickr();
});

var example = {
	flickrPhotoData: []
};

// do the example (this fires when we have the sample image data from Flickr)
example.start = function()
{
	// create a new queue, with a name
	var jobQueue = new zefer.JobQueue("myPhotoQueue");
	
	// add some jobs to the queue
	example.createAndQueueJobs(jobQueue);
	
	example.log("queued-up " + jobQueue.jobs.length + " jobs. Each job is a single image, which will be preloaded in the background.");
	
	// listen to the queue progress event, so we can display the progress
	jobQueue.addEventListener("progress", example.queueProgress);
	jobQueue.addEventListener("complete", example.queueComplete);
	
	example.log("processing queue...");
	
	// start processing the queue
	jobQueue.next();
}

// listen to queue progress
example.queueProgress = function(queue, progressData)
{
	$("#progress").html("");
	$("#progress").append($("<div>").html("etaDescription: " + progressData.etaDescription));
	$("#progress").append($("<div>").html("etaSeconds: " + progressData.etaSeconds));
	$("#progress").append($("<div>").html("percentComplete: " + progressData.percentComplete));
	$("#progress").append($("<div>").html("timeTaken: " + progressData.timeTaken));
};
example.queueComplete = function(queue)
{
	$("#progress").html("Queue complete");
};

example.log = function(s)
{
	$("#log").append(s + "<br>");
}

// preload an image - this method is the 'Job' that the 'JobQueue' will run
example.imagePreloadJob = function(data,queue)
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
	
	img.src = data.url;
	
};

example.createAndQueueJobs = function(jobQueue)
{
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
		jobQueue.addJob(job);
	}
}

example.processJobQueue = function(jobQueue)
{
	jobQueue.next();
}

example.getSomePhotosFromFlickr = function()
{
	// get some photos from flickr, using YQL
	var req = $.ajax({
		url: "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20flickr.photos.search%20where%20text%3D%22jungle%22%20limit%2010&format=json",
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