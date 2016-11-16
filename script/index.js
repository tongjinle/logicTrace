var map = new Map();
map.createMapBySize(5);
// map.arr = JSON.parse('[[{"type":"node","count":1},{"type":"num","source":{"x":0,"y":0}}],[{"type":"node","count":1},{"type":"num","source":{"x":0,"y":1}}]]');
map.disp();


$(start);

function start(){
	var holder = $('body');
	var arr = map.arr;
	var colorDict = {};
	map._visit(function(item,x,y,arr){
		if(item && item.type === 'node'){
			colorDict[[x,y].join('-')] = Math.floor(Math.random()*(1<<24)).toString(16);
		}
	});

	map._visit(function(item,x,y,arr){
		if(item){
			var box;
			var bgColor 
			if(item.type == 'node'){
				bgColor = colorDict[[x,y].join('-')];
				box = paintNodeBox(x,y,bgColor);
				box && box.text(item.count);
				box && holder.append(box);
			}else if(item.type == 'num'){
				var source = item.source;
				bgColor = colorDict[[source.x,source.y].join('-')];
				box = paintNodeBox(x,y,bgColor);
				box && holder.append(box);

			}
		}

		function paintNodeBox(x,y,bgColor){
			var box;

			box = $('<div/>')
				.addClass('box')
				.css({
					left:x*50+'px',
					top:y*50+'px'
				});

		
			box.css({
				'background-color':'#'+bgColor
			});

			
			return box;
		}
	})
}

