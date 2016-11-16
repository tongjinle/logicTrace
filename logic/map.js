var Map = (function() {
	function Map() {
		this.size = 0;
		this.arr = [];
	}

	var fn = Map.prototype;

	fn.createMapBySize = function(size) {
		this.size = size;
		var arr = this.arr;
		arr.length = size;

		

		
		for (var i = 0; i < arr.length; i++) {
			arr[i] = [];
			arr[i].length = size;
		}

		while (this._insert()) {

		}
		this._cut();
	};

	fn.disp = function() {
		console.log(this.arr);
	};

	/*
		struct
		
		number box:
		{
			type:'num',
			source:position
		}

		node box:
		{
			type:'node',
			count:number
		}
	*/

	// random insert
	fn._insert = function() {

		var paintCount = 100;

		var arr = this.arr;
		var _blank = this._getBlank();
		if (_blank.length == 0) {
			return false;
		}

		var index = random(0, _blank.length - 1);
		var item = _blank[index];

		var paintLen = 0;
		// // first
		// var direIndex = random(0, item.direList.length - 1);
		// var dire = item.direList[direIndex];
		// var posi = item.posi;
		// paintLen += paint.call(this, posi, dire);
		// item.direList.splice(direIndex, 1);

		// // second
		// var rate = .85;
		// var rateFlag = random(0, 100) < rate * 100 && item.direList.length;
		// if (rateFlag) {
		// 	var direIndex = random(0, item.direList.length - 1);
		// 	var dire = item.direList[direIndex];
		// 	var posi = item.posi;
		// 	paintLen += paint.call(this, posi, dire);
		// }


		// first 
		var direIndex = random(0, item.direList.length - 1);
		var firstDire = item.direList[direIndex];
		var direList = [firstDire].concat(item.direList.filter(function(n){return n!=firstDire && .5-Math.random()>0;}));

		_.each(direList,function(dire){
			paintLen += paint.call(this,item.posi,dire);
		}.bind(this));

		this.arr[item.posi.y][item.posi.x] = {
			type: 'node',
			count: paintLen
		};

		return true;

		function paint(source, dire) {
			var arr = this.arr;
			var posi = source;
			var purposeLen = random(1, this.size);
			var len = purposeLen;
			if (dire == 0) {
				var x = posi.x;
				for (var y = posi.y - 1; y >= 0 && len; y--) {
					if (arr[y][x] === undefined) {
						arr[y][x] = {
							type: 'num',
							source: posi
						};
						len--;
					} else {
						break;
					}
				}
			} else if (dire == 1) {
				var y = posi.y;
				for (var x = posi.x + 1; x < this.size && len; x++) {
					if (arr[y][x] === undefined) {
						arr[y][x] = {
							type: 'num',
							source: posi
						};
						len--;
					} else {
						break;
					}
				}
			} else if (dire == 2) {
				var x = posi.x;
				for (var y = posi.y + 1; y < this.size && len; y++) {
					if (arr[y][x] === undefined) {
						arr[y][x] = {
							type: 'num',
							source: posi
						};
						len--;
					} else {
						break;
					}
				}
			} else if (dire == 3) {
				var y = posi.y;
				for (var x = posi.x - 1; x >= 0 && len; x--) {
					if (arr[y][x] === undefined) {
						arr[y][x] = {
							type: 'num',
							source: posi
						};
						len--;
					} else {
						break;
					}
				}
			}

			return purposeLen - len == 0 ? paint.call(this, source, dire) : purposeLen - len;
		}

	};



	fn._getBlank = function() {
		var rst = [];
		var list = this._getUndefined();
		_.each(list, function(posi) {
			var direList = this._getWalk(posi.x, posi.y);
			if (direList.length) {
				rst.push({
					posi: posi,
					direList: direList
				});
			}
		}.bind(this));
		return rst;
	}

	fn._getWalk = function(x, y) {
		var self = this;
		var rst = [];
		var arr = near({
			x: x,
			y: y
		});



		_.each(arr, function(posi, i) {
			if (posi.x >= 0 && posi.x < this.size && posi.y >= 0 && posi.y < this.size && self.arr[posi.y][posi.x] === undefined) {
				rst.push(i);
			}
		}.bind(this));

		return rst;
	};



	fn._getUndefined = function() {
		var rst = [];
		this._visit(function(item, x, y, arr) {
			if (!item) {
				rst.push({
					x: x,
					y: y
				});
			}
		});
		return rst;
	}

	fn._cut = function() {
		var unList = this._getUndefined();
		if (unList.length == 0) {
			return;
		}

		var first = unList[0];
		var nearPosi = filterMapBound.call(this, near(first))[0];

		var box = this.arr[nearPosi.y][nearPosi.x];
		var boxSource;
		if (box.type == 'node') {
			boxSource = {x:nearPosi.x,y:nearPosi.y};
		} else if (box.type == 'num') {
			// clear
			var boxSource = {
				x: box.source.x,
				y: box.source.y
			};
		}

		this._visit(function(item, x, y, arr) {
			if (item && item.type == 'num' && item.source.x == boxSource.x && item.source.y == boxSource.y) {
				arr[y][x] = undefined;
			}
			if (item && item.type == 'node' && y == boxSource.y && x == boxSource.x) {
				arr[y][x] = undefined;
			}
		});
		while (this._insert()) {}
		this._cut();

	};



	fn.visit = fn._visit = function(fn) {
		var arr = this.arr;
		for (var i = 0; i < arr.length; i++) {
			var ai = arr[i];
			for (var j = 0; j < ai.length; j++) {
				var item = ai[j];
				if (fn(item, j, i, arr)) {
					return;
				}
			}
		}
	};

	fn._visitLine = function(from, to, fn) {
		var arr = this.arr;
		if (from.x == to.x) {
			var x = from.x;
			var min = Math.min(from.y, to.y);
			var max = Math.max(from.y, to.y);
			for (var i = min; i <= max; i++) {
				var item = arr[i][x];
				if (!fn(item, x, y, arr)) {
					return;
				}
			}
		} else if (from.y == to.y) {
			var y = from.y;
			var min = Math.min(from.x, to.x);
			var max = Math.max(from.x, to.x);
			for (var i = min; i <= max; i++) {
				var item = arr[y][i];
				if (!fn(item, x, y, arr)) {
					return;
				}
			}
		}
	}

	//////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////


	function random(min, max) {
		return min + Math.floor((max - min + 1) * Math.random());
	}

	function near(posi) {
		var x = posi.x;
		var y = posi.y;

		return [{
			x: x,
			y: y - 1
		}, {
			x: x + 1,
			y: y
		}, {
			x: x,
			y: y + 1
		}, {
			x: x - 1,
			y: y
		}];
	}

	function filterMapBound(posiList) {
		return _.filter(posiList, function(posi) {
			return posi.x >= 0 && posi.x < this.size && posi.y >= 0 && posi.y < this.size
		}.bind(this));
	}


	return Map;

})();