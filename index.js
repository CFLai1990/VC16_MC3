var root = __dirname, glbTest = false;
var database = require("./server/database/database.js"), logger = require("./server/logger.js").initialize();
database.initialize(logger);
var handle = require("./server/handler/handler").initialize(root, database, logger);
var router = require("./server/router/router").initialize(handle, logger);
var server = require("./server/server").initialize(router);
var streamServer = require("./server/stream/stream").initialize(server, database, logger, glbTest);