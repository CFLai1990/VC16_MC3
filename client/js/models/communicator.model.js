/**
 * Created by llj on 15/11/15.
 */
define([
    'require',
    'marionette',
    'underscore',
    'jquery',
    'backbone', 
    'variables'
], function(require, Mn, _, $, Backbone, Variables) {
    'use strict';

    return window.Communicator = new (Backbone.Model.extend({
        defaults: {
        },

        initialize:function(url){
            var self = this;
            if(url === undefined)
            {
                self.wsUrl = 'ws://' + window.location.host + '/ws';
            }
            else
            {
                self.wsUrl = url;
            }
            self.ws = new WebSocket(self.wsUrl);
            self.ws_ok = $.Deferred();

            this.ws.onopen = function() {
                console.log('COMMUNICATOR: opened!');
                self.ws_ok.resolve();
            };

            this.ws.onmessage = function(evt) {
                var msg_received = JSON.parse(evt.data);
                console.log('COMMUNICATOR: message received: ' + msg_received.message + '!');
                self.handleMessage(msg_received);
            };

            this.ws.onclose = function() {
                console.log('COMMUNICATOR: closed!');
            };

            console.log('INIT: communicator created!');
        },
        _send:function(message, data){
            console.log("~~~~Hello, communicator!~~~~~");

            var msg_to_sent = JSON.stringify({
                message: message,
                data: data
            });

            var self = this;
            self.ws_ok.done(function() {
                console.log('COMMUNICATOR: message sent: ' + message + '!');
                self.ws.send(msg_to_sent);
            });
        },
        handleMessage: function (msg_received){
            var self = this;
            console.log("~~~handleMessage~~~");
            Variables.onMessage(msg_received);
        }
    }))();
});