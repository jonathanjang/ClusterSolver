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

    //possibly unecessary 
    self.start = function(){
        self.vue.page = 'upload';
    }


    self.change_page = function(page_name){
        self.vue.page = page_name;
        return true 
    };

    // FIXME: when the upload btn is pressed, page is changed even if 
    // a form has not been uploaded
    self.get_upload_status = function(){
        status = 0;
        $.getJSON(upload_status_url, function(data){
            status = data.upload_status;
        })
        console.log(status) == 1;
        return (status == 1)
    };

    self.upload_button_clicked = function(){
        // possible unnecessary VVV
        self.vue.is_btn_clicked = !self.vue.is_btn_clicked;
        self.change_page('settings');        
    };

    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            page: 'upload',
            is_btn_clicked: false,
            is_uploaded: false,
        },
        methods: {
            change_page: self.change_page,
            get_upload_status: self.get_upload_status,
            upload_button_clicked: self.upload_button_clicked
        }

    });


    $("#vue-div").show();


    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});