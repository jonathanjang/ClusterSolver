graph_plot = [];
graph_options = [];

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
  		create_btn_events(data.chart_data.length, data.fields);
  		console.log(graph_plot);
		console.log(graph_options);


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