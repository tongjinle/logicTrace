namespace Client {
	class App extends egret.EventDispatcher {

		holder: egret.DisplayObjectContainer;
		hud: Hud;
		map: Map;
		catList: Cat[];


		init(holder: egret.DisplayObjectContainer) {
			this.holder = holder;

			let hud = this.hud = new Hud();
			hud.x = 0;
			hud.y = 0;
			this.holder.stage.addChild(hud);

			let map = this.map = new Map();
			map.x = 0;
			map.y = hud.height;
			map.width = this.holder.stage.stageWidth;
			map.height = this.holder.stage.stageHeight - this.hud.height;
			this.holder.stage.addChild(map);
			console.log(this.holder.stage.getChildIndex(map), 'map');



		}




		// 第一个元素保存touchBegin的posi
		// 第二个元素保存touchEnd的posi
		private touchStack: map2d.IPosition[] = [];

		

		// 接受来自UI的事件信息
		acceptMsg(name: string, data?: any) {
			let dict: { [index: string]: (ev: string, data: any) => void } = {};

			dict[Events.hudReset] = (ev, data) => {
				// let opts = { width: 2, height: 2 };
				let opts = { width: 6, height: 8 };
				Server.app.createMap(opts, (data: Logic.Map) => {
					
					console.log(data.boxList);
					this.map.loadData(data.boxList);

					this.pushMsg(Events.loadMap, data.boxList);
				});


			};


			dict[Events.boxTouchBegin] = (ev, data) => {
				this.touchStack.length = 0;
				this.touchStack.push(data.posi);
			};


			dict[Events.boxTouchEnd] = (ev, data) => {
				this.touchStack.push(data.posi);

				let from = this.touchStack[0];
				let to = this.touchStack[1];
				type DragInfo = { err: any, action?: string, sourceId?: number, posiList?: map2d.IPosition[] };
				Server.app.drag({ from, to }, (data: { isWin: boolean, dragInfo: DragInfo }) => {
					let dragInfo = data.dragInfo;
					if (!dragInfo.err) {
						console.log(dragInfo.action);
						console.log(dragInfo.sourceId);
						console.log(dragInfo.posiList);
						this.map.process(dragInfo.action, dragInfo.sourceId, dragInfo.posiList);

						this.pushMsg(Events.drag, {
							action: dragInfo.action,
							count: dragInfo.posiList.length
						});

					} else {
						console.log(dragInfo.err);
					}

					if (data.isWin) {
						this.pushMsg(Events.win);
					}
				});


			};



			dict[name](name, data);

		}


		// 通知UI事件信息
		pushMsg(name: string, data?: any) {
			let dict = this.uiMsgDict;
			let list: uiMsgCallback[] = dict[name] = dict[name] || [];

			list.forEach(fn => fn(data));
		}

		// UI绑定监听Msg
		private uiMsgDict = {};
		onMsg(name: string, fn: uiMsgCallback) {
			let dict = this.uiMsgDict;
			let list = dict[name] = dict[name] || [];

			list.push(fn);

		}


	}
	type uiMsgCallback = (data?: any) => void;


	export let app = new App();

}