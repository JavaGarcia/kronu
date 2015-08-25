var dgram = require('dgram');

var udp_matchmaker = dgram.createSocket('udp4');
var udp_port = 6666;
var udp_HOST = "192.168.14.75"

var clients = {};

udp_matchmaker.on('listening', function() {
  var address = udp_matchmaker.address();
  console.log('# listening [%s:%s]', address.address, address.port);
});

udp_matchmaker.on('message', function(data, rinfo) {
  try
	
    data = JSON.parse(data);
  } catch (e) {
    return console.log('! Couldn\'t parse data (%s):\n%s', e, data);
  }
  if (data.type == 'register') {
	var current = data.linfo.name;
	//if new user, register it
	
	if(clients[current]== undefined){
		console.log("creando cliente")
		clients[current] = {
			name:current,
			tunnels:{}
		};
		console.log(clients[current])
	}
	//if exist old tunnel
	var tunel = rinfo.address+"_"+rinfo.port;
	if(clients[current].tunnels[tunel]!= undefined){
		console.log("tunel viejo")
		//look the remote port setting if is different by user and update connection
		
	}else{
		//register user:connection
		clients[current].tunnels[tunel] = {
				linfo:data.linfo,
				rinfo:rinfo
			};
		
		console.log('[  +  ] Client registered: %s@[%s:%s | %s:%s]', current,
					rinfo.address, rinfo.port, data.linfo.address, data.linfo.port);
		
		//create public port
		clients[current].tunnels[tunel].server = dgram.createSocket('udp4');
		clients[current].tunnels[tunel].server.on('listening', function () {
			var address =  clients[current].tunnels[tunel].server.address();
			console.log('['+clients[current].name+']'+' UDP Server listening on ' + address.address + ":" + address.port);
		});
		//catcher msj in
		clients[current].tunnels[tunel].server.on('message', function (message, remote) {		
			console.log('[> req] to: '+clients[current].name+" \tfrom:" +remote.address + ':' + remote.port +' - ' + message);
			console.log('[>> fw] to: '+clients[current].name+"@" +rinfo.address + ':' + rinfo.port +' - ' + message);
			send(rinfo.address,rinfo.port,{type:'fw',msj:message,requester:remote});

		});
		//problems
		clients[current].tunnels[tunel].server.on('error', function (err) {
			if(err.errno =='EADDRINUSE' && err.syscall=='bind' ){
				clients[current].tunnels[tunel].server.close();
				clients[current].tunnels[tunel] = undefined;

				send(rinfo.address,rinfo.port,{type:'e-ack',msj:'The remote port specified is busy!'});
			}
		
		});
		// validation remote port
		if(clients[current].tunnels[tunel].linfo.rport!=null&& typeof clients[current].tunnels[tunel].linfo.rport == "number"){
			
			if(clients[current].tunnels[tunel].linfo.rport<=65534&&clients[current].tunnels[tunel].linfo.rport>=7000){
				clients[current].tunnels[tunel].server.bind(clients[current].tunnels[tunel].linfo.rport,udp_HOST,function(){
					send(rinfo.address,rinfo.port,{type:'r-ack',msj:'udp://'+clients[current].tunnels[tunel].server.address().address+":"+clients[current].tunnels[tunel].server.address().port});
				});
			}else{
				send(rinfo.address,rinfo.port,{type:'e-ack',msj:'The remote port specified is outside the permitted range'});
			}
		}else{
			
			clients[current].tunnels[tunel].server.bind(function(){
					send(rinfo.address,rinfo.port,{type:'r-ack',msj:'udp://'+clients[current].tunnels[tunel].server.address().address+":"+clients[current].tunnels[tunel].server.address().port});
			});
		}
	}
	
    
  }
});

var send = function(host, port, msg, cb) {
	var data;
	data = new Buffer(JSON.stringify(msg));
	
	
  udp_matchmaker.send(data, 0, data.length, port, host, function(err, bytes) {
    if (err) {
      udp_matchmaker.close();
      console.log('# stopped due to error: %s', err);
    } else {
      //console.log('# sent '+msg.type);
      if (cb) cb();
    }
  });
}



udp_matchmaker.bind(udp_port);
