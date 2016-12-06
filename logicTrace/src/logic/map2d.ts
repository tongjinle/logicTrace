namespace map2d {

	export interface IPosition {
		x: number,
		y: number
	}

	export enum Direction {
		up, right, down, left
	};

	export enum SlashDirection {
		upRight, downRight, downLeft, upLeft
	}

	let allDirection = [
		Direction.up,
		Direction.right,
		Direction.down,
		Direction.left
	];

	let allSlashDirection = [
		SlashDirection.upRight,
		SlashDirection.downRight,
		SlashDirection.downLeft,
		SlashDirection.upLeft
	];

	// *************************************************************************
	// 基础range函数 START
	// *************************************************************************

	// 直线
	// 0123 -> 上右下左
	export function lineRange(posiSource: IPosition, dist: number, dire: Direction): IPosition[] {
		let posiList: IPosition[] = [];
		let xStep: number;
		let yStep: number;
		if (dire == Direction.up) {
			xStep = 0;
			yStep = 1;
		} else if (dire == Direction.right) {
			xStep = 1;
			yStep = 0;
		} else if (dire == Direction.down) {
			xStep = 0;
			yStep = -1;
		} else if (dire == Direction.left) {
			xStep = -1;
			yStep = 0;
		}
		for (let i = 0; i < dist; i++) {
			posiList.push({ x: posiSource.x + xStep * (i + 1), y: posiSource.y + yStep * (i + 1) });
		}
		return posiList;
	};


	// 斜线
	// 0123 -> 右上,右下,左下,左上
	export function slashRange(posiSource: IPosition, dist: number, dire: SlashDirection): IPosition[] {
		let posiList: IPosition[] = [];
		let xStep: number;
		let yStep: number;
		if (dire == SlashDirection.upRight) {
			xStep = 1;
			yStep = 1;
		} else if (dire == SlashDirection.downRight) {
			xStep = 1;
			yStep = -1;
		} else if (dire == SlashDirection.downLeft) {
			xStep = -1;
			yStep = -1;
		} else if (dire == SlashDirection.upLeft) {
			xStep = -1;
			yStep = 1;
		}
		for (let i = 0; i < dist; i++) {
			posiList.push({ x: posiSource.x + xStep * (i + 1), y: posiSource.y + yStep * (i + 1) });
		}
		return posiList;
	};


	// 周围
	// near = line * 4个方向
	export function nearRange(posiSource: IPosition, dist: Direction): IPosition[] {
		let posiList: IPosition[] = [];
		for (var i = 0; i < allDirection.length; i++) {
			let dire = allDirection[i];
			posiList = posiList.concat(lineRange(posiSource, dist, dire));
		}
		return posiList;
	};

	// 四角度斜线
	// nearSlash = slash * 4;
	export function nearSlashRange(posiSource: IPosition, dist: Direction): IPosition[] {
		let range: IPosition[] = [];
		for (let i = 0; i < allSlashDirection.length; i++) {
			let dire = allSlashDirection[i];
			range = range.concat(slashRange(posiSource, dist, dire));
		}
		return range;
	}

	// 圆圈
	export function circleRange(posiSource: IPosition, radius: number): IPosition[] {
		let posiList: IPosition[] = [];
		for (let x = -radius; x <= radius; x++) {
			for (let y = -radius; y <= radius; y++) {
				if (!(x == 0 && y == 0)) {
					posiList.push({ x: x + posiSource.x, y: y + posiSource.y });
				}
			}
		}
		return posiList;
	};

	// 曼哈顿
	export function manhattanRange(posiSource: IPosition, radius: number): IPosition[] {
		let posiList: IPosition[] = [];
		for (let x = -radius; x <= radius; x++) {
			for (let y = -radius; y <= radius; y++) {
				let manhDist: number = Math.abs(x) + Math.abs(y);
				if (manhDist <= radius && manhDist != 0) {
					posiList.push({ x: x + posiSource.x, y: y + posiSource.y });
				}
			}
		}
		return posiList;
	};

	// 获取两点之间的坐标
	export function getBetween(pa: IPosition, pb: IPosition): IPosition[] {
		let range: IPosition[] = [];
		let [minX, maxX] = [pa.x, pb.x].sort((a, b) => a - b);
		let [minY, maxY] = [pa.y, pb.y].sort((a, b) => a - b);
		for (var x = minX; x <= maxX; x++) {
			for (var y = minY; y <= maxY; y++) {
				range.push({ x, y });
			}
		}
		range = sub(range, [pa, pb]);
		return range;
	}

	// 获取position的唯一主键
	function getPosiKey(posi: IPosition) {
		return [posi.x, posi.y].join('-');
	}

	// 去重
	export function unique(posiList: IPosition[]): IPosition[] {
		return _.uniq(posiList, getPosiKey);
	}


	// 差集
	export function sub(posiListSource: IPosition[], posiListTarget: IPosition[]): IPosition[] {
		var posiList: IPosition[] = [];
		var dict = _.indexBy(posiListSource, getPosiKey);
		var dictForSub = _.indexBy(posiListTarget, getPosiKey);
		_.each(dict, (value, key) => {
			if (!dictForSub[key]) {
				posiList.push(_.clone(value));
			}
		});
		return posiList;
	}

	// 获取方向
	export function getDirection(sourcePosi: IPosition, targetPosi: IPosition): Direction {
		let dire: Direction;
		var sx = sourcePosi.x;
		var sy = sourcePosi.y;
		var tx = targetPosi.x;
		var ty = targetPosi.y;

		if (sx != tx && sy != ty) {
			return undefined;
		}
		if (sx == tx) {
			if (sy > ty) {
				dire = Direction.up;
			} else {
				dire = Direction.down;
			}
		} else {
			if (sx > tx) {
				dire = Direction.right;
			} else {
				dire = Direction.left;
			}
		}
		return dire;
	}

	// 获取斜线方向
	export function getSlashDirection(sourcePosi: IPosition, targetPosi: IPosition): SlashDirection {
		let dire: SlashDirection;
		var sx = sourcePosi.x;
		var sy = sourcePosi.y;
		var tx = targetPosi.x;
		var ty = targetPosi.y;

		if (Math.abs((sy - ty) / (sx - tx)) != 1) {
			return undefined;
		}

		if (sy > ty) {
			if (sx > tx) {
				dire = SlashDirection.upRight;
			} else {
				dire = SlashDirection.upLeft;
			}
		} else {
			if (sx > tx) {
				dire = SlashDirection.downRight;
			} else {
				dire = SlashDirection.downLeft;
			}
		}

		return dire;
	}


	// 判断两个坐标是否相等
	export function isPositionEqual(pa:IPosition,pb:IPosition){
		if(!pa||!pb){
			return false;
		}
		return pa.x == pb.x && pa.y == pb.y;
	}


	// *************************************************************************
	// 基础range函数 END
	// *************************************************************************





}