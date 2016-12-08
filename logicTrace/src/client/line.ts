namespace Client {
	export class Line extends egret.Sprite {
		private boxSize: number = config.boxSize;

		color: number = config.lineColor;
		from: map2d.IPosition;
		to: map2d.IPosition;

		constructor(from: map2d.IPosition, to: map2d.IPosition) {
			super();

			this.from = from;
			this.to = to;

			this.width = this.height = this.boxSize;
			this.anchorOffsetX = this.width / 2;
			this.anchorOffsetY = this.height / 2;

			this.draw(this.from, this.to);

			if (this.from.x != this.to.x) {
				this.rotation = 90;
			}
		}



		draw(from: map2d.IPosition, to: map2d.IPosition) {
			let l = new egret.Shape();
			l.width = this.width;
			l.height = this.height;
			l.graphics.lineStyle(.1 * this.boxSize, this.color);
			l.graphics.moveTo(this.width / 2, 0);
			l.graphics.lineTo(this.width / 2, this.height);
			this.addChild(l);

		}

		is(from: map2d.IPosition, to: map2d.IPosition) {
			return (map2d.isPositionEqual(this.from, from) && map2d.isPositionEqual(this.to, to)) ||
				(map2d.isPositionEqual(this.from, to) && map2d.isPositionEqual(this.to, from));

		}
	}
}