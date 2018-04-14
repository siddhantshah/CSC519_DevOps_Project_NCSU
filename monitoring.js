var http = require('http');
var request = require('request');
var os = require('os');

var exec = require('child_process').exec;

// websocket server that website connects to.
var io = require('socket.io')(3000);


var nodeServers = 
[
	{url:"http://{{ hostvars['localhost']['image1_ipadd']}}:8080", latency: 0},
	{url:"http://{{ hostvars['localhost']['image2_ipadd']}}:8080", latency: 0},
	{url:"http://{{ hostvars['localhost']['image3_ipadd']}}:8080", latency: 0},
	{url:"http://{{ hostvars['localhost']['image4_ipadd']}}:8080", latency: 0},
	{url:"http://{{ hostvars['localhost']['image5_ipadd']}}:8080", latency: 0},
];


// Launch servers.
exec("node fastService.js");
exec("node mediumService.js");
exec("node slowService.js");


function measureLatenancy(server)
{
	var options = 
	{
		url: server.url
	};
	var startTime = Date.now();
	console.log("request to url");
	request(options, function (error, res, body) 
	{
		if(error) {
			server.latency = 1001;
		}
		else{
		console.log( error || res.statusCode, server.url);
		server.latency = Date.now()-startTime;
		console.log(server.latency);
	}
	});

	return server.latency;
}

function calculateColor()
{
	// latency scores of all nodes, mapped to colors.
	var nodes = nodeServers.map( measureLatenancy ).map( function(latency) 
	{
		var color = "#cccccc";
		if( !latency )
			return {color: color};
		if( latency > 1000 )
		{
			color = "#ff0000";
		}
		else 
		{
			color = "#00ff00";
		}
		console.log( latency );
		return {color: color};
	});
	//console.log( nodes );
	return nodes;
}


io.on('connection', function (socket) {
	console.log("Received connection");

	///////////////
	//// Broadcast heartbeat over websockets
	//////////////
	var heartbeatTimer = setInterval( function () 
	{
		var data = { 
			name: "iTrust2 Monitoring"
			,nodes: calculateColor()
		};
		console.log("interval", data)
		//io.sockets.emit('heartbeat', data );
		socket.emit("heartbeat", data);
	}, 5000);

	socket.on('disconnect', function () {
		console.log("closing connection")
    	clearInterval(heartbeatTimer);
  	});
});










