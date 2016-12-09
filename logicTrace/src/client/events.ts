namespace Client{
	// ui所发送的事件列表
	export class Events {
		static hudReset: string = 'hud.reset';
		static boxTouchBegin: string = 'box.touchBegin';
		static boxTouchEnd: string = 'box.touchEnd';


		static loadMap: string = 'client.loadMap';
		static drag: string = 'client.drag';
		static win: string = 'client.win';
	}
}