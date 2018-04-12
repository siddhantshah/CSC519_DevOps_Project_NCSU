var http = require('http');
var request = require('request');
var os = require('os');

var exec = require('child_process').exec;

// websocket server that website connects to.
var io = require('socket.io')(3000);

/// CHILDREN nodes
var nodeServers = 
[
	{url:"http://{{image1.droplet.ip_address}}:8080", latency: 0},
	{url:"http://{{image2.droplet.ip_address}}:8080", latency: 0},
	{url:"http://{{image3.droplet.ip_address}}:8080", latency: 0},
	{url:"http://{{image4.droplet.ip_address}}:8080", latency: 0},
	{url:"http://{{image5.droplet.ip_address}}:8080", latency: 0},
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

		console.log( error || res.statusCode, server.url);
		server.latency = Date.now()-startTime;
		console.log(server.latency);
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
		else if( latency > 20 )
		{
			color = "#cc0000";
		}
		else if( latency > 15 )
		{
			color = "#ffff00";
		}
		else if( latency > 10 )
		{
			color = "#cccc00";
		}
		else if( latency > 5 )
		{
			color = "#00cc00";
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
			name: "Your Computer", cpu: cpuAverage(), memoryLoad: memoryLoad()
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





