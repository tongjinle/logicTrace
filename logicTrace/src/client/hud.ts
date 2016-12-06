namespace Client{
	export class Hud extends egret.Sprite {
		private reset: egret.Bitmap;
		constructor() {
			super();

			this.once(egret.Event.ADDED_TO_STAGE, this.addToStage, this);

		}

		addToStage(){
			this.width = this.stage.stageWidth;
			this.height = 100;
			this.createReset();
			this.createProgress();
		}

		createProgress() { };

		createReset(){
			let s = this.reset = new egret.Bitmap();
			this.addChild(s);
			s.width = 40;
			s.height = 40;
			s.x = this.width - s.width - 40;
			s.y = this.height / 2 - s.height / 2;
			s.texture = RES.getRes('reset');
			// s.texture = RES.getRes('egret_icon_png');
			s.touchEnabled = true;
			s.addEventListener(egret.TouchEvent.TOUCH_TAP, (e) => {
				app.acceptMsg(Events.hudReset);
			}, this);
		}
	}
}