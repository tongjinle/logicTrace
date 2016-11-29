namespace Client {
	export let app = {
		req: (name: string, opts: any, next: (data) => void) => {
			if (name == 'createMap') {
				Server.app.createMap(opts, next);
			}
		}
	};
}