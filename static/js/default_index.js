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
        self.vue.page = 'upload';
        console.log(self.vue.page)
    }

    // self.create_upload_url = function(){
    // 	count++;
    // 	self.upload_url = upload_url + "?" + $.param({ upload_id: count });
    // };

    self.switch_upload_flag = function(){
        self.vue.show_upload_form = !self.vue.show_upload_form;
    };

    self.change_page = function(page_name){
        console.log('out here in change_page', page_name)
        console.log("printing self.vue.page", self.vue.page)
        self.vue.page = page_name;
        console.log("page has been changed to: ", self.vue.page);
        return true 
    };

    self.check_page = function(){
        return self.vue.page;
    };

    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            show_upload_form: false,
            page: 'upload'
        },
        methods: {
            switch_upload_flag: self.switch_upload_flag,
            change_page: self.change_page,
            check_page: self.check_page,
        }

    });


    $("#vue-div").show();


    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});