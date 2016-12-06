namespace Logic {

	export class PaintedBox extends Box {
		// 是否已经被涂抹
		isPainted: boolean = false;
		// 建立的地图时候,paintedBox的sourceBox
		sourceId: number;
		// drag造成的sourceId
		dragSourceId: number;
		
		constructor( sourceId: number) {
			super();
			this.sourceId = sourceId;
			this.type = boxType.painted;
		}
	}
}