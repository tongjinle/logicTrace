namespace Logic {
	export class SourceBox extends Box {
		// 颜色
		color: number;
		// 产生的paintedBox的个数
		paintedCount: number;
		// 已经涂满的paintedBox的id列表
		paintIdList: number[];
		constructor() {
			super();
			this.type = boxType.source;
			this.paintedCount = 0;
			this.paintIdList = [];
		}
	}
}
