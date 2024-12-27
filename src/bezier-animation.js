/**
 * @param {number} duration - the duration of the animation in milliseconds
 * @param {boolean} reverse - whether to reverse the animation
 * @param {x: number, y: number, z: number} start - the start point of the animation
 * @param {x: number, y: number, z: number} mid - the mid point of the animation
 * @param {x: number, y: number, z: number} end - the end point of the animation
 * @param {function} update - the function to call on each frame of the animation
 *
 * The animate function uses an easeInOutCubic easing function to animate a point along a bezier curve.
 * It calls requestAnimationFrame to update the point on each frame of the animation.
 * The update function is called on each frame of the animation
 */
export function animate(duration, start, mid, end, update = () => {}) {
	const startTime = Date.now();
	const endTime = startTime + duration;

	// // slow at the beginning and end but also slowing down in the middle of the animation
	// const easeInOutCubic = (t) => {
	// 	return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
	// };
	const easeInOutCubic = (t) => t;

	function step() {
		const currentTime = Date.now();
		const time = Math.max(0, Math.min(1, (currentTime - startTime) / duration));
		const timeFunction = easeInOutCubic(time);
		const x = bezier(start.x, mid.x, end.x, timeFunction);
		const y = bezier(start.y, mid.y, end.y, timeFunction);
		const z = bezier(start.z, mid.z, end.z, timeFunction);
		let shallCancel = update({ x, y, z });
		if (shallCancel) {
			return;
		}
		if (currentTime < endTime) {
			requestAnimationFrame(step);
		}
	}
	requestAnimationFrame(step);
}

function bezier(start, mid, end, progress) {
	const p0 = progressPoint(start, mid, progress);
	const p1 = progressPoint(mid, end, progress);
	return progressPoint(p0, p1, progress);
}

/**
 * @param {number} start - the value to begin with
 * @param {number} end - the value to end with
 * @param {number} progress - the percentage of the way through the animation
 */
function progressPoint(start, end, progress) {
	return start + (end - start) * progress;
}
