namespace Client {
	export class PointBar extends egret.Sprite {

		currCount: number;
		private totalCount: number;
		private bar: egret.Shape;


		private barWidth = 300;
		private barHeight = 50;
		private barRadius = this.barHeight / 2;

		constructor(totalCount: number) {
			super();

			this.currCount = 0;
			this.totalCount = totalCount;

			this.width = this.barWidth;
			this.height = this.barHeight;

			this.createBar();
			
			this.bind();
		}

		setProgress(currCount) {
			this.currCount = currCount;
			let perc = (this.currCount / this.totalCount);
			this.renderBar(perc);
		}

		private createBar() {
			// text
			let te = new egret.TextField();
			te.text = 'SCORE:';
			te.anchorOffsetY = te.height / 2;
			this.addChild(te);

			let progMargin = 150;
			// bg
			let bg = new egret.Shape();
			bg.graphics.beginFill(0xCAE1FF, .4);
			bg.graphics.drawRoundRect(0, 0, this.barWidth, this.barHeight, this.barRadius);
			bg.graphics.endFill();
			bg.x = progMargin;
			bg.anchorOffsetY = bg.height / 2;
			this.addChild(bg);

			let ba = this.bar = new egret.Shape();
			ba.x = progMargin;
			ba.graphics.beginFill(0xC0FF3E, .8);
			ba.graphics.drawRoundRect(0, 0, this.barWidth, this.barHeight, this.barRadius);
			ba.graphics.endFill();
			ba.anchorOffsetY = ba.height / 2;
			this.addChild(ba);

			this.setProgress(0);
		}

		private renderBar(perc: number) {
			let ba = this.bar;
			egret.Tween.get(ba).to({ scaleX: perc }, 500, egret.Ease.bounceInOut);
			// ba.graphics.beginGradientFill(
			// 	egret.GradientType.LINEAR, 
			// 	[0x00ff00, 0x0000ff], 
			// 	[.3, .8], 
			// 	[100, 255]
			// );

		}

		bind(){
			app.onMsg(Events.loadMap, () => this.renderBar(0));
		}

	}
}