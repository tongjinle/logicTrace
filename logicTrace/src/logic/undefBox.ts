namespace Logic {
	export class UndefBox extends Box {

		constructor() {
			super();
			this.type = boxType.undef;
		}
	}
}