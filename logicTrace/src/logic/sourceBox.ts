namespace Logic {
	export class SourceBox extends Box {
		// 颜色
		color: number;
		// 产生的paintedBox的个数
		constructor(public paintedCount: number) {
			super();
			this.type = boxType.source;
		}
	}
}
