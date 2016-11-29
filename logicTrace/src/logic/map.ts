namespace Logic {

 export	class Map {
		boxList: Box[][];
		constructor(public width: number, public height: number) {
			let boxList = this.boxList = [];
			this.visit((bo, x, y, list) => {
				list[y][x] = Box.create(boxType.undef);
				return true;
			});

			while (this.insert());

			while (this.merge());

		}

		private visit(fn: (bo: Box, x: number, y: number, boxList: Box[][]) => boolean) {
			for (var y = 0; y < this.height; y++) {
				this.boxList[y] = this.boxList[y] || [];
				for (var x = 0; x < this.width; x++) {
					let bo = this.boxList[y][x];
					if (!fn(bo, x, y, this.boxList)) {
						return;
					}

				}
			}
		}

		private insert(): boolean {
			let un: Box = this.findUndef();
			if (!un) {
				return false;
			}

			let extList = this.findExtendList(un.posi);
			if (!extList.length) {
				return false;
			}

			let rate = 1;
			let bo: SourceBox;
			while (this.passRate(rate) && extList.length) {
				// 创建sourceBox
				if (!bo) {
					bo = this.boxList[un.posi.y][un.posi.x]
						= Box.create(boxType.source, { paintedCount: 0 }) as SourceBox;
				}
				bo.paintedCount++;

				// paint
				let index = Math.floor(Math.random() * extList.length);
				let ext = extList[index];
				extList.splice(index, 1);
				let pa = this.boxList[ext.y][ext.x]
					= Box.create(boxType.painted, { sourceId: bo.id });

				// rate降低概率
				rate *= (3 / 4);
			}

			return true;

		}

		// 尝试合并
		private merge(): boolean {
			let un: Box = this.findUndef();
			if (!un) {
				return false;
			}

			// 周围格子
			let near = map2d.nearRange(un.posi, 1)
				.filter(posi => !this.isOut(posi));

			let flag = false;
			// pa => un的相邻的paintedBox
			// so => pa的sourceBox
			// 1.尝试连接
			// 如果un跟so的方向和pa跟so的方向一致,则尝试连接
			flag = near
				.filter(posi => this.boxList[posi.y][posi.x].type == boxType.painted)
				.some(posi => {
					let pa: PaintedBox = this.boxList[posi.y][posi.x] as PaintedBox;
					let so: SourceBox = this.findSource(pa.sourceId);


					if (map2d.getDirection(pa.posi, so.posi) == map2d.getDirection(un.posi, so.posi)) {
						this.boxList[un.posi.y][un.posi.x] = Box.create(boxType.painted, { sourceId: so.id });
						so.paintedCount++;
						return true;
					}
					return false;
				});

			// 2.切割
			// 如果1方案不能成立
			// 如果邻居是paintedBox,则切下pa,让un成为sourceBox,让pa指向un
			// 如果邻居是sourceBox,则把un指向so
			if (!flag) {
				near.some(posi => {
					let ne: Box = this.boxList[posi.y][posi.x];
					if (ne.type == boxType.source) {
						let so = ne as SourceBox;
						let pa = this.boxList[un.posi.y][un.posi.x] = Box.create(boxType.painted) as PaintedBox;
						pa.sourceId = so.id;
						so.paintedCount++;
					} else if (ne.type == boxType.painted) {
						let so = this.boxList[un.posi.y][un.posi.x] = Box.create(boxType.source) as SourceBox;
						let pa = this.boxList[posi.y][posi.x] as PaintedBox;
						let lastSo = this.findSource(pa.sourceId);
						lastSo.paintedCount--;
						pa.sourceId = so.id;

					}
					return true;
				});
			}


			// 合并"1"和"1"

			return true;
		}

		// 从paintedBox的sourceId寻找sourceBox
		private findSource(sourceId: number): SourceBox {
			let so: SourceBox;
			this.visit(bo => {
				if (bo.id == sourceId) {
					so = bo as SourceBox;
					return true;
				}
			});
			return so;
		}

		// 寻找undef的格子
		private findUndef(): UndefBox {
			let un = undefined;
			let boList: Box[] = [];
			this.visit((bo, x, y, list) => {
				if (bo.type == boxType.undef) {
					boList.push(bo);
				}
				return true;
			});
			if (boList.length) {
				un = boList[Math.floor(Math.random() * boList.length)];
			}
			return un;
		}

		// 格子周围是不是有可以延伸的格子(用以paint)
		private findExtendList(posi: map2d.IPosition): map2d.IPosition[] {
			let list: map2d.IPosition[];
			list = map2d.nearRange(posi, 1)
				.filter(posi => !this.isOut(posi))
				.filter(posi => {
					return this.boxList[posi.y][posi.x].type == boxType.undef;
				});
			return list;
		}


		// 是否坐标超出地图
		private isOut(posi: map2d.IPosition): boolean {
			return posi.x < 0 || posi.y < 0 || posi.x >= this.width || posi.y >= this.height;


		}

		// 能否通过概率
		private passRate(rate: number): boolean {
			return Math.random() <= rate;
		}
	}


}