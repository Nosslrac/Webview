import * as d3 from 'd3';

//const vscode = acquireVsCodeApi();
const nodes: {x: number, y:number, r:number}[] = [
	{x: 318, y: 406.1362404883912, r: 9.883769433530093}
	,{x: 618.1853922784688, y: 228.89955918759264, r: 14.293943127145978}
	,{x: 608.1118490726993, y: 318.228821998656, r: 4.096318297201325}
	,{x: 578.5010827188122, y: 191.25649952618855, r: 9.489439277866362}
	,{x: 435.05094150089406, y: 217.3979518283997, r: 12.56926039969278}
	,{x: 778.05760368232, y: 180.0143442902383, r: 4.907285147176157}
	,{x: 495.9684929275607, y: 455.3183109441993, r: 9.046257565473557}
	,{x: 566.7907113931894, y: 204.8659697151308, r: 6.204430761114572}
	,{x: 652.1004242098354, y: 199.03852965182773, r: 6.876327508586906}
];
	const w = 200;
	const h = 200;

	const sim = d3.forceSimulation(nodes)
	.force("x", d3.forceX(w / 2)) 
	.force("y", d3.forceY(h / 2));


	const svg = d3.select('svg');

	svg
	.append('circle')
	.attr('cx', '1')
	.attr('cy', '1')
	.attr('r', 20)
	.style('fill', 'white');
	svg
	.append('circle')
	.attr('cx', '20')
	.attr('cy', '20')
	.attr('r', 20)
	.style('fill', 'green');
	svg
	.append('circle')
	.attr('cx', '69')
	.attr('cy', '60')
	.attr('r', 20)
	.style('fill', 'red');
	sim.restart();

const counter: any = document.getElementById('lines-of-code-counter');
let currentCount:any= counter?.textContent;
console.log('D3:', d3);

export function getRandom(): number{

	counter.textContent = `${currentCount++}`;
	

	return currentCount;
}


export function drawGraph(){
	sim.tick();
}





