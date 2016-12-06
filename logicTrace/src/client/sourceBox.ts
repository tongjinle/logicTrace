namespace Client {
	export class SourceBox extends Box {

		// sourceBox下,isFull表示已经涂满
		isFull: boolean;
		// sourceBox下,countText来显示sourceBox下面多少个paintedBox
		countText: egret.TextField;
		// 
		paintedCount: number;


		constructor(id: number,  posi: map2d.IPosition, color: number, paintedCount: number) {
			super(id, boxType.source, posi);
			this.color = color;
			this.paintedCount = paintedCount;
			this.isFull = false;

			this.createCountText();
			this.renderBrickColor(this.color);
			

		}

		private createCountText(){
			let co = this.countText = new egret.TextField();
			co.text = this.paintedCount.toString();
			co.size = this.boxSize / 2;
			co.anchorOffsetX = co.width / 2;
			co.anchorOffsetY = co.height / 2;
			co.x = this.boxSize / 2;
			co.y = this.boxSize / 2;
			this.addChild(co);
		}

		// 当sourceBox的从属的paintedBox被涂满的时候,sourceBox要旋转一周
		rotate() {
			let co = this.countText;
			egret.Tween.get(co).to({ rotation: 360 }, 500);
		}
	}
}