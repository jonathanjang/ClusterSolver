graph_plot = [];
graph_options = [];
selected = [];
fields = [];

// FIXME: OPTIONAL: uodate database
// FIXME: DELETE
// FIXME: STYLE

$( document ).ready(function() {
	// TRYNNA put, posted on, edited on, posted by, delete, and edit

	$("#edit_feed_btn").on('click', function() {
		$('#edit_feed_btn').hide();
		get_graph_data();
	});
});

function get_graph_data(){
	$.post( get_graphs_url, { start_i: 0, end_i: 5 }, function( data ) {
  		insert_info_and_btns(data.user_names, data.posted_time, data.updated_time, data.can_delete);
  		graph_plot = parse_server_data(data.chart_data);
  		graph_options = parse_server_data(data.chart_options);
  		selected = data.selected;
  		// selected_f_indexes = data.selected_f_indexes;
  		fields = data.fields;
  		create_btn_events(data.chart_data.length, data.fields);

		// close_divs();
	});
}

function insert_info_and_btns(users, post_time, update_time, can_delete){
	chart_divs = ['#chart_div_1', '#chart_div_2', '#chart_div_3', '#chart_div_4', '#chart_div_5'];
	for (var i = 0; i < users.length; i++){
		if(can_delete[i]){
			var del_btn_id = 'chart_delete_' + (i+1);
			var del = $('<input type="button" value="Delete Graph ' + (i+1) + '"' +
			   			 ' class=\"btn btn-danger\"/ id="'+ del_btn_id +'"><br>');
			$(chart_divs[i]).before(del);
		}

		var edit_div = $('<div id="' + 'edit_div_' + (i+1) + '"></div>');
		$(chart_divs[i]).before(edit_div);

		var edit_btn_id = 'chart_edit_' + (i+1);
		// $(chart_divs[i]).after("<i class=\"fa fa-pencil\"></i>");
		var edit = $('<br><input type="button" value="Edit Graph ' + (i+1) + '"' +
		   			 ' class=\"btn btn-success\"/ id="'+ edit_btn_id +'"><br>');
		$(chart_divs[i]).before(edit);




		var str = "\"chart_name_" + (i+1) + "\"";
		$(chart_divs[i]).before('<div class="row" id="row_' + (i+1) + '"></div>');
		$('#row_' + (i+1)).append('<div class="col-md-4" style="font-weight: bold;"><h6>Created By: ' + users[i] + '</h6></div>');
		$('#row_' + (i+1)).append('<div class="col-md-4" style="font-weight: bold;"><h6>Posted On: ' + post_time[i] + '</h6></div');

		if(post_time[i] != update_time[i]){
			$(chart_divs[i]).before("<h5>Updated On: " + update_time[i] + "</h5>");

		}
		

	}
}

function create_btn_events(length, fields){
	chart_divs = ['#chart_div_1', '#chart_div_2', '#chart_div_3', '#chart_div_4', '#chart_div_5'];
	for (var i = 0; i < length; i++){
		var del_str = "#chart_delete_" + (i+1);
		var edit_str = "chart_edit_" + (i+1);

		create_del_listener()
		create_edit_listener(edit_str, fields[i], i, chart_divs[i])

	}
}

function create_del_listener(del_str){

}

function create_edit_listener(edit_str, fields, index, chart_div){
	$('#' + edit_str).on('click', function(){
		for(var j = 0; j < fields.length; j++){
			var inp = fields[j] + '<br> <input type="text" name="' + fields[j] + '"' +
				      ' id="' + edit_str + '_' + j + '"><br>';
			$('#edit_div_' + (index+1)).append(inp);
		}
		var edit = $('<br><input type="button" value="Post Edit ' + (index+1) + '"' +
		   			 ' class=\"btn btn-success\"/ id="post_edit' + (index+1) + '"><br>');
		$('#edit_div_' + (index+1)).append(edit);

		var cancel_edit = $('<br><input type="button" value="Cancel Edit ' + (index+1) + '"' +
		   			 ' class=\"btn btn-warning\"/ id="cancel_edit' + (index+1) + '">');
		$('#edit_div_' + (index+1)).append(cancel_edit);

		$('#cancel_edit' + (index+1)).on('click', function(){
			for(var j = 0; j < fields.length; j++){
				$('#' + edit_str + '_' + j).val("");
			}
			$('#edit_div_' + (index+1)).hide();
			$('#' + edit_str).show();
		})


		$('#post_edit' + (index+1)).on('click', function(){
			l = []
			for (var j = 0; j < fields.length; j++){
				l.push($('#' + edit_str + '_' + j).val());
				$('#' + edit_str + '_' + j).val("");
			}
			do_insertion(l, index);
			set_gchart(graph_plot[index], graph_options[index], chart_div);
		})
		$('#' + edit_str).hide();
	})
}

function do_insertion(list, index){
	close_pt_i = find_points_close(list, index, graph_plot[index]);
	new_pts = [];
	color = -1;
	if (close_pt_i != -1){
		center_i = find_closest_center(close_pt_i, index);
		color = find_color(center_i, index);
		new_pts = create_new_points(center_i, index);
	}else{
		new_pts = create_random_pts();
		color = getRandomColor();
	}
	x_new = new_pts[0];
	y_new = new_pts[1];
	console.log(new_pts);

	tooltip = create_tooltip(list, color, index);

	point = [x_new, y_new, tooltip[0], tooltip[1]];
	graph_plot[index].push(point);
}

function set_gchart(plot, options, chart_div){
	div = chart_div.substring(1,chart_div.length);
    // Initialize a graph for google chart.
    var container = document.getElementById(div);
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
        plot = passed_in_plot;

        data.addRows(plot)

        var options = {};        
        options = passed_in_options;

        var chart = new google.visualization.ScatterChart(document.getElementById(div));
        
        google.visualization.events.addListener(chart, 'ready', function () {
            container.style.display = 'none';
        });

        chart.draw(data, options);
    }

    // Make the chart object visible
    $(chart_div).show();
};


function create_tooltip(list, color, index){
	line1 = "NEWLY INSERTED VALUE\nValue: ";
	for (var i = 0; i < list.length; i++){
		line1 += fields[index][i]+ ":" + list[i] + " ";
	}
	line2 = "point { fill-color:" + color + " }";
	
	return [line1, line2];
}

function find_color(center_i, index){
	style = graph_plot[index][center_i][3];
	return style.substring(19,26);
}

function find_points_close(list, index, plot_arr){
	f_index = fields[index].indexOf(selected[0]);
	new_val = list[f_index];
	match = -1;
	for(var i = 0; i < graph_plot[index].length; i++){
		lookup_i = graph_plot[index][i][2].indexOf(new_val);
		if(lookup_i != -1){
			match = i
			break;
		}
	}
	return match;
}

function find_closest_center(close_pt_i, index){
	clusters = [];
	for(var i = 0; i < graph_plot[index].length; i++){
		lookup_i = graph_plot[index][i][2].indexOf("Cluster Center");
		if(lookup_i != -1){
			clusters.push(i);
		}
	}

	dist = 99999999;
	close_pt_elem = graph_plot[index][close_pt_i];
	center_i = -1;
	for(var i = 0; i < clusters.length; i++){
		gp_elem = graph_plot[index][clusters[i]]
		d = calc_distance(close_pt_elem[0], close_pt_elem[1], gp_elem[0], gp_elem[1]);
		if (d < dist){
			dist = d;
			center_i = clusters[i];
		}
	}
	return center_i;
}

function create_random_pts(){
    x_lower = graph_options[0]['hAxis']['minValue'];
    x_upper = graph_options[0]['hAxis']['maxValue'];
    y_lower = graph_options[0]['vAxis']['minValue'];
    y_upper = graph_options[0]['vAxis']['maxValue'];

    x_new = Math.random()*(x_upper-x_lower+1) + x_lower;
    y_new = Math.random()*(y_upper-y_lower+1) + y_lower;

    return [x_new, y_new];    
}

function create_new_points(center_i, index){
	center_x = graph_plot[index][center_i][0];
	center_y = graph_plot[index][center_i][1];

    x_lower = graph_options[0]['hAxis']['minValue'];
    x_upper = graph_options[0]['hAxis']['maxValue'];
    y_lower = graph_options[0]['vAxis']['minValue'];
    y_upper = graph_options[0]['vAxis']['maxValue'];

    x_new_lower = center_x - 1 > x_lower ? center_x - 1 : x_lower
    x_new_upper = center_x + 1 < x_upper ? center_x + 1 : x_upper
    y_new_lower = center_y - 1 > y_lower ? center_y - 1 : y_lower
    y_new_upper = center_y + 1 < y_upper ? center_y + 1 : y_upper

    x_new = Math.random()*(x_new_upper-x_new_lower+1) + x_new_lower;
    y_new = Math.random()*(y_new_upper-y_new_lower+1) + y_new_lower;

    return [x_new, y_new];
}

function calc_distance(x1, y1, x2, y2){
    return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
}


function parse_server_data(data){
    l = [];
    for(var i = 0; i < data.length; i++){
        l.push(JSON.parse(data[i]));
    }
    return l;
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// function close_divs(){
// 	chart_divs = ['#chart_div_1', '#chart_div_2', '#chart_div_3', '#chart_div_4', '#chart_div_5'];
// 	for (var i = 0 ; i < chart_divs.length; i++){
// 		$(chart_divs[i]).after("</div>");
// 	}
// }

function return_index_of(arr, element){
	for(var i = 0; i < arr.length; i++){
		if(arr[i] == element){
			return i;
		}
	}
	return -1;
}