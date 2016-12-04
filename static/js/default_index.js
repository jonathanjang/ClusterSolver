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

    self.insert_more_btn_clicked = function(){
        self.vue.insert_more_btn = !self.vue.insert_more_btn;
    }

    self.start = function(){
        self.vue.page = 'home';
        self.check_logged_in();
    }

    self.back_to_home = function(){
        $("#chart_div_1").hide();
        $("#chart_div_2").hide();
        $("#chart_div_3").hide();
        $("#chart_div_4").hide();
        $("#chart_div_5").hide();
        self.change_page('home');
        //FIXME: not the greatest fix in the world, but w/e
        location.reload();
        self.vue.home_upload_btn = !self.vue.home_upload_btn;
    };

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

    self.create_news_feed = function(){
        $.getJSON(create_graphs_url(0,5), function(data){
            self.vue.feed_chart_plots = parse_server_data(data.chart_data);
            self.vue.feed_chart_options = parse_server_data(data.chart_options);
            self.dispatch_multiple_gcharts(self.vue.feed_chart_plots, self.vue.feed_chart_options);
            self.vue.has_more = data.has_more;
            self.change_page('feed');
        });
    };

    self.load_more = function(){
        console.log("load more has been clicked");
    };

    function parse_server_data(data){
        l = [];
        for(var i = 0; i < data.length; i++){
            l.push(JSON.parse(data[i]));
        }
        return l;
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

    function get_fields(){
        $.getJSON(get_fields_url, function(data){
            self.vue.fields = data.field_list;
            self.vue.f_index = data.f_index;
        });
    }

    self.more_settings_btn_clicked = function(){
        $.getJSON(preprocess_data_url, { checked_fields: self.vue.checked_fields }, function(data){
            self.vue.input_k = data.k_input;
            self.vue.input_k_max = data.k_input_max;
            self.vue.x_upper = data.x_upper;
            self.vue.x_upper_max = data.x_upper_max;
            self.vue.y_upper = data.y_upper;
            self.vue.y_upper_max = data.y_upper_max;
            self.vue.new_clust_param = data.new_clust_param;
            self.vue.new_clust_param_max = data.new_clust_param_max;
            self.vue.more_settings_btn = !self.vue.more_settings_btn;
            self.vue.cluster_name = data.file_name
        });

    }

    self.upload_button_clicked = function(){
        self.change_page('settings');
        get_fields();
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
        self.start_clustering();
        self.change_page('clustering');
    };

    self.message_box = function(){
        self.vue.show_box = !self.vue.show_box;
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
                  num_iters: self.vue.num_iters,
                  d_offset: self.vue.d_offset
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

    self.dispatch_multiple_gcharts = function(plots, options){
        chart_divs = ['chart_div_1', 'chart_div_2', 'chart_div_3', 'chart_div_4', 'chart_div_5'];
        for(var i = 0; i < plots.length; i++){
            self.set_gchart_with_div(plots[i], options[i], chart_divs[i]);
        }
    }

    self.set_gchart_with_div = function(plot, options, chart_div){
        // Initialize a graph for google chart.

        var container = document.getElementById(chart_div);
        container.style.display = 'block';
        google.charts.load('current', {'packages':['corechart']});
        google.charts.setOnLoadCallback(drawChart(plot, options, chart_div));
        function drawChart(passed_in_plot, passed_in_options, chart_div) {

            var data = new google.visualization.DataTable();
            data.addColumn('number', 'X');
            data.addColumn('number', 'Y');
            data.addColumn({type: 'string', role: 'tooltip'});
            data.addColumn( {type: 'string', role: 'style'} );    

            var plot = [];
            if (typeof passed_in_plot === "undefined" || passed_in_plot.length == 0){
                plot = parse_points();
            }else{
                plot = passed_in_plot;
            }

            data.addRows(plot)

            var options = {};
            if (Object.keys(passed_in_options).length == 0){
                options = {
                    title: 'Results of ' + self.vue.cluster_name,
                    hAxis: {title: 'X', minValue: parseInt(self.vue.x_lower), maxValue: parseInt(self.vue.x_upper)},
                    vAxis: {title: 'Y', minValue: parseInt(self.vue.y_lower), maxValue: parseInt(self.vue.y_upper)},
                    legend: 'none',
                    tooltip: {isHTML: true}
                };
            }else{
                options = passed_in_options;
            }

            var chart = new google.visualization.ScatterChart(document.getElementById(chart_div));
            
            google.visualization.events.addListener(chart, 'ready', function () {
                container.style.display = 'none';
            });

            chart.draw(data, options);
        }

        // Make the chart object visible
        chart_div = '#' + chart_div;
        $(chart_div).show();
        // $("#test").show();
        $("#feed_details_btn").show();

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
                    title: 'Results of ' + self.vue.cluster_name,
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

        if(point_i != -1){
            // get the closest center
            center = get_closest_center(self.vue.points[point_i], self.vue.cluster_centers);
            center_i = center[2];
            // then assign a point to it
            new_points = create_new_points(center);
        }else{
            new_points = get_random_points();
            center_i = -1;
        }

        new_entry_dict = create_new_entry_dict(self.vue.fields, self.vue.new_data);

        // create a string for the tooltip
        line = "NEWLY INSERTED VALUE\n";
        line += convert_dict_to_string(new_entry_dict, center_i);

        if (point_i != -1){
            // now add it to the plot!
            self.vue.chart_plot.push([new_points[0], new_points[1], line, 'point { fill-color:'+self.vue.colors[center_i]+'}']);
        }else{
            self.vue.chart_plot.push([new_points[0], new_points[1], line, 'point { fill-color:'+getRandomColor()+'}']);            
        }

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

    self.add_to_feed = function(){
        console.log(self.vue.fields);
        $.post(add_to_feed_url, {
            chart_plot: JSON.stringify(self.vue.chart_plot),
            chart_options: JSON.stringify(self.vue.chart_options),
            x_upper: self.vue.x_upper,
            y_upper: self.vue.y_upper,
            file_name: self.vue.file_name,
            fields: self.vue.fields,
            checked_fields: self.vue.checked_fields,
            d_offset: self.vue.d_offset,
            post_content: self.vue.post_content
        });
        self.create_news_feed();
        self.change_page('feed');

        // $('#chart_div_1').hide();

    };



    //Helper functions:

    function index_of_closest_point(selected_field, new_data, points_data){
        new_inserted_code = convert_to_ASCII(new_data[selected_field]);
        point_i = -1;
        difference = 999999;
        total_tol = 0;
        d_off = parseInt(self.vue.d_offset);
        for(var i = 0; i < points_data.length; i++){
            point_code = convert_to_ASCII(points_data[i][selected_field]);
            curr_diff = Math.abs(new_inserted_code-point_code)
            
            if(points_data[i][selected_field] == new_data[selected_field]){
                point_i = i;
                break;
            }else if(curr_diff < difference){
                difference = Math.abs(new_inserted_code - point_code);
                point_i = i;
            }

            total_tol += curr_diff;
            if(total_tol > d_off){
                return -1;
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

    function get_random_points(){
        x_lower = parseInt(self.vue.x_lower);
        x_upper = parseInt(self.vue.x_upper);
        y_lower = parseInt(self.vue.y_lower);
        y_upper = parseInt(self.vue.y_upper);

        x_new = Math.random()*(x_upper-x_lower+1) + x_lower;
        y_new = Math.random()*(y_upper-y_lower+1) + y_lower;

        return [x_new, y_new];

    }

    function create_new_points(center){
        x_lower = parseInt(self.vue.x_lower);
        x_upper = parseInt(self.vue.x_upper);
        y_lower = parseInt(self.vue.y_lower);
        y_upper = parseInt(self.vue.y_upper);
        d_offset = parseInt(self.vue.d_offset);

        console.log(center[0], center[1]);
        x_new_lower = center[0] - d_offset > x_lower ? center[0] - d_offset : x_lower
        x_new_upper = center[0] + d_offset < x_upper ? center[0] + d_offset : x_upper
        y_new_lower = center[1] - d_offset > y_lower ? center[1] - d_offset : y_lower
        y_new_upper = center[1] + d_offset < y_upper ? center[1] + d_offset : y_upper

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
        line = "";
        if(label != -1){
            line += "Cluster #" + label + ": \nValue: ";
        }
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
            more_settings_btn: false,
            insert_more_btn: false,
            has_more: false,
            fields: [],
            page: 'upload',
            is_uploaded: false,
            checked_fields: [],
            input_k: "8",
            input_k_max: "40",
            x_lower: "0",
            x_upper: "30",
            x_upper_max: "100",
            y_lower: "0",
            y_upper: "30",
            y_upper_max: "100",
            num_iters: "300",
            new_clust_param: "200",
            new_clust_param_max: "1000",
            d_offset: "1",
            d_offset_max: "30",
            err_message: "",
            cluster_name: "",
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
            feed_chart_plots: [],
            feed_chart_options: [],
            colors: [],
            slider_val: "",
            show_box: false,
            post_content: ""
        },
        methods: {
            home_upload_btn_clicked: self.home_upload_btn_clicked,
            insert_more_btn_clicked: self.insert_more_btn_clicked,
            get_upload_status: self.get_upload_status,
            upload_button_clicked: self.upload_button_clicked,
            push_field: self.push_field,
            back_to_home: self.back_to_home,
            continue_button_clicked: self.continue_button_clicked,
            insert_point: self.insert_point,
            add_to_feed: self.add_to_feed,
            create_news_feed: self.create_news_feed,
            change_page: self.change_page,
            more_settings_btn_clicked: self.more_settings_btn_clicked,
            load_more: self.load_more,
            message_box: self.message_box
        }

    });

    self.start();
    $("#vue-div").show();
    $("#chart_div_1").hide();
    $("#chart_div_2").hide();
    $("#chart_div_3").hide();
    $("#chart_div_4").hide();
    $("#chart_div_5").hide();
    // $("#test").hide();
    $("#feed_details_btn").hide();



    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});