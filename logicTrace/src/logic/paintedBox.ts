namespace Logic {

	export class PaintedBox extends Box {
		// 是否已经被涂抹
		isPainted: boolean = false;
		constructor(public sourceId: number) {
			super();
			this.type = boxType.painted;
		}
	}
}