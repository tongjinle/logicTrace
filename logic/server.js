var Server = (function(){
	var direMaxCount = 4;
	var Server = function(){
		this.map = null;
		this.totalCount = 0;
		this.usedTotalCount = 0;
	};

	var fn = Server.prototype;

	fn.acceptReq = function(method,params,cb){
		var data = dict[method].call(this,params);
		console.log(method,params,'--->',data);

		cb({
			flag:true,
			data:data
		});
	};

	var dict = {};

	dict['map.createMap'] = function(params){
		var size = params.size;

		var map = this.map = new Map();
		map.createMapBySize(size);

		console.log('map');
		console.log(JSON.stringify(map.arr));

		var rst = [];
		map.visit(function(item,x,y,arr){
			if(item.type == 'node'){
				// 已经使用的点数
				item.used = 0;
				item.direList = [];
				this.totalCount += item.count;
				rst.push({
					posi:{x:x,y:y},
					count:item.count
				});
			}else if(item.type == 'num'){
				arr[y][x] = undefined;
			}
		}.bind(this));
		return {map:rst};
	};

	dict['game.isWin'] = function(params){
		return {isWin:this.totalCount == this.usedTotalCount};
	};

	dict['node.drag'] = function(params){
		var from = params.from,
			to = params.to;
		var arr = this.map.arr;
		var fromItem = arr[from.y][from.x];

		// 起始点点击了空白处,不合逻辑
		if(fromItem === undefined){
			return {
				isSucc:false
			};
		}

		// 起始点和结束点不在一条直线上,不合逻辑
		var dire;
		dire = getDire(from,to);
		if(dire === null){
			return {
				isSucc:false
			};
		}

		var sourceNode;
		var sourcePosi;
		if(fromItem.type == 'node'){
			sourceNode = fromItem;
			sourcePosi = from;
		}else if(fromItem.type == 'num'){
			sourceNode = arr[fromItem.source.y][fromItem.source.x];
			sourcePosi = fromItem.source;
		}

		var fromDire = getDire(sourcePosi,from);
		var toDire = getDire(sourcePosi,to);
		// 起始点和结束点跟sourcePosi不在一条直线上,不合逻辑
		// 注意,fromDire和sourcePosi可能重合
		if((!posiEqual(from,sourcePosi) && fromDire === null) || (!posiEqual(to,sourcePosi) &&toDire === null)){
			return {
				isSucc:false
			};
		}

		var len = getDist(from,to);
		var realLen ;
		var path;
		var action = dire == toDire ? 'add' :'sub';
		if(action == 'add'){
			if(fromItem.type == 'node'){
				if(sourceNode.direList.length==direMaxCount){
					return{
						isSucc:false
					};
 				}
			}
			realLen = Math.min(len,sourceNode.count - sourceNode.used);
			path = walk(from,realLen,dire);
			path = _.filter(path,function(posi){
				var item = arr[posi.y][posi.x];
				return !item;
			});
			path = _.map(path,function(posi){
				return _.extend(posi,{source:sourcePosi});
			});
			_.each(path,function(posi){
				arr[posi.y][posi.x] = {
					type:'num',
					source:sourcePosi
				}
			});
			if(path.length!=0){
				sourceNode.used+=path.length;
				this.usedTotalCount += path.length;
				sourceNode.direList.indexOf(dire)==-1&&sourceNode.direList.push(dire);
			}
		}else if(action == 'sub'){
			// 不能是在中间sub
			var oppoDire = (dire+2)%4 ;
			var oppoPosi = walk(from,1,oppoDire).slice(1)[0];
			console.log(oppoPosi);
			if(oppoPosi.x>=0 && oppoPosi.x <this.map.size && oppoPosi.y>=0 && oppoPosi.y<this.map.size) {
				var oppoItem = arr[oppoPosi.y][oppoPosi.x];
				if(oppoItem && oppoItem.type=='num' && posiEqual(oppoItem.source,sourcePosi)){
					return{
						isSucc:false
					};
				}
			}

			path = walk(from,len,dire).slice(0,-1);

			path = _.filter(path,function(posi){
				var item = arr[posi.y][posi.x];
				return item && item.type == 'num';
			});
			_.each(path,function(posi){
				arr[posi.y][posi.x] = undefined;
			});
			if(path.length!=0){
				sourceNode.used-=path.length;
				this.usedTotalCount -= path.length;
				if(posiEqual(sourcePosi,to) ){
					sourceNode.direList = _.filter(sourceNode.direList,function(n){return n!=(dire+2)%4;});

				}
				
			}
		}
		return {
			isSucc:true,
			action:action,
			path:path,
			isFull:sourceNode.used == sourceNode.count
		};
		
		// 沿着一个方向行走
		function walk(start,len,dire){
			var list = [start];

			var x = start.x;
			var y = start.y;

			for(var i=0;i<len;i++){
				if(dire == 0){
					y++;
				}else if(dire ==1){
					x++;
				}else if(dire == 2){
					y--;
				}else if(dire == 3){
					x--;
				}
				list.push({x:x,y:y});
			}

			return list;
		}



		// 获取两个点之间的方向
		function getDire(from,to){
			if(from.x!=to.x && from.y!=to.y){
				return null;
			}
			if(from.x==to.x && from.y==to.y){
				return null;
			}

			if(from.x == to.x){
				if(from.y>to.y){
					return 2;
				}
				else{
					return 0;
				}
			}

			if(from.y == to.y){
				if(from.x>to.x){
					return 3;
				}else{
					return 1;
				}
			}
		}

		// 获取两点之间的距离
		function getDist(from,to){
			return Math.abs(to.y-from.y) + Math.abs(to.x-from.x);
		}

		// 获取sourceNode的path路线数量
		function getPathCount(sourcePosi) {
			var direList = [];
			this.visit(function(item,x,y,arr){
				if(item && item.type == 'num'){
					var dire = getDire(sourcePosi,{x:x,y:y});
					if(direList.indexOf(dire)==-1){
						direList.push(dire);
					}
				}
			})
			return direList.length;
		}

		function posiEqual(po1,po2){
			return po1.x == po2.x && po1.y == po2.y;
		}
	};

	return Server;
})();