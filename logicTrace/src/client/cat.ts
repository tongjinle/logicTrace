namespace Client {
	export class Cat extends egret.Sprite {

		private img: egret.Bitmap;
		bound: { x: number, y: number, width: number, height: number };
		private dire: map2d.Direction = map2d.Direction.down;
		private isMove: boolean;

		constructor() {
			super();

			this.createImg();
			this.width = this.img.width;
			this.height = this.img.height;
			this.anchorOffsetX = this.width / 2;
			this.anchorOffsetY = this.height / 2;

			this.bind();
		}

		createImg() {
			let img = this.img = new egret.Bitmap();
			img.texture = RES.getRes('cat_png');
			this.img.scaleX = this.img.scaleY = .1;
			this.addChild(img);
		}

		enterMap(next) {
			this.x = Math.floor(this.bound.width * Math.random()) + this.bound.x;
			this.y = Math.floor(this.bound.height * Math.random()) + this.bound.y;

			let img = this.img;
			egret.Tween.get(img).to({ scaleX: 1, scaleY: 1 }, 500, egret.Ease.backOut)
				.call(next);
		}

		move(isChangeDire: Boolean = false) {
			if (!this.isMove) {
				return;
			}
			if (isChangeDire || Math.random() < .05) {
				let direList = [map2d.Direction.up,
				map2d.Direction.right,
				map2d.Direction.down,
				map2d.Direction.left]
					.filter(dire => dire != this.dire);
				let dire: map2d.Direction = direList[Math.floor(direList.length * Math.random())];
				this.changeDire(dire);
			}
			let step: number = config.catStep;
			let nextX = this.dire == map2d.Direction.left ? this.x - step
				: this.dire == map2d.Direction.right ? this.x + step : this.x;
			let nextY = this.dire == map2d.Direction.up ? this.y - step
				: this.dire == map2d.Direction.down ? this.y + step : this.y;

			// console.log(nextX, nextY);
			// console.log(this.bound);
			// console.log('**************');
			if (nextX >= this.bound.x
				&& nextX <= this.bound.x + this.bound.width
				&& nextY >= this.bound.y
				&& nextY <= this.bound.y + this.bound.height) {

				this.x = nextX;
				this.y = nextY;
				// console.log('move!');
				// this.move();
			} else {
				// console.log('change dire!');
				this.move(true);

			}
		}

		resume() {
			this.isMove = true;
		}

		stop() {
			this.isMove = false;
		}

		changeDire(dire: map2d.Direction) {
			this.dire = dire;
			if (this.dire == map2d.Direction.right) {
				this.skewY = 180;
			} else if (this.dire == map2d.Direction.left) {
				this.skewY = 0;
			}
		}


		bind() {
			let loopTw: egret.Tween;

			// 猫猫在地图加载的时候会在地图上显示
			app.onMsg(Events.loadMap, () => {
				this.enterMap(() => {
					loopTw && loopTw.pause();
					this.rotation = 0;
					this.scaleX = this.scaleY = 1;
					this.resume();
				});
			});

			// 猫猫在胜利之后,会停止移动,变大,而后摇摆
			app.onMsg(Events.win, () => {
				this.stop();
				egret.Tween.get(this)

					.to({ scaleX: 1.5, scaleY: 1.5 }, 200, egret.Ease.bounceInOut)
					.call(() => {
						// if(!loopTw){
							loopTw = 
							egret.Tween.get(this, { loop: true })
								.to({ rotation: 30 }, 500)
								.to({ rotation: -30 }, 500)
								.to({ rotation: 0 }, 500)
							
						// }
						// egret.Tween.resumeTweens(this);

						// loopTw.setPaused(false);
					});
			});

			// 猫猫的定时移动
			let timer = new egret.Timer(100, 0);
			timer.start();
			timer.addEventListener(egret.TimerEvent.TIMER, () => {
				this.move();
			}, this);

			// 猫猫被touch会发出叫声
			this.touchEnabled = true;
			this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, () => {
				let sou: egret.Sound = RES.getRes('miao_mp3');
				sou.play(0, 1);
			}, this.img);
		}
	}
}