
namespace Client {
	let boxSize = config.boxSize;
	let emptyColor = config.emptyColor;

	export class Box extends egret.Sprite {
		type: boxType;

		// sourceBox下,isFull表示已经涂满
		isFull: boolean;
		// sourceBox下,countText来显示sourceBox下面多少个paintedBox
		countText: egret.TextField;

		// paintedBox下,isPainted表示已经涂好
		isPainted: boolean;

		// color:
		private color: number;

		private brick: egret.Shape;

		constructor(type: boxType, opts: any) {
			super();
			this.color = opts.color;

			let br = this.brick = new egret.Shape();
			br.graphics.beginFill(emptyColor, .5);
			br.graphics.drawRoundRect(0, 0, boxSize, boxSize, .2 * boxSize);
			br.graphics.endFill();
			this.addChild(br);

			if (type == boxType.source) {

				let co = this.countText = new egret.TextField();
				co.text = opts.paintedCount;
				this.addChild(co);
				this.isFull = false;

			} else if (type == boxType.painted) {
				this.isPainted = false;
			}
		}

		// 当sourceBox的从属的paintedBox被涂满的时候,sourceBox要旋转一周
		rotate() {
			if (this.type == boxType.source) {
				let co = this.countText;
				egret.Tween.get(co).to({ rotation: 360 }, 500);
			}
		}

		// paintedBox被涂到的时候...
		paint(isPainted: boolean) {
			if (isPainted == this.isPainted) {
				return;
			}
			let br = this.brick;
			let color = isPainted ? this.color : emptyColor;
			br.graphics.beginFill(color);
			br.graphics.drawRoundRect(0, 0, boxSize, boxSize, .2 * boxSize);
			br.graphics.endFill();
			br.alpha = isPainted ? .5 : 1;
		}

		change() { }
	}


	export enum boxType {
		source,
		painted
	}
}