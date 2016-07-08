var Client = require("./client");

var uid = "chufan.lai.1990@gmail.com";

function initialize(){
	var testClient = {};
	testClient.newStream = function(messageHandler, v_test){
		return Client(uid, "vast2016.labworks.org:80", messageHandler, v_test);
	};

	return testClient;
};

exports.initialize = initialize;