graph_plot = [];
graph_options = [];
selected = [];
fields = [];

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
  		console.log(graph_plot);
		console.log(graph_options);
		console.log(data.selected);

		close_divs();
	});
}

function insert_info_and_btns(users, post_time, update_time, can_delete){
	chart_divs = ['#chart_div_1', '#chart_div_2', '#chart_div_3', '#chart_div_4', '#chart_div_5'];
	for (var i = 0; i < users.length; i++){

		var str = "\"chart_name_" + (i+1) + "\"";
		console.log(str);
		$(chart_divs[i]).after("<div id=" + str + ">");
		$(chart_divs[i]).after("<h5>Created By: " + users[i] + "</h5>");
		$(chart_divs[i]).after("<h5>Posted On: " + post_time[i] + "</h5>");
		if(post_time[i] != update_time[i]){
			$(chart_divs[i]).after("<h5>Updated On: " + update_time[i] + "</h5>");

		}
		var edit_btn_id = 'chart_edit_' + (i+1);
		$(chart_divs[i]).after("<i class=\"fa fa-pencil\"></i>");
		var edit = $('<input type="button" value="Edit Graph ' + (i+1) + '"' +
		   			 ' class=\"btn btn-warning\"/ id="'+ edit_btn_id +'">');
		$(chart_divs[i]).after(edit);
		var edit_div = $('<div id="' + 'edit_input_' + i + '"></div>');
		$(chart_divs[i]).after(edit_div);		
		if(can_delete[i]){
			var del_btn_id = 'chart_delete_' + (i+1);
			var del = $('<input type="button" value="Delete Graph ' + (i+1) + '"' +
			   			 ' class=\"btn btn-warning\"/ id="'+ del_btn_id +'"><br>');
			$(chart_divs[i]).after(del);
		}
	}
}

function create_btn_events(length, fields){
	chart_divs = ['#chart_div_1', '#chart_div_2', '#chart_div_3', '#chart_div_4', '#chart_div_5'];
	for (var i = 0; i < length; i++){
		var del_str = "#chart_delete_" + (i+1);
		var edit_str = "chart_edit_" + (i+1);

		// create_del_listener();
		create_edit_listener(edit_str, fields[i], i)

	}
}

function create_edit_listener(edit_str, fields, index){
	$('#' + edit_str).on('click', function(){

		for(var j = 0; j < fields.length; j++){
			var inp = fields[j] + '<br> <input type="text" name="' + fields[j] + '"' +
				      ' id="' + edit_str + '_' + j + '"><br>';
			$('#edit_input_' + index).before(inp);
		}
		var edit = $('<input type="button" value="Post Edit ' + (index+1) + '"' +
		   			 ' class=\"btn btn-warning\"/ id="post_edit' + (index+1) + '">');
		$('#edit_input_' + index).before(edit);

		$('#post_edit' + (index+1)).on('click', function(){
			l = []
			for (var j = 0; j < fields.length; j++){
				l.push($('#' + edit_str + '_' + j).val());
			}
			do_insertion(l, index);
		})
		$('#' + edit_str).hide();
	})
}

function do_insertion(list, index){
	close_pt_i = find_points_close(list, index, graph_plot[index]);
	if (close_pt_i != -1){
		center_i = find_closest_center(close_pt_i, index);
		console.log(center_i);
	}else{
		//FIXME: make a random num		
	}
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

function close_divs(){
	chart_divs = ['#chart_div_1', '#chart_div_2', '#chart_div_3', '#chart_div_4', '#chart_div_5'];
	for (var i = 0 ; i < chart_divs.length; i++){
		$(chart_divs[i]).after("</div>");
	}
}

function return_index_of(arr, element){
	for(var i = 0; i < arr.length; i++){
		if(arr[i] == element){
			return i;
		}
	}
	return -1;
}