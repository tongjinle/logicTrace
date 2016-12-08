namespace Client {
	export class Map extends egret.Sprite {
		private boxSize: number = config.boxSize;



		constructor() {
			super();
			this.once(egret.Event.ADDED_TO_STAGE, this.addToStage, this);
			this.boxList = [];
		}

		addToStage() {
			this.width = this.stage.stageWidth;

			this.height = 400;

		}


		private colorMap;

		private setColorMap(boxList: Logic.Box[][]) {
			this.colorMap = {};

			_.flatten(boxList)
				.filter((bo: Logic.Box) => bo.type == Logic.boxType.source)
				.forEach((bo: Logic.Box) => {
					this.colorMap[bo.id] = Math.floor(0xffffff * Math.random());
				});
		}

		loadData(boxList: Logic.Box[][]) {
			this.setColorMap(boxList);

			this.removeChildren();
			boxList.forEach((row, y) => {
				row.forEach((bo, x) => {
					this.addBox(bo);
				});
			});

			// reset map position
			this.x = this.stage.stageWidth / 2 - boxList[0].length * this.boxSize / 2;
		}


		boxList: Box[][];
		private addBox(lBox: Logic.Box) {

			let bo: Box;
			if (lBox.type == Logic.boxType.source) {
				let lSo = lBox as Logic.SourceBox;
				bo = new SourceBox(lSo.id, lSo.posi, this.colorMap[lSo.id], lSo.paintedCount);
			} else {
				let lPa = lBox as Logic.PaintedBox;
				bo = new PaintedBox(lPa.id, lPa.posi);
			}

			// 设定在屏幕上的坐标
			bo.x = bo.posi.x * this.boxSize;
			bo.y = bo.posi.y * this.boxSize;
			this.addChild(bo);

			let boxList = this.boxList;
			let row = boxList[bo.posi.y] = boxList[bo.posi.y] || [];
			row[bo.posi.x] = bo;
		}

		process(action: string, sourceId: number, posiList: map2d.IPosition[]) {
			let boxList = this.boxList;

			

			if (action == 'add') {
				posiList
					.map(po => boxList[po.y][po.x])
					.forEach((bo: PaintedBox) => {
						bo.paint(true, sourceId, this.colorMap[sourceId]);
					});

				this.drawLineList( posiList, false);
			} else if (action == 'sub') {
				this.drawLineList( posiList, true);
				posiList
					.map(po => boxList[po.y][po.x])
					.forEach((bo: PaintedBox) => {
						bo.paint(false);
					});
			}


			let so: SourceBox = this.findSourceBox(sourceId);

			so.isFull = this.sumPaintedCount(sourceId) == so.paintedCount;
			so.tryRotate();

			


		}

		private lineList: Line[] = [];
		private drawLine(from: map2d.IPosition, to: map2d.IPosition, isClear: boolean = true) {
			if (!isClear) {
				let line = new Line(from, to);
				line.x = (from.x + to.x+1) / 2 * this.boxSize;
				line.y = (from.y + to.y+1) / 2 * this.boxSize;
				this.addChild(line);
				this.setChildIndex(line, 0);
				this.lineList.push(line);
			} else {
				this.lineList.forEach((line, i) => {
					if (line.is(from, to)) {
						this.removeChild(line);
						this.lineList.splice(i, 1);
					}
				});
			}

		}

		private drawLineList(posiList:map2d.IPosition[],isClear:boolean){
			// line
			if (posiList.length) {

				let sortFn = (poa: map2d.IPosition, pob: map2d.IPosition) => (poa.x * 10000 + poa.y) - (pob.x * 10000 + pob.y);
				let sorted = posiList
					.map(posi => { return { x: posi.x, y: posi.y }; })
					.sort(sortFn)
					;
				// linkPosi
				let linkPosi: map2d.IPosition;
				// header
				let near: map2d.IPosition[];
				let findLinkPosi = (spo: map2d.IPosition, posiList: map2d.IPosition[]) => {
					let spa = this.boxList[spo.y][spo.x] as PaintedBox;

					let lp: map2d.IPosition;
					map2d.nearRange(spo, 1)
						.filter(posi => posi.x >= 0 && posi.x < this.boxList[0].length && posi.y >= 0 && posi.y < this.boxList.length)
						.some(posi => {
							if (posiList.some(posi2 => map2d.isPositionEqual(posi, posi2))) {
								return false;
							};


							let bo = this.boxList[posi.y][posi.x];
							if (bo.type == boxType.painted) {
								let pa = bo as PaintedBox;
								if (pa.sourceId == spa.sourceId) {
									lp = posi;
									return true;
								}
							} else if (bo.type == boxType.source) {
								let so = bo as SourceBox;
								if (so.id == spa.sourceId) {
									lp = posi;
									return true;
								}
							}
						})
						;
					return lp;
				};

				linkPosi = findLinkPosi(sorted[0], sorted)
					|| findLinkPosi(sorted[sorted.length - 1], sorted);

				sorted.push(linkPosi);
				sorted = sorted.sort(sortFn);

				sorted.forEach(posi => console.log(posi.x, posi.y));

				sorted.forEach((posi, i, list) => {
					if (i == list.length - 1/* && action == 'add'*/) {
						return;
					}
					let next = list[i + 1];
					this.drawLine(posi, next, isClear);
				});

			}
		}

		celebrate() {

		}

		private sumPaintedCount(sourceId: number): number {
			return _.flatten(this.boxList)
				.filter((bo: Box) => bo.type == boxType.painted && (bo as PaintedBox).sourceId == sourceId)
				.length;
		}

		private findSourceBox(sourceId: number): SourceBox {
			return _.find(_.flatten(this.boxList), (bo: Box) => bo.type == boxType.source && bo.id == sourceId) as SourceBox;
		}




	}
}