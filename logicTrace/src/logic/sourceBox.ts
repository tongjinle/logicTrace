namespace Logic {
	export class SourceBox extends Box {
		// 颜色
		color: number;
		// 产生的paintedBox的个数
		paintedCount: number;
		constructor() {
			super();
			this.type = boxType.source;
			this.paintedCount = 0;
		}
	}
}
