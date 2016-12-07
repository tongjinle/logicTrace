namespace Client {
	export class Hud extends egret.Sprite {
		private reset: egret.Bitmap;
		private pbar: Client.PointBar;
		constructor() {
			super();

			this.once(egret.Event.ADDED_TO_STAGE, this.addToStage, this);
			this.bind();
		}

		addToStage() {
			this.width = this.stage.stageWidth;
			this.height = 100;
			this.createReset();
		}

		createProgress(totolCount: number) {
			let pbar = this.pbar =  new PointBar(totolCount);
			pbar.x = 50;
			pbar.y = this.height / 2;
			this.addChild(pbar);
		};

		createReset() {
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

		bind() {
			app.onMsg(Events.loadMap, (boxList: Logic.Box[][]) => {
				let sum = 0;
				// boxList.forEach(row => (box: Logic.Box) => sum += (box.type == Logic.boxType.source ? (box as SourceBox).paintedCount : 0));
				boxList.forEach(row => row.forEach(box => {
					if (box.type == Logic.boxType.source) {
						let so = box as Logic.SourceBox;
						sum += so.paintedCount;

					}

				}));
				this.createProgress(sum);
			});

			app.onMsg(Events.drag, (effe: { action: string, count: number }) => { 
				let pbar = this.pbar;
				let currCount = pbar.currCount + (effe.action == 'add' ? effe.count : -effe.count);
				pbar.setProgress(currCount);
			});
		}

	}
}