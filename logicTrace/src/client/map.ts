namespace Client {
	export class Map extends egret.Sprite {
		private boxSize: number = config.boxSize;



		constructor() {
			super();
			this.once(egret.Event.ADDED_TO_STAGE, this.addToStage, this);
			this.boxList = [];

			this.bind();
		}

		addToStage() {
			this.width = this.stage.stageWidth;
		}

		private catList: Cat[] = [];
		private addCatList(){
			let catCount = config.catCount;
			let len = this.catList.length;
			while (catCount--) {
				// this.catList.push()
				let ca: Cat;
				if(len){
					ca = this.catList[catCount];
					console.log('use cache cat');	
				}
				else{
					ca =  new Cat();
					this.catList.push(ca);
					console.log('use new cat');
				} 
				ca.bound = {
					x: this.x + ca.width / 2,
					y: this.y + ca.height / 2,
					width: this.width - ca.width,
					height: this.height - ca.height
				};
				this.addChild(ca);
			}
		}


		private colorMap;

		private setColorMap(boxList: Logic.Box[][]) {
			this.colorMap = {};

			_.flatten(boxList)
				.filter((bo: Logic.Box) => bo.type == Logic.boxType.source)
				.forEach((bo: Logic.Box) => {
					this.colorMap[bo.id] = Math.floor(0xffffff * Math.random());
				});

			// this.height = boxList.length * this.boxSize;
		}

		loadData(boxList: Logic.Box[][]) {
			this.setColorMap(boxList);

			this.removeChildren();
			boxList.forEach((row, y) => {
				row.forEach((bo, x) => {
					this.addBox(bo);
				});
			});

			// resize
			this.width = boxList[0].length * this.boxSize;
			this.height = boxList.length * this.boxSize;

			// reset map position
			this.x = this.stage.stageWidth / 2 - boxList[0].length * this.boxSize / 2;

			// 加猫猫
			this.addCatList();
		}


		boxList: Box[][];
		private addBox(lBox: Logic.Box) {

			let bo: Box;
			if (lBox.type == Logic.boxType.source) {
				let lSo = lBox as Logic.SourceBox;
				bo = new SourceBox(lSo.id, lSo.posi, this.colorMap[lSo.id], lSo.paintedCount);
			} else if(lBox.type == Logic.boxType.painted) {
				let lPa = lBox as Logic.PaintedBox;
				bo = new PaintedBox(lPa.id, lPa.posi);
			} else{
				let lUn = lBox as Logic.UndefBox;
				bo = new UndefBox(lUn.id, lUn.posi);
			}

			// 设定在屏幕上的坐标
			this.addChild(bo);
			this.fallBox(bo);

			let boxList = this.boxList;
			let row = boxList[bo.posi.y] = boxList[bo.posi.y] || [];
			row[bo.posi.x] = bo;
		}

		private fallBox(bo: Box) {
			let taPosi: map2d.IPosition = { x: bo.posi.x * this.boxSize, y: bo.posi.y * this.boxSize };
			bo.x = taPosi.x;
			let dura = 200 + Math.random() * 100 * bo.posi.y;
			egret.Tween.get(bo).to({ y: taPosi.y }, dura, egret.Ease.bounceOut);
		}

		process(action: string, sourceId: number, posiList: map2d.IPosition[]) {
			let boxList = this.boxList;



			if (action == 'add') {
				posiList
					.map(po => boxList[po.y][po.x])
					.forEach((bo: PaintedBox) => {
						bo.paint(true, sourceId, this.colorMap[sourceId]);
					});

				this.drawLineList(posiList, false);
			} else if (action == 'sub') {
				this.drawLineList(posiList, true);
				posiList
					.map(po => boxList[po.y][po.x])
					.forEach((bo: PaintedBox) => {
						bo.paint(false);
					});
			}


			let so: SourceBox = this.findSourceBox(sourceId);

			so.isFull = this.sumPaintedCount(sourceId) == so.paintedCount;
			so.tryRotate();




		}

		private lineList: Line[] = [];
		private drawLine(from: map2d.IPosition, to: map2d.IPosition, isClear: boolean = true) {
			if (!isClear) {
				let line = new Line(from, to);
				line.x = (from.x + to.x + 1) / 2 * this.boxSize;
				line.y = (from.y + to.y + 1) / 2 * this.boxSize;
				this.addChild(line);
				this.setChildIndex(line, 0);
				this.lineList.push(line);
			} else {
				this.lineList.forEach((line, i) => {
					if (line.is(from, to)) {
						this.removeChild(line);
						this.lineList.splice(i, 1);
					}
				});
			}

		}

		private drawLineList(posiList: map2d.IPosition[], isClear: boolean) {
			// line
			if (posiList.length) {

				let sortFn = (poa: map2d.IPosition, pob: map2d.IPosition) => (poa.x * 10000 + poa.y) - (pob.x * 10000 + pob.y);
				let sorted = posiList
					.map(posi => { return { x: posi.x, y: posi.y }; })
					.sort(sortFn)
					;
				// linkPosi
				let linkPosi: map2d.IPosition;
				// header
				let near: map2d.IPosition[];
				let findLinkPosi = (spo: map2d.IPosition, posiList: map2d.IPosition[]) => {
					let spa = this.boxList[spo.y][spo.x] as PaintedBox;

					let lp: map2d.IPosition;
					map2d.nearRange(spo, 1)
						.filter(posi => posi.x >= 0 && posi.x < this.boxList[0].length && posi.y >= 0 && posi.y < this.boxList.length)
						.some(posi => {
							if (posiList.some(posi2 => map2d.isPositionEqual(posi, posi2))) {
								return false;
							};


							let bo = this.boxList[posi.y][posi.x];
							if (bo.type == boxType.painted) {
								let pa = bo as PaintedBox;
								if (pa.sourceId == spa.sourceId) {
									lp = posi;
									return true;
								}
							} else if (bo.type == boxType.source) {
								let so = bo as SourceBox;
								if (so.id == spa.sourceId) {
									lp = posi;
									return true;
								}
							}
						})
						;
					return lp;
				};

				linkPosi = findLinkPosi(sorted[0], sorted)
					|| findLinkPosi(sorted[sorted.length - 1], sorted);

				sorted.push(linkPosi);
				sorted = sorted.sort(sortFn);

				sorted.forEach(posi => console.log(posi.x, posi.y));

				sorted.forEach((posi, i, list) => {
					if (i == list.length - 1/* && action == 'add'*/) {
						return;
					}
					let next = list[i + 1];
					this.drawLine(posi, next, isClear);
				});

			}
		}

		celebrate() {

		}

		private sumPaintedCount(sourceId: number): number {
			return _.flatten(this.boxList)
				.filter((bo: Box) => bo.type == boxType.painted && (bo as PaintedBox).sourceId == sourceId)
				.length;
		}

		private findSourceBox(sourceId: number): SourceBox {
			return _.find(_.flatten(this.boxList), (bo: Box) => bo.type == boxType.source && bo.id == sourceId) as SourceBox;
		}

		bind(){
			app.onMsg(Events.win, () => {
				let sou :egret.Sound = RES.getRes('win_mp3');
				sou.play(0, 1);

			 });
		}



	}
}