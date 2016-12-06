
namespace Client {


	export class Box extends egret.Sprite {
		protected emptyColor = config.emptyColor;
		protected boxSize = config.boxSize;

		id: number;

		posi: map2d.IPosition;
		type: boxType;



		// paintedBox下,isPainted表示已经涂好
		isPainted: boolean;
		sourceId: number;

		// color:
		protected color: number;

		protected brick: egret.Shape;
		private brickSize = .8 * this.boxSize;
		private radiusSize = .2 * this.boxSize;

		constructor(id: number, type: boxType, posi: map2d.IPosition) {
			super();
			this.id = id;
			this.type = type;
			this.width = this.boxSize;
			this.height = this.boxSize;
			this.posi = _.clone(posi);
			this.createBrick();

			this.bind();

		}

		private createBrick() {

			let br = this.brick = new egret.Shape();
			br.anchorOffsetX = this.brickSize / 2;
			br.anchorOffsetY = this.brickSize / 2;
			br.x = this.width / 2;
			br.y = this.height / 2;

			this.renderBrickColor(this.emptyColor);

			this.addChild(br);
		}

		protected renderBrickColor(color:number){
			let br = this.brick;
			br.graphics.beginFill(color);
			br.graphics.drawRoundRect(0, 0, this.brickSize, this.brickSize, this.radiusSize);
			br.graphics.endFill();
		}







		bind() {
			this.touchEnabled = true;
			this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, e => {

				console.log(this.posi);
				app.acceptMsg(Events.boxTouchBegin, { posi: this.posi });
			}, this);

			this.addEventListener(egret.TouchEvent.TOUCH_END, e => {
				console.log(this.posi);
				app.acceptMsg(Events.boxTouchEnd, { posi: this.posi });
			}, this);


		}



		
	}


	export enum boxType {
		source,
		painted
	}
}