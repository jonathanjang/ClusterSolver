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

    self.get_fields = function(){
        $.getJSON(get_fields_url, function(data){
            self.vue.fields = data.field_list;
        });
    }

    self.upload_button_clicked = function(){
        // possible unnecessary VVV
        self.change_page('settings');
        self.get_fields();
    };

    // self.parse_inputs = function(){
    //     fields = self.vue.fields;
    //     console.log(self.vue.fields.length);
    //     self.vue.checkboxes = []
    //     for(i = 0; i < fields.length; i++){
    //         self.vue.checkboxes.push('<input type="checkbox" id="'+ fields[i]  +'" value="' + fields[i] + '" v-model="checked_fields">');
    //         self.vue.checkboxes.push('<label for="' + fields[i] + '">' + fields[i] + '</label>');
    //     }
    //     console.log(self.vue.checkboxes);
    // };

    self.push_field = function(f){
        i = self.vue.checked_fields.indexOf(f)
        if (i == -1){
            self.vue.checked_fields.push(f);
        }else{
            self.vue.checked_fields.splice(i,1);
        }
    }

    self.continue_button_clicked = function(){
        self.change_page('cluster');
    }

    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            fields: [],
            page: 'upload',
            is_uploaded: false,
            checked_fields: [],
        },
        methods: {
            //get fields and change page are unnecessary
            get_upload_status: self.get_upload_status,
            upload_button_clicked: self.upload_button_clicked,
            push_field: self.push_field,
            continue_button_clicked: self.continue_button_clicked    
        }

    });


    $("#vue-div").show();


    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});