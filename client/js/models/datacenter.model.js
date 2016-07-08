/**
 * Created by Chufan Lai at 2015/12/14
 * model for fetching and processing data
 */

 define([
    'require',
    'marionette',
    'underscore',
    'jquery',
    'backbone',
    'config',
    // 'collection',
    ], function(require, Mn, _, $, Backbone, Config){
        'use strict';

        return window.Datacenter = new (Backbone.Model.extend({
            defaults: function(){
                return {
                };
            },

            initialize: function(url){
                var self = this;
                var t_default = {
                    ready: false,
                };
                _.extend(this, t_default);
                // this.collection = new Collection();
                this.bindAll();
            },

            bindAll: function(){
                // this.listenTo(this.data, "Data__DataReady", this.updateData);
            },

            start: function(){
                this.trigger("DataCenter__initialized");
                // this.loadData(dataPath);
            },

            loadData: function(v_path){
                var self = this;
                // d3.csv(v_path, function(d){
                //     // Process Data
                // });
            },

            updateData: function(){
                console.info("DataCenter: data ready!");
                // this.collection.clearAll();
                // Update Data
            },

            initStream: function(v_stream){
                v_stream.onopen = function(e){
                    v_stream.send(JSON.stringify({state: "start", data: null}));
                };
                v_stream.onmessage = function (e){
                    var t_d = JSON.parse(e.data);
                    switch(t_d.state){
                        case "chooseID":
                            var tt_d = t_d.data;
                            console.log(tt_d.msg, tt_d.streamIds);
                            v_stream.send(JSON.stringify({state: "chooseID", data: tt_d.streamIds[0]}));
                        break;
                        default:
                            console.log(t_d.state, t_d.data);
                        break;
                    }
                };
                return v_stream;
            },
        }))();
    });
