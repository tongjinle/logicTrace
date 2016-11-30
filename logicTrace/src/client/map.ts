namespace Client {
	class Map extends egret.Sprite {
		private boxSize: number = config.boxSize;



		constructor(boxList:Logic.Box[]) {
			super();
			boxList.forEach(bo=>this.addBox(bo));
		}

		addBox(lBox:Logic.Box){
			let bo = new Box(lBox.type, lBox);
			bo.x = lBox.posi.x * this.boxSize;
			bo.y = lBox.posi.y * this.boxSize;
			this.addChild(bo);
		}


	}
}