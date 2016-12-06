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

		}

		celebrate(){
			
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