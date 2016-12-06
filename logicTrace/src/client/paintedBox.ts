namespace Client {
	export class PaintedBox extends Box {
		sourceId: number;

		constructor(id: number,  posi: map2d.IPosition) {
			super(id, boxType.painted, posi);

		}
		// paintedBox被涂到的时候...
		paint(isPaint: boolean, sourceId?: number, color?: number) {
			if (isPaint) {
				this.sourceId = sourceId;
				this.renderBrickColor(color);
			} else {
				this.sourceId = undefined;
				this.renderBrickColor(this.emptyColor);
			}



		}
	}
}
