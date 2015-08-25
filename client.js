var dgram = require('dgram');
var net = require('net');


var clientServer = {
		name : "dev",//generate random name or user name
		fport: 33333,
		rport: null // input - arg, remote port
	};
var ulink = {
		address: '192.168.14.75',
		port: 6666
};



var udp_in = dgram.createSocket('udp4');

var getNetworkIP = function(callback) {
  var socket = net.createConnection(80, ulink.address);
  socket.on('connect', function() {
    callback(undefined, socket.address().address);
      socket.end();
  });
  socket.on('error', function(e) {
	  console.log(e)
    //callback(e, 'error'); temporal
     callback(undefined, "192.168.14.75");
  });
}

var send = function(connection, msg, cb) {
	var data;
	if(connection.raw){
		data = new Buffer(msg.data);
	}else{
		data = new Buffer(JSON.stringify(msg));
	}

  udp_in.send(data, 0, data.length, connection.port, connection.address, function(err, bytes) {
    if (err) {
      udp_in.close();
      console.log('# stopped due to error: %s', err);
    } else {
      //console.log('# sent %s to %s:%s',data, connection.address, connection.port);
      if (cb) cb();
    }
  });
}

udp_in.on("listening", function() {
 
  getNetworkIP(function(error, ip) {
    if (error) return console.log("! Unable to obtain connection information!");
    clientServer.address=ip;
    clientServer.port=udp_in.address().port;
	console.log('# listening as %s@%s:%s', clientServer.name, clientServer.address, clientServer.port);
	console.log('[< reg]  Register')
    send(ulink, { type: 'register', linfo: clientServer});
  });
});
var connections = {};
//var client = dgram.createSocket('udp4');
udp_in.on('message', function(data, rinfo) {
	
	try {
		var other =data;
		data = JSON.parse(data);
		
		switch (data.type) {
			case 'r-ack':
				/*Response with the infomation about public service
				 *this is after of send to register connection by client, only if everything is Okay in the server*/
				console.log("[  +  ]  Enable tunnel "+data.msj);
				break;
			case 'fw':
				/* 
				 * re-send data to local server*/
				console.log("[>> fw]  from	"+data.requester.address+":"+data.requester.port+" \t>-fw-> \t"+rinfo.address+":"+rinfo.port)
				console.log("[> rfw]  to	"+clientServer.address+":"+clientServer.fport)
				var link = data.requester.address+"_"+data.requester.port;
				if(connections[link]==undefined){
					console.log("Creating new local connetion to: "+link)
					connections[link] 			= {};
					connections[link].address 	= data.requester.address;
					connections[link].port 		= data.requester.port;
					connections[link].client 	= dgram.createSocket('udp4');
					connections[link].uptime	= new Date();
					connections[link].client.on("listening", function() {
						console.log('listening conneciton 2');
					});
					connections[link].client.on('message', function(data2, rinfo) {
						connections[link].uptime = new Date();
						//option p2p
						if(rinfo.address!=clientServer.address && rinfo.port!=clientServer.fport){
							console.log("[ATTENTION] msj input original client")
							connections[link].client.send(data2, 0, data2.length, clientServer.fport, clientServer.address, function(err) {
								if(err)}{console.log(err)}								
							});
						}else{
							connections[link].client.send(data2, 0, data2.length, connections[link].port, connections[link].address, function(err) {
								if(err)}{console.log(err)}
							});
						}
					});
				}
			
				var message = new Buffer(data.msj);
				connections[link].client.send(message, 0, message.length, clientServer.fport, clientServer.address, function(err) {
					if(err){
						console.log("[  x  ]  "+err);
					}					
				});
				
				break;
			case 'e-ack':
				console.log("[  x  ]  Error: "+data.msj);
				udp_in.close();
				break;
       
		}
		
	} catch (e) {
		console.log('! Couldn\'t parse data(%s):\n%s', e, data);
		
	}
	
});


var doUntilAck = function(interval, fn) {
  if (client.ack) return;
  fn();
  setTimeout(function() {
    doUntilAck(interval, fn);
  }, interval);  
}

udp_in.bind();

