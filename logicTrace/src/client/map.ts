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

		loadData(boxList: Logic.Box[][]) {
			this.removeChildren();
			boxList.forEach((row, y) => {
				row.forEach((bo, x) => {
					this.addBox(bo);
				});
			});
		}



		private addBox(lBox: Logic.Box) {
			// let bo:Client. Box;
			let type: boxType = lBox.type == Logic.boxType.source ? boxType.source : boxType.painted;
			let bo = new Box(type, lBox);
			bo.x = lBox.posi.x * this.boxSize;
			bo.y = lBox.posi.y * this.boxSize;
			this.addChild(bo);
		}


	}
}