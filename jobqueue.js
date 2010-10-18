// Define a namespace
var zefer = zefer || {};

/*
 * Class JobQueue
 * 
 * Runs a queue of preload jobs
 */
zefer.JobQueue = function(name)
{
	
	var that = this;
	
	name === undefined ? that.name = "unnamed" : that.name = name;
	that.jobs = [];
	that.isStopped = false;
	
	that.eventListeners = {
		progress: [],
		complete: []
	};
	
	/*
	 * Constructor
	 */
	function createJobQueue(args)
	{
		console.log("Creating JobQueue instance: " + that.name);
		that.resetProgress();
	};
	
	/*
	 * --------------
	 * Public Methods
	 * --------------
	 */
	
	this.addJob = function( job )
	{
		that.jobs.push( job );
		that.resetProgress();
	};
	
	this.resetProgress = function()
	{
		that.totalJobs = that.jobs.length;
		that.completedJobs = 0;
		that.startTime = (new Date).getTime();
	};
	
	// run all the jobs in the preload queue
	this.next = function()
	{
		
		if(that.jobs.length == 0 && !that.isStopped)
		{
			console.log("JobQueue (" + that.name + "): Queue done (100%)");
			notifyListeners("complete", {});
			return;
		}
		
		// get the next job in the queue
		var job = that.jobs.shift();
		
		// log current progress
		jobProgress();
		
		if(that.isStopped)
		{
			// if the queue is stopped, the job will be null
			return;
		}
		
		// run the job method
		job.run.apply(window, [job.data,that]);
		
		that.completedJobs++;
	};
	
	// stop processing this queue
	this.stop = function()
	{
		console.log("JobQueue (" + that.name + "): stopped");
		
		//that.totalJobs = that.completedJobs;
		that.isStopped = true;
		
		that.jobs = [];
	};
	
	// add a method that will be called when a specific event happens
	this.addEventListener = function(eventName, method)
	{
		if( that.eventListeners[eventName] !== undefined )
		{
			that.eventListeners[eventName].push(method);
		}
	};
	
	/*
	 * ---------------
	 * Private Methods
	 * ---------------
	 */
	
	// this is run before each job is processed
	function jobProgress()
	{
		var timeTaken = (new Date).getTime() - that.startTime;
		var millisPerJob = timeTaken / that.completedJobs;
		
		var progress = {
			percentComplete: (that.completedJobs / that.totalJobs * 100).toFixed(1),
			timeTaken: timeTaken,
			etaSeconds: (millisPerJob * (that.totalJobs - that.completedJobs)) / 1000
		};
		
		// create a friendly eta description string
		if(progress.etaSeconds/60 > 60)
		{
			// over 60 minutes - output in hours
			progress.etaDescription = (progress.etaSeconds / 3600).toFixed(1) + " hours";
		}
		else if(progress.etaSeconds > 300)
		{
			// over 5 minutes - output in mins
			progress.etaDescription = (progress.etaSeconds / 60).toFixed(1) + " minutes";
		}
		else
		{
			// output in seconds
			progress.etaDescription = Math.round(progress.etaSeconds) + " seconds";
		}
		
		//console.log("JobQueue (" + that.name + "): Running job: " + (that.completedJobs+1) + "/" + that.totalJobs + " (" + percentComplete + "%)");
		
		notifyListeners("progress", progress);
	};
	
	function notifyListeners(eventName, data)
	{
		if( that.eventListeners[eventName] !== undefined )
		{
			for(var i=0; i<that.eventListeners[eventName].length; i++)
			{
				that.eventListeners[eventName][i].apply(window, [that,data]);
			}
		}
	}
	
	// call the constructor and return the new instance
	return createJobQueue();
};

/*
 * Class Job
 * 
 * Something to run, could be anything e.g. preload an image, make an ajax request. Add it to a JobQueue which will run it
 */
zefer.Job = function()
{
	
	var that = this;
	
	that.data = {};
	
	/*
	 * Constructor
	 */
	function createJob(args)
	{
	};
	
	/*
	 * --------------
	 * Public Methods
	 * --------------
	 */
	
	// override this method with something that does the job required
	this.run = function(data)
	{
		
	};
	
	// sets data that the job may use
	this.setData = function(data)
	{
		that.data = data;
	};
	
	// call the constructor and return the new instance
	return createJob(Array.prototype.slice.call(arguments));
};
