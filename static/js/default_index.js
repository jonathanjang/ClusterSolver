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

    self.home_upload_btn_clicked = function(){
        self.vue.home_upload_btn = !self.vue.home_upload_btn;
    };


    self.start = function(){
        self.vue.page = 'home';
        self.check_logged_in();
        self.get_graphs();
    }

    self.check_logged_in = function(){
        $.getJSON(check_login_url, function(data){
            self.vue.logged_in = data.logged_in;
        })
    };

    self.change_page = function(page_name){
        self.vue.page = page_name;
    };

    function create_graphs_url(start_i, end_i){
        var pp = {
            start_i: start_i,
            end_i: end_i
        };
        return get_graphs_url + '?' + $.param(pp); 
    }

    self.get_graphs = function(){
        console.log("hello");
        $.getJSON(create_graphs_url(0,5), function(data){
            console.log(data);
            self.vue.news_feed_chart_plots = data.chart_plot_list;
            self.vue.news_feed_chart_options = data.chart_options_list;
        })
    }

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
                  self.vue.file_name = data.file_name;
                  self.set_gchart([], {});
              });
    };

    self.set_gchart = function(plot, options){
        // Initialize a graph for google chart.
        var container = document.getElementById('chart_div_1');
        container.style.display = 'block';

        google.charts.load('current', {'packages':['corechart']});
        google.charts.setOnLoadCallback(drawChart(plot, options));
        function drawChart(passed_in_plot, passed_in_options) {

            var data = new google.visualization.DataTable();
            data.addColumn('number', 'X');
            data.addColumn('number', 'Y');
            data.addColumn({type: 'string', role: 'tooltip'});
            data.addColumn( {type: 'string', role: 'style'} );    

            var plot = [];
            if (passed_in_plot.length == 0){
                plot = parse_points();
            }else{
                plot = passed_in_plot;
            }

            data.addRows(plot)

            var options = {};
            if (Object.keys(passed_in_options).length == 0){
                options = {
                    title: 'Results of ' + self.vue.file_name ,
                    hAxis: {title: 'X', minValue: parseInt(self.vue.x_lower), maxValue: parseInt(self.vue.x_upper)},
                    vAxis: {title: 'Y', minValue: parseInt(self.vue.y_lower), maxValue: parseInt(self.vue.y_upper)},
                    legend: 'none',
                    tooltip: {isHTML: true}
                };
            }else{
                options = passed_in_options;
            }

            var chart = new google.visualization.ScatterChart(document.getElementById('chart_div_1'));
            
            google.visualization.events.addListener(chart, 'ready', function () {
                container.style.display = 'none';
            });

            chart.draw(data, options);


            self.vue.chart_plot = plot;
            self.vue.chart_options = options;
        }

        // Make the chart object visible
        $('#chart_div_1').show();
    };

    // Outline for this method:
    // 1. check to see if the new selected field value is equal to anything else
    // 2. take the closest one, and find its center
    // 3. using its center, plot a new point
    // 4. start appending to lists
    self.insert_point = function(){
        $('#chart_div_1').hide();

        // find the point that is most similar to the newly inserted one
        point_i = index_of_closest_point(self.vue.checked_fields[0],
                                          self.vue.new_data,
                                          self.vue.points_data);


        // get the closest center
        center = get_closest_center(self.vue.points[point_i], self.vue.cluster_centers);
        center_i = center[2];

        // then assign a point to it
        new_points = create_new_points(center);

        new_entry_dict = create_new_entry_dict(self.vue.fields, self.vue.new_data);

        // create a string for the tooltip
        line = "NEWLY INSERTED VALUE\n";
        line += convert_dict_to_string(new_entry_dict, center_i);

        // now add it to the plot!
        self.vue.chart_plot.push([new_points[0], new_points[1], line, 'point { fill-color:'+self.vue.colors[center_i]+'}']);

        self.set_gchart(self.vue.chart_plot, self.vue.chart_options);
        self.vue.new_data = {};

        console.log(x_new);
        console.log(y_new);
    };

    // self.reset_gchart = function(){
    //     // Initialize a graph for google chart.
    //     var container = document.getElementById('chart_div');
    //     container.style.display = 'block';

    //     google.charts.load('current', {'packages':['corechart']});
    //     google.charts.setOnLoadCallback(drawChart());
    //     function drawChart() {

    //         var data = new google.visualization.DataTable();
    //         data.addColumn('number', 'X');
    //         data.addColumn('number', 'Y');
    //         data.addColumn({type: 'string', role: 'tooltip'});
    //         data.addColumn( {type: 'string', role: 'style'} );    

    //         var plot = self.vue.chart_plot;

    //         data.addRows(plot)

    //         var options = self.vue.chart_options;

    //         var chart = new google.visualization.ScatterChart(document.getElementById('chart_div'));
            
    //         google.visualization.events.addListener(chart, 'ready', function () {
    //             container.style.display = 'none';
    //         });

    //         chart.draw(data, options);


    //         // self.vue.chart_plot = plot;
    //         // self.vue.chart_options = options;
    //     }

    //     // Make the chart object visible
    //     $('#chart_div').show();
    // };

    self.add_to_profile = function(){
        $.post(add_to_profile_url, {
            chart_plot: JSON.stringify(self.vue.chart_plot),
            chart_options: JSON.stringify(self.vue.chart_options)
        });
        self.change_page('profile');
        $('#chart_div_1').hide();

    };

    self.view_plot = function(){
        console.log("inside view_plot");
    };


    //Helper functions:

    //FIXME: there may be a point where you want to start a new cluster!
    function index_of_closest_point(selected_field, new_data, points_data){
        // selected_field = self.vue.checked_fields[0];
        new_inserted_code = convert_to_ASCII(new_data[selected_field]);
        point_i = -1;
        difference = 999999;
        for(var i = 0; i < points_data.length; i++){
            point_code = convert_to_ASCII(points_data[i][selected_field]);
            if(points_data[i][selected_field] == new_data[selected_field]){
                point_i = i;
                break;
            }else if(Math.abs(new_inserted_code-point_code) < difference){
                difference = Math.abs(new_inserted_code - point_code);
                point_i = i;
            }
        }
        return point_i
    }

    function get_closest_center(point, cluster_centers){
        d = 999999;
        closest_center = [];
        center_i = -1;
        for(var i = 0; i < cluster_centers.length; i++){
            center = cluster_centers[i];
            curr_d = calc_distance(center[0], center[1], point[0], point[1]);
            if (curr_d < d){
                closest_center = center;
                d = curr_d;
                center_i = i;
            }
        }
        closest_center.push(center_i)
        return closest_center;
    }

    function create_new_points(center){
        x_lower = parseInt(self.vue.x_lower);
        x_upper = parseInt(self.vue.x_upper);
        y_lower = parseInt(self.vue.y_lower);
        y_upper = parseInt(self.vue.y_upper);

        console.log(center[0], center[1]);
        x_new_lower = center[0] - 1 > x_lower ? center[0] - 1 : x_lower
        x_new_upper = center[0] + 1 < x_upper ? center[0] + 1 : x_upper
        y_new_lower = center[1] - 1 > y_lower ? center[1] - 1 : y_lower
        y_new_upper = center[1] + 1 < y_upper ? center[1] + 1 : y_upper

        x_new = Math.random()*(x_new_upper-x_new_lower+1) + x_new_lower;
        y_new = Math.random()*(y_new_upper-y_new_lower+1) + y_new_lower;

        return [x_new, y_new];
    }

    function create_new_entry_dict(fields, new_data){
        new_dict = {};
        for (var i = 0; i < fields.length; i++){
            new_dict[fields[i]] = new_data[fields[i]];
        }
        return new_dict;
    }


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
            line = "Cluster Center for label: " + i;
            plot.push([self.vue.cluster_centers[i][0], 
                        self.vue.cluster_centers[i][1], 
                        line, 
                        'point { fill-color:'+colors[i]+'}']);
        }
        self.vue.colors = colors;
        return plot;
    }

    function find_index_of_nested_arr(cluster_centers, point){
        for(var i = 0; i < cluster_centers.length; i++){
            if(point[0] == cluster_centers[i][0] && point[1] == cluster_centers[i][1]){
                return i;
            }
        }
        return -1;
    }

    function calc_distance(x1, y1, x2, y2){
        return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
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

    function convert_to_ASCII(str){
        code = 0;
        for(var i = 0; i < str.length; i++){
            code += str.charCodeAt(i);
        }
        return code;
    }

    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            logged_in: false,
            home_upload_btn: false,
            fields: [],
            page: 'upload',
            is_uploaded: false,
            checked_fields: [],
            input_k: "8",
            x_lower: "",
            x_upper: "30",
            y_lower: "",
            y_upper: "30",
            num_iters: "300",
            err_message: "",
            is_error: false,
            new_data: {},
            f_index: [],
            points: [],
            points_data: [],
            labels: [],
            cluster_centers: [],
            file_name: "",
            chart_plot: [],
            chart_options: {},
            news_feed_chart_plots: [],
            news_feed_chart_options: {},
            colors: [],
            slider_val: ""
        },
        methods: {
            home_upload_btn_clicked: self.home_upload_btn_clicked,
            get_upload_status: self.get_upload_status,
            upload_button_clicked: self.upload_button_clicked,
            push_field: self.push_field,
            continue_button_clicked: self.continue_button_clicked,
            insert_point: self.insert_point,
            add_to_profile: self.add_to_profile,
            change_page: self.change_page,
            view_plot: self.view_plot
        }

    });

    self.start();
    $("#vue-div").show();
    $("#chart_div_1").hide();
    $("#chart_div_2").hide();
    $("#chart_div_3").hide();
    $("#chart_div_4").hide();
    $("#chart_div_5").hide();


    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});