graph_plot = [];
graph_options = [];

$( document ).ready(function() {
	// setInterval(function(){
	// if($('#test').css('display') != 'none'){
	// 	get_graph_data();
	// }
	// }, 2000);
	// TRYNNA put, posted on, edited on, posted by, delete, and edit

	$("#edit_feed_btn").on('click', function() {
		get_graph_data();
	});




});

function get_graph_data(){
	$.post( get_graphs_url, { start_i: 0, end_i: 5 }, function( data ) {
  		insert_info_and_btns(data.user_names, data.posted_time, data.updated_time, data.can_delete);
  		graph_plot = data.chart_data;
  		graph_options = data.chart_options;
  		create_btn_events(data.chart_data.length);
  		console.log(graph_plot);
		console.log(graph_options);

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
		if(can_delete[i]){
			var del_btn_id = 'chart_delete_' + (i+1);
			var del = $('<input type="button" value="Delete Graph ' + (i+1) + '"' +
			   			 ' class=\"btn btn-warning\"/ id="'+ del_btn_id +'">');
			$(chart_divs[i]).after(del);
		}
		$(chart_divs[i]).after("</div>");
	}
}

function create_btn_events(length){
	for (var i = 0; i < length; i++){
		$("#chart_delete_" + (i+1)).on('click', function() {
			console.log("clicked chart_delete_" + (i+1))
		});

		$("#chart_edit_" + (i+1)).on('click', function() {
			console.log("clicked chart_edit_" + (i+1))
		});

	}
}