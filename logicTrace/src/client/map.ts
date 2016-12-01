namespace Client {
	export class Map extends egret.Sprite {
		private boxSize: number = config.boxSize;



		constructor() {
			super();
			this.once(egret.Event.ADDED_TO_STAGE, this.addToStage, this);
		}

		addToStage() {
			this.width = this.stage.stageWidth;

			this.height = 400;

		}


		private colorMap;

		private setColorMap(boxList:Logic.Box[][]){
			this.colorMap = {};

			_.flatten (boxList)
			.filter((bo:Logic.Box)=>bo.type == Logic.boxType.source)
			.forEach((bo:Logic.Box)=>{
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



		private addBox(lBox: Logic.Box) {
			// let bo:Client. Box;
			let type: boxType;
			let opts;

			if (lBox.type == Logic.boxType.source) {
				type = boxType.source;
				let lSo = lBox as Logic.SourceBox;
				opts = {
					paintedCount: lSo.paintedCount,
					color:this.colorMap[lSo.id]
				}
			} else {
				type = boxType.painted;
				let lPa = lBox as Logic.PaintedBox;
				opts = {
					sourceId: lPa.sourceId,
					isPainted: lPa.isPainted,
					color:this.colorMap[lPa.sourceId]
				}
			}
			opts.posi =_.clone( lBox.posi);

			let bo = new Box(type, opts);
			bo.x = opts.posi.x * this.boxSize;
			bo.y = opts.posi.y * this.boxSize;
			this.addChild(bo);
		}


	}
}