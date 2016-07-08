var wsServer = require("ws").Server, uid = "chufan.lai.1990@gmail.com";
var testClient = require('../vast2016MC3/testClient').initialize(), stream;

function initialize (v_server, v_db, logger, v_test) {
	var streamServer = new wsServer({server: v_server}), messageHandler;

	streamServer.on('connection', function connection(v_ws) {
		messageHandler = function(vv_ws, message, state) {
			if(!streamServer.upWS){
				streamServer.upWS = vv_ws;
			}
			if(message.type === "control"){// control message from the server
				switch(state){
					case "message":
					message.body.forEach(function(d) {
						if(d.state === "GOOD" && d.streamIds){// control message for selecting a stream to add
							logger.log("streamIDs: " + d);
							streamServer.broadcast(JSON.stringify({state: "chooseID", data: d}));
						}else if(d.state === "BAD"){// Uh oh - handle the error
							logger.log("error: " + d);
							streamServer.broadcast(JSON.stringify({state: "error", data: d}));
						}
					});
					break;
					default:
						logger.log(state + ": " + message.body);
						streamServer.broadcast(JSON.stringify({state: "control", data: message.body}));
					break;
				}
			}else{// data message
				logger.log("Data received from VC16");
				streamServer.saveData(message);
				streamServer.broadcast(JSON.stringify({state: "data", data: message}));
			}
		}		
		v_ws.on('message', function incoming(message) {
			var t_message = JSON.parse(message), self = this;
			logger.log('received: ' + t_message.data);
			switch(t_message.state){
				case "start":
				if(!stream){
					stream = testClient.newStream(messageHandler, v_test);
					if(v_test){
						v_db.clear(function(){
							logger.log("Database reset!");
						});
					}
				}
				break;
				case "chooseID":
					if(!streamServer.choice){
						logger.log("Choose: " + t_message.data);
						streamServer.choice = t_message.data;
						streamServer.upWS.send(JSON.stringify({
							uid: uid,
							streamId: t_message.data,
						}));
						streamServer.broadcast(JSON.stringify({state: "control", data: "ID chosen: " + t_message.data}));
					}else{
						self.send(JSON.stringify({state: "control", data: "ID chosen: " + streamServer.choice}));
					}
				break;
				case "end":
				break;
			}
		});
	});

	streamServer.broadcast = function(v_data){
		streamServer.clients.forEach(function(v_client){
			v_client.send(v_data);
		})
	};

	streamServer.saveData = function(v_data){
		v_db.insert([v_data], "HVAC", function(){
			logger.log("Data insert!");
		});
	}
	// streamServer.waitForChoice = function(v_ws){
	// 	var self = this;
	// 	var t_timer = setInterval(function(){
	// 		if(self.choice){
	// 			clearInterval(t_timer);
	// 			streamServer.upWS.send(JSON.stringify({
	// 				uid: uid,
	// 				streamId: self.choice,
	// 			}));
	// 			streamServer.broadcast(JSON.stringify({state: }))
	// 		}
	// 	}, 1000);
	// };
	return streamServer;
}

exports.initialize = initialize;