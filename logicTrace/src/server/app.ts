/// <reference path="../../libs/underscore/underscore.d.ts" />

namespace Server {
	class App {
		private map: Logic.Map;
		createMap(opts, next: (map: Logic.Map) => void): void {
			let map =this.map =  new Logic.Map(opts.width, opts.height);
			next(map);
		}


		drag(opts: { from: map2d.IPosition, to: map2d.IPosition }, next: (data) => void): void {
			if(!this.map){
				next({ err: 'NO map' });
				return;
			}
			let dragInfo = this.map.drag(opts.from, opts.to);
			let isWin = this.map.isWin();
			next({dragInfo,isWin});
		}

	}
	export let app = new App();
}
