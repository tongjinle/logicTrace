namespace Client {
	class App extends egret.EventDispatcher {

		holder: egret.DisplayObjectContainer;
		hud: Hud;
		map: Map;
		canvas: any;


		init(holder: egret.DisplayObjectContainer) {
			this.holder = holder;

			let hud = this.hud = new Hud();
			hud.x = 0;
			hud.y = 0;
			this.holder.stage.addChild(hud);

			let map = this.map = new Map();
			map.x = 0;
			map.y = hud.height;
			this.holder.stage.addChild(map);

		}

		req(name: string, opts: any, next: (data) => void) {
			if (name == 'createMap') {
				Server.app.createMap(opts, next);
			}
		}

		acceptMsg(name: string) {
			if (name == 'start' || name == 'reset') {
				let opts = { width: 3, height: 5 };
				this.req('createMap', opts, (data: Logic.Map) => {
					console.log(data.boxList);
					this.map.loadData(data.boxList);
				});
			}
		}
	}


	export let app = new App();

}