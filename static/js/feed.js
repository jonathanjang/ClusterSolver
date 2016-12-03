$( document ).ready(function() {
	setInterval(function(){
		if($('#test').css('display') != 'none'){
			get_graph_data();
		}
	}, 2000);


});

// function check_all(){
// 	for (var i = 1; i < 5; i++){
// 		chart_div_str = '#chart_div _' + i;
// 		if ($(chart_div_str).hasClass("hide")) {
// 			console.log(i)
// 			return false;
// 		}
// 	}
// 	return true;
// }

function get_graph_data(){
	$.post( get_graphs_url, { start_i: 0, end_i: 5 }, function( data ) {
  		console.log( data );
	});
}