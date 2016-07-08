var wsServer = require("ws").Server, uid = "chufan.lai.1990@gmail.com";
var testClient = require('../vast2016MC3/testClient').initialize(), stream, timer;

function initialize (v_server, v_db, logger, v_test) {
	var streamServer = new wsServer({server: v_server}), messageHandler, Timeleft = 60;

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
							d.timeleft = Timeleft + " mins";
							streamServer.broadcast(JSON.stringify({state: "chooseID", data: d}));
							streamServer.startTimer(d);
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
				console.log("Data received from VC16");
				streamServer.saveData(message);
				streamServer.broadcast(JSON.stringify({state: "stream", data: message}));
			}
		}		
		v_ws.on('message', function incoming(message) {
			var t_message = JSON.parse(message), self = this;
			console.log('received: ' + t_message.data);
			switch(t_message.state){
				case "start":
				if(!stream){
					stream = testClient.newStream(messageHandler, v_test);
					if(v_test){
						v_db.clear(function(){
							console.log("Database reset!");
						});
					}
				}else{
					streamServer.queryHVAC(self);
					v_db.query("fixedprox", {}, function(v_data){
						streamServer.packData(v_data, "datetime");
						self.send(JSON.stringify({state: "history", data: {type: "fixedprox", data: v_data}}));
					});
					v_db.query("mobileprox", {}, function(v_data){
						streamServer.packData(v_data, "datetime");
						self.send(JSON.stringify({state: "history", data: {type: "mobileprox", data: v_data}}));
					});
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
						clearInterval(timer);
						Timeleft = 0;
					}else{
						self.send(JSON.stringify({state: "control", data: "ID chosen: " + streamServer.choice}));
					}
				break;
				case "close":
					self.close();
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
		var t_sheet, t_time;
		switch(v_data.type){
			case "fixed-prox":
				t_time = "datetime";
				t_sheet = "fixedprox";
			break;
			case "mobile-prox":
				t_time = "datetime";
				t_sheet = "mobileprox";
			default: 
				t_time = "Date/Time";
				t_sheet = "HVAC"
			break;
		}
		v_data[t_time] = new Date(v_data[t_time]).getTime();
		v_db.insert([v_data], t_sheet, function(){
			console.log("Data insert!");
		});
	}

	streamServer.startTimer = function(v_d){
		var self = this;
		self.IDList = v_d;
		timer = setInterval(function(){
			Timeleft = Timeleft - 5;
			self.IDList.timeleft = Timeleft + " mins";
			self.broadcast(JSON.stringify({state: "chooseID", data: self.IDList}));
		}, 300000);
	}

	streamServer.packData = function(v_data, v_time){
		var self = this;
		v_data.sort(function(a,b){
			return a[v_time] - b[v_time];
		});
		return v_data;
	}

	streamServer.queryHVAC = function(v_ws){
		var t_ready = [false, false, false, false, false], t_data = [], t_timer, tt_data,
		t_time = "Date/Time", pack = this.packData;
		t_timer = setInterval(function(){
			if(t_ready[0] && t_ready[1] && t_ready[2] && t_ready[3] && t_ready[4]){
				tt_data = {"sensor": t_data[0], "floor1": t_data[1], "floor2": t_data[2], "floor3": t_data[3], "general": t_data[4]};
				clearInterval(t_timer);
				v_ws.send(JSON.stringify({state: "history", data: {"type":"HVAC", "data":tt_data}}));
			}
		}, 1000);
		v_db.query("HVAC", {"type": "sensor"}, function(v_data){t_ready[0] = true; t_data[0] = pack(v_data, t_time);});
		v_db.query("HVAC", {"type": "bldg", "floor": 1}, function(v_data){t_ready[1] = true; t_data[1] = pack(v_data, t_time);});
		v_db.query("HVAC", {"type": "bldg", "floor": 2}, function(v_data){t_ready[2] = true; t_data[2] = pack(v_data, t_time);});
		v_db.query("HVAC", {"type": "bldg", "floor": 3}, function(v_data){t_ready[3] = true; t_data[3] = pack(v_data, t_time);});
		v_db.query("HVAC", {"type": "bldg", "floor": {$exists: false}}, function(v_data){t_ready[4] = true; t_data[4] = pack(v_data, t_time);});

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