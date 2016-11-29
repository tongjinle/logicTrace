/// <reference path="./map.ts" />

namespace Logic {

	// 一个空格
	export class BlankBox extends Box {

		constructor() {
			super();
			this.type = boxType.blank;
		}
	}
}