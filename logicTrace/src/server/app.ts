/// <reference path="../../libs/underscore/underscore.d.ts" />

namespace Server {
	export let app = {
		createMap: (opts): Logic.Map => {
			let map = new Logic.Map(opts.width, opts.height);
			return map;
		}
	};
}
