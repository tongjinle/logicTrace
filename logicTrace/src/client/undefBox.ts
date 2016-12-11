namespace Client {
	export class UndefBox extends Box {
		sourceId: number;

		constructor(id: number, posi: map2d.IPosition) {
			super(id, boxType.undef, posi);

			let te = new egret.TextField();
			te.textColor = 0x8DB6CD;
			te.text = 'U';
			te.width = this.width;
			te.height = this.height;
			te.verticalAlign = egret.VerticalAlign.MIDDLE;
			te.textAlign = egret.HorizontalAlign.CENTER;
			this.addChild(te);
		}
		
	}
}
