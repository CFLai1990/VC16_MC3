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
    'd3',
    // 'collection',
    ], function(require, Mn, _, $, Backbone, Config, d3){
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
                    chooseID: false,
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

            initStream: function(){
                var self = this, v_stream = new WebSocket('ws://192.168.10.9:8888');
                v_stream.onopen = function(e){
                    v_stream.send(JSON.stringify({state: "start", data: null}));
                };
                v_stream.onclose = function(e){
                    console.log("Connection closed!");
                }
                v_stream.onmessage = function (e){
                    var t_d = JSON.parse(e.data);
                    switch(t_d.state){
                        case "stream":
                            console.log(t_d.state, t_d.data);
                        break;
                        case "history":
                            console.log(t_d.state, t_d.data);
                            if(t_d.data.type == "IDList" && t_d.data.data["streamIds"]){
                                self.showList(t_d.data.data, this);
                            }
                        break;
                        case "control":
                            console.log(t_d.state, t_d.data);
                            if(t_d.data.indexOf("ID chosen") >=0){
                                var t_id = t_d.data.split(":"); t_id = t_id[1];
                                $("#IDList #choice").text("Chosen: " + t_id + ".");
                            }
                        break;
                        case "chooseID":
                            var tt_d = t_d.data;
                            console.log(tt_d.msg, tt_d.streamIds, tt_d.timeleft);
                            self.showList(tt_d, this);
                            // v_stream.send(JSON.stringify({state: "chooseID", data: tt_d.streamIds[0]}));
                        break;
                        case "error":
                            console.log(t_d.state, t_d.data);
                        break;
                        default:
                            console.log(t_d.state, t_d.data);
                        break;
                    }
                };
                return v_stream;
            },

            showList: function(v_list, v_stream){
                $("#IDList #time")
                .text(v_list.timeleft);
                if(!this.chooseID){
                    $("#IDList #message").text(v_list.msg);
                    var t_ul = d3.select("#IDList #list")
                    .append("ul");
                    t_ul
                    .selectAll(".id")
                    .data(v_list.streamIds)
                    .enter()
                    .append("li")
                    .classed("id", true)
                    .text(function(d){
                        return d;
                    });
                    this.bindInteractions(v_stream);
                    this.chooseID = true;
                }
                if(v_list.choice){
                    $("#IDList #choice").text("Chosen: " + v_list.choice + ".");
                }else{
                    $("#IDList #choice").text("Nothing chosen.");
                }
            },

            bindInteractions: function(v_stream){
                d3.selectAll("#IDList .id")
                .on("click", function(t_d){
                    $("#confirmModal .modal-body p").text("Are you sure to choose the ID " + t_d + " ?");
                    $("#confirmModal").modal();
                    d3.select("#confirmChoice")
                    .on("click", function(){
                        console.log("choose " + t_d);
                        v_stream.send(JSON.stringify({state: "chooseID", data: t_d}));
                    });
                });
            },
        }))();
    });
