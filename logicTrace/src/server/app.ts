/// <reference path="../../libs/underscore/underscore.d.ts" />

namespace Server {
	export let app = {
		createMap: (opts, next: (map: Logic.Map) => void): void => {
			let map = new Logic.Map(opts.width, opts.height);
			next(map);
		}
	};
}
