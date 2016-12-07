namespace Client {
	export class Line extends egret.Sprite {
		private boxSize: number = config.boxSize;

		color: number;
		from: map2d.IPosition;
		to: map2d.IPosition;

		constructor(from: map2d.IPosition, to: map2d.IPosition) {
			super();

			this.from = from;
			this.to = to;

			this.width = this.height = this.boxSize;
			// this.anchorOffsetX = this.width / 2;
			// this.anchorOffsetY = this.height / 2;

			this.draw(this.from, this.to);

		}



		draw(from: map2d.IPosition, to: map2d.IPosition) {
			let l = new egret.Shape();
			l.graphics.lineStyle(.1 * this.boxSize, 0xffffff);
			l.graphics.moveTo(this.width / 2, 0);
			l.graphics.lineTo(this.width / 2, this.height);
			this.addChild(l);

			if (from.x != to.x) {
				l.rotation = 90;
			}
		}

		is(from: map2d.IPosition, to: map2d.IPosition) {
			return (map2d.isPositionEqual(this.from, from) && map2d.isPositionEqual(this.to, to)) ||
				(map2d.isPositionEqual(this.from, to) && map2d.isPositionEqual(this.to, from));

		}
	}
}