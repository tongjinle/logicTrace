namespace Client {
	class App extends egret.EventDispatcher {

		holder: egret.DisplayObjectContainer;
		hud: Hud;
		canvas: any;


		init(holder: egret.DisplayObjectContainer) {
			// this.holder = holder;

			// this.hud = new Hud();
			// this.hud.x = 0;
			// this.hud.y = 0;
			// this.holder.stage.addChild(this.hud);
		}

		req(name: string, opts: any, next: (data) => void) {
			if (name == 'createMap') {
				Server.app.createMap(opts, next);
			}
		}

		acceptMsg(name: string) {
			if (name == 'reset') {
				let opts = { width: 2, height: 3 };
				this.req('createMap', opts, (data: Logic.Map) => {
					console.log(data.boxList);
				});
			}
		}
	}


	export let app = new App();

}