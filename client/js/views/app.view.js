/**
 * Created by aji on 15/7/13.
 */
define([
    'require',
    'marionette',
    'underscore',
    'jquery',
    'backbone',
    'datacenter',
    'config',
    'text!templates/app.tpl'
], function(require, Mn, _, $, Backbone, Datacenter, Config,
            Tpl) {
    'use strict';

    return Mn.LayoutView.extend({

        tagName: 'div',

        template: _.template(Tpl),

        attributes:{
            'style' : 'width: 100%; height: 100%;'
        },

        regions:{
            // "childView":"#childView",
        },

        initialize: function (options) {
            var self = this;
            options = options || {};
            _.extend(this, options);
            this.bindAll();
        },

        showChildViews: function(){
            var self = this;
            // self.childView = new LayoutView();
            // self.showChildView("vpMap", self.vpMap);
            console.info("LayoutView: child views ready!");
            if(!self.ready){
                self.ready = true;
                self.bindInteractions();
            }
        },

        onShow: function(){
            var self = this;
            $(document).ready(function(){
                console.info('LayoutView: document ready!');
                self.getLayoutParameters();
                Datacenter.start();
            });
        },

        bindAll: function(){
            this.listenTo(Datacenter, "DataCenter__initialized", this.showChildViews);
        },

        bindInteractions: function(){
            var self = this;
            $(".dataLoader").on("click",function(){
                var t_id = $(this).attr("id");
                switch(t_id){
                    case "StreamOpen":
                    var t_stream = Config.get("stream");
                    if(!t_stream){
                        t_stream = Datacenter.initStream();
                        Config.set("stream", t_stream);
                    }
                    break;
                    case "StreamClose":
                    var t_stream = Config.get("stream");
                    if(t_stream){
                        t_stream.send(JSON.stringify({state: "close", data: null}));
                        Config.set("stream", null);
                    }
                    break;
                    default:
                    break;
                }
            });
        },

        getLayoutParameters: function(){
            var self = this;
            // this.updateView("#childView", childViewOptions);
        },

        updateView: function(v_region, v_layout){
            $(v_region)
            .css("top",v_layout.top)
            .css("left",v_layout.left)
            .css("width",v_layout.width)
            .css("height",v_layout.height);
        },
    });
});
