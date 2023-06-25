import { getRandom, drawGraph } from "./graphDrawer";


setInterval(() => {
	console.log(getRandom());
	drawGraph();
}, 100);

