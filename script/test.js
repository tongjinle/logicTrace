var size = 12;


var serv = new Server();

var mapData = [];
for (var i = 0; i < size; i++) {
	mapData[i] = [];
	for (var j = 0; j < size; j++) {
		mapData[i][j]= undefined;
	}
}


///////////////////////////////
function init(data){
	_.each(data,function(item){
		mapData[item.posi.y][item.posi.x] = {
			type:'node',
			count:item.count
		};
	});
}


///////////////////////////////
function getMap(size,cb){
	serv.acceptReq('map.createMap',{size:size},cb)
}

function drag(from,to,cb){
	serv.acceptReq('node.drag',{from:from,to:to},function(data){
		cb(data);
		isWin();
	});
}

function isWin(){
	serv.acceptReq('game.isWin',null,function(data){
		if(data.data.isWin){
			alert('you win!')
		}
	});
}


function render(mapData){
	var holder = $('body').height(50*mapData.length);
	var h = holder.height();
	_.each(mapData,function(row,y){
		_.each(row,function(item,x){
			var key = [x,y].join('-');
			
			var box = getBox(key);
			if(box.length == 0){
				box = $('<div/>')
				.addClass('box')
				.css({
					left:x*50+'px',
					top:(h-y*50)+'px'
				})
				.attr('bid',key);

				holder.append(box);
			}
			box.text('');
			if(!item){
				box
				.css({
					'background-color':'gray'
				})
				;
			}else if(item.type == 'node'){
				box
				.css({
					'background-color':getColor(key)
				})
				.text(item.count)
				;
			}else if(item.type == 'num'){
				box
				.css({
					'background-color':getColor([item.source.x,item.source.y].join('-'))
				})
				;
			}
		});
	});
}

function paint(isSucc,action,path,isFull){
	if(!isSucc){
		return;
	}
	_.each(path,function(item){
		var source = item.source;
		var posi = {x:item.x,y:item.y};
		var box = getBox(stringifyPosi(posi));
		box.css('background-color',action == 'add' ? getColor(stringifyPosi(source)):'gray');
	});
}

var colorDict;
function getColor(key){
	colorDict = colorDict || {};
	return colorDict[key] = colorDict[key] || ('#ff'+Math.floor(Math.random()*(1<<24)).toString(16)).slice(0,7);
}


$(function(){
	getMap(size,function(data){
		console.log(data);
		if(data.flag){
			init(data.data.map);
			render(mapData);
		}
	});

	var from,to;
	$('body').delegate('.box','mousedown',function(){
		var bid = $(this).attr('bid');
		from = parseBid(bid);
	});

	$('body').delegate('.box','mouseup',function(){
		var bid = $(this).attr('bid');
		to = parseBid(bid);
		from && to && drag(from,to,function(data){
			var info = data.data;
			paint(info.isSucc,info.action,info.path,info.isFull);
		});
	});

	$('body').on('click',function(){
		if(!from || !to){
			from = to = undefined;
		}
	});

	// drag({x:1,y:2},{x:1,y:0},function(data){
	// 	var info = data.data;
	// 	paint(info.isSucc,info.action,info.path,info.isFull);
	// });

	// setTimeout(function(){
	// 	drag({x:1,y:0},{x:1,y:1},function(data){
	// 		var info = data.data;
	// 		paint(info.isSucc,info.action,info.path,info.isFull);
	// 	});
	// },0)
});

function parseBid(bid){
	var arr = bid.split('-');
	return {x:arr[0]-0,y:arr[1]-0};
}

function getBox(key){
	var box = $('[bid="'+key+'"]');
	return box;
}

function stringifyPosi(posi){
	return [posi.x,posi.y].join('-')
}