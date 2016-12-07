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

			posiList
				.map(po => boxList[po.y][po.x])
				.forEach((bo: PaintedBox) => {
					if (action == 'add') {
						bo.paint(true, sourceId, this.colorMap[sourceId]);
					} else if (action == 'sub') {
						bo.paint(false);
					}

				});



			let so: SourceBox = this.findSourceBox(sourceId);

			so.isFull = this.sumPaintedCount(sourceId) == so.paintedCount;
			if (so.isFull) {
				so.rotate();
			}

			// line
			let sorted = posiList
				.sort((poa: map2d.IPosition, pob: map2d.IPosition) => (poa.x * 10000 + poa.y) - (pob.x * 10000 + pob.y))
				;
			sorted.forEach((posi, i, list) => {
				if (i == list.length - 1) {
					return;
				}
				let next = list[i + 1];
				this.drawLine(posi, next, action == 'sub');
			});



		}

		private lineList: Line[] = [];
		private drawLine(from: map2d.IPosition, to: map2d.IPosition, isClear: boolean = true) {
			if (!isClear) {
				let line = new Line(from, to);
				line.x = (from.x + to.x) / 2 * this.boxSize;
				line.y = (from.y + to.y) / 2 * this.boxSize;
				this.addChild(line);
				this.setChildIndex(line,0);
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