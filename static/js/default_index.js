var app = function(){
	var self = {};

	Vue.config.sileng = false;

	count = 0;

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    self.start = function(){
        self.switch_upload_flag();
    }

    // self.create_upload_url = function(){
    // 	count++;
    // 	self.upload_url = upload_url + "?" + $.param({ upload_id: count });
    // };

    self.switch_upload_flag = function(){
        self.vue.show_upload_form = !self.vue.show_upload_form;
    };

    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            show_upload_form: false
        },
        methods: {
            switch_upload_flag: self.switch_upload_flag
        }

    });


    self.start();
    $("#vue-div").show();


    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});