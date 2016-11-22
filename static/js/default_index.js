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
        self.check_logged_in();
    }

    self.check_logged_in = function(){
        $.getJSON(check_login_url, function(data){
            self.vue.logged_in = data.logged_in;
        })
    };

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
            self.vue.f_index = data.f_index;
        });
    }

    self.upload_button_clicked = function(){
        self.change_page('settings');
        //FIXME: take this out when submitting/demo
        self.vue.x_lower = "0";
        self.vue.x_upper = "20";
        self.vue.y_lower = "0";
        self.vue.y_upper = "20";
        self.get_fields();
    };

    self.push_field = function(f){
        i = self.vue.checked_fields.indexOf(f)
        if (i == -1){
            self.vue.checked_fields.push(f);
        }else{
            self.vue.checked_fields.splice(i,1);
        }
    };

    self.continue_button_clicked = function(){
        if (self.vue.checked_fields.length > 1){
            self.vue.is_error = true
            self.vue.err_message = "You have selected too many fields, please choose one";
        }else if (isNaN(parseInt(self.vue.input_k))){
            self.vue.is_error = true
            self.vue.err_message = "Please put in a number for # of clusters";
        }else if (isNaN(parseInt(self.vue.x_lower))){
            self.vue.is_error = true
            self.vue.err_message = "Please put in a number for the lower bound of X";
        }else if (isNaN(parseInt(self.vue.x_upper))){
            self.vue.is_error = true
            self.vue.err_message = "Please put in a number for the upper bound of X";
        }else if (isNaN(parseInt(self.vue.y_lower))){
            self.vue.is_error = true
            self.vue.err_message = "Please put in a number for the lower bound of Y";
        }else if (isNaN(parseInt(self.vue.y_upper))){
            self.vue.is_error = true
            self.vue.err_message = "Please put in a number for the upper bound of Y";    
        }else if (isNaN(parseInt(self.vue.num_iters))){
            self.vue.is_error = true
            self.vue.err_message = "Please put in a number for the # of iterations";    
        }else{
            self.vue.is_error = false;
            self.start_clustering();
            self.change_page('clustering');
        }
    };

    self.start_clustering = function(){
        $.post(start_clustering_url, 
              {
                  checked_fields: self.vue.checked_fields,
                  input_k: self.vue.input_k,
                  x_lower: self.vue.x_lower,
                  x_upper: self.vue.x_upper,
                  y_lower: self.vue.y_lower,
                  y_upper: self.vue.y_upper,
                  num_iters: self.vue.num_iters
              },
              function(data){
                  self.vue.points = data.points;
                  self.vue.points_data = data.values;
                  self.vue.labels = data.labels;
                  self.vue.cluster_centers = data.cluster_centers;
                  self.set_gchart();
              });
    };

    // need to set colors and need to set toolbar
    self.set_gchart = function(){
        // Initialize a graph for google chart.
        var container = document.getElementById('chart_div');
        container.style.display = 'block';

        google.charts.load('current', {'packages':['corechart']});
        google.charts.setOnLoadCallback(drawChart());
        function drawChart() {

            var data = new google.visualization.DataTable();
            data.addColumn('number', 'X');
            data.addColumn('number', 'Y');
            data.addColumn({type: 'string', role: 'tooltip'});
            data.addColumn( {type: 'string', role: 'style'} );    

            plot = parse_points();

            data.addRows(plot)

            var options = {
                title: 'Results' , //FIXME: add name of the file
                hAxis: {title: 'X', minValue: parseInt(self.vue.x_lower), maxValue: parseInt(self.vue.x_upper)},
                vAxis: {title: 'Y', minValue: parseInt(self.vue.y_lower), maxValue: parseInt(self.vue.y_upper)},
                legend: 'none',
                tooltip: {isHTML: true}
            };

            var chart = new google.visualization.ScatterChart(document.getElementById('chart_div'));
            
            google.visualization.events.addListener(chart, 'ready', function () {
                container.style.display = 'none';
            });

            chart.draw(data, options);
        }

        // Create a chart with given data

        // Make the chart object visible
        $('#chart_div').show();
    };

    // adapted partly by: 
    // http://stackoverflow.com/questions/31380320/change-point-colour-based-on-value-for-google-scatter-chart
    function parse_points(){
        // get random colors for each cluster/label
        colors = []
        labels = self.vue.labels
        for(var i = 0; i < labels.length; i++){
            colors.push(getRandomColor());
        }

        // begin pushing data points onto a list
        plot = []
        points = self.vue.points;
        for(var i = 0; i < points.length; i++){
            line = convert_dict_to_string(self.vue.points_data[i], labels[i]);
            plot.push([points[i][0], points[i][1], line, 'point { fill-color:'+colors[labels[i]]+'}']);
        }

        // push the cluster centers onto a list
        for(var i = 0; i < self.vue.cluster_centers.length; i++){
            // line = convert_dict_to_string(self.vue.cluster_centers[i]);
            line = "Cluster Center for label: " + i;
            plot.push([self.vue.cluster_centers[i][0], 
                       self.vue.cluster_centers[i][1], 
                       line, 
                       'point { fill-color:'+colors[i]+'}']);

        }
        return plot;
    }


    function convert_dict_to_string(dict, label){
        line = "Cluster #" + label + ": \nValue: ";
        for(var i = 0; i < self.vue.fields.length; i++){
            line += self.vue.fields[i] + "=" + dict[self.vue.fields[i]] + " ";
        }
        return line;
    }

    // taken from: 
    // http://stackoverflow.com/questions/31380320/change-point-colour-based-on-value-for-google-scatter-chart
    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            logged_in: false,
            fields: [],
            page: 'upload',
            is_uploaded: false,
            checked_fields: [],
            input_k: "8",
            x_lower: "",
            x_upper: "",
            y_lower: "",
            y_upper: "",
            num_iters: "300",
            err_message: "",
            is_error: false,
            new_data: [],
            f_index: [],
            points: [],
            points_data: [],
            labels: [],
            cluster_centers: []
        },
        methods: {
            get_upload_status: self.get_upload_status,
            upload_button_clicked: self.upload_button_clicked,
            push_field: self.push_field,
            continue_button_clicked: self.continue_button_clicked,
        }

    });

    self.start();
    $("#vue-div").show();
    $("#chart_div").hide();


    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});