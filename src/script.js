import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import gsap from "gsap";
import { animate } from "./bezier-animation";

let idleRotation = {
	x: 0,
	y: 0,
};
let idleProgress = 0;

let camIndex = 0;
const camPositions = [
	// Gesamtübersicht
	{
		duration: 1.5,
		ease: 'power3.inOut',
		timeout: 0,
		pX: 1,
		pY: -0.4,
		pZ: -9,
		rX: Math.PI / 8,
		rY: -Math.PI * 2.25,
		rZ: 0,
	},
	// Hobby Ansicht
	{
		duration: 1.5,
		ease: "power3.inOut",
		timeout: 1.5,
		pX: 0,
		pY: -0.3,
		pZ: 1.44,
		rX: Math.PI / 12,
		rY: -Math.PI / 3,
		rZ: 0,
	},
	// Work Ansicht
	{
		duration: 1.5,
		ease: "power3.inOut",
		timeout: 0,
		pX: -0.6,
		pY: -0.99,
		pZ: 1.7,
		rX: Math.PI / 12,
		rY: -Math.PI / 2.75,
		rZ: 0,
	},
	// Next
	{
		duration: 1.5,
		ease: "power3.inOut",
		timeout: 0,
		pX: 0.1,
		pY: -1.1,
		pZ: 2,
		rX: -Math.PI / 12,
		rY: -Math.PI / 6,
		rZ: 0,
	},
];

let prevCamIndex = 0;
function moveToCamPosition(index) {
	prevCamIndex = camIndex || 0;
	camIndex = index;
	let animation = camPositions[index];
	if (!animation) return;

	let camPos1 = camPositions[2];
	let treppePos = { x: -1, y: 0, z: 1.2 };
	let treppeRot = { x: Math.PI / 16, y: -Math.PI / 1.2, z: 0 };
	if (camIndex == 2 && prevCamIndex < 3) {
		animate(
			3000,
			{ x: worldGroup.position.x, y: worldGroup.position.y, z: worldGroup.position.z },
			treppePos,
			{ x: camPos1.pX, y: camPos1.pY, z: camPos1.pZ },
			(pos) => {
				if (camIndex !== 2) return true;
				worldGroup.position.x = pos.x;
				worldGroup.position.y = pos.y;
				worldGroup.position.z = pos.z;
			}
		);
		animate(
			3000,
			{ x: worldGroup.rotation.x, y: worldGroup.rotation.y, z: worldGroup.rotation.z },
			treppeRot,
			{ x: camPos1.rX, y: camPos1.rY, z: camPos1.rZ },
			(pos) => {
				if (camIndex !== 2) return true;
				worldGroup.rotation.x = pos.x;
				worldGroup.rotation.y = pos.y;
				worldGroup.rotation.z = pos.z;
			}
		);
		ScaleParty(2);
		return;
	} else {
		gsap.to(worldGroup.position, {
			duration: animation.duration,
			ease: animation.ease,
			x: animation.pX,
			y: animation.pY,
			z: animation.pZ,
		});
		gsap.to(worldGroup.rotation, {
			duration: animation.duration,
			ease: animation.ease,
			x: animation.rX + (index == 0 ? idleRotation.x : 0),
			y: animation.rY + (index == 0 ? idleRotation.y : 0),
			z: animation.rZ,
		});
	}
	ScaleParty(1.5);
}

// Greif die Tastenklicks ab und scroll durch die Ansichten
document.addEventListener("keydown", (event) => {
	if (event.key === "ArrowRight" || event.key === "ArrowDown") {
		event.preventDefault();
		if (camIndex == camPositions.length - 1) return; // skippen wenn letzte Position erreicht ist
		window.scrollTo({
			top: (camIndex + 1) * sizes.height,
			behavior: "smooth",
		});
	} else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
		event.preventDefault();
		if (camIndex == 0) return; // skippen wenn erste Position erreicht ist
		window.scrollTo({
			top: (camIndex - 1) * sizes.height,
			behavior: "smooth",
		});
	}
});


// Draco Loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("draco/");

// GLTF loader
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Texture
const TextureLoader = new THREE.TextureLoader();
const gradientTexture = TextureLoader.load("textures/gradients/3.jpg");
gradientTexture.magFilter = THREE.NearestFilter;

const worldGroup = new THREE.Group();
scene.add(worldGroup);

// Texture loader 
const textureLoader = new THREE.TextureLoader();

const bakedRoomLifeTexture = textureLoader.load("bakedRoomLife.jpg");
bakedRoomLifeTexture.flipY = false;
bakedRoomLifeTexture.colorSpace = THREE.SRGBColorSpace;

const bakedRoomLifeInterieurTexture = textureLoader.load("bakedRoomLifeInterieur.jpg");
bakedRoomLifeInterieurTexture.flipY = false;
bakedRoomLifeInterieurTexture.colorSpace = THREE.SRGBColorSpace;

const bakedRoomWorkTexture = textureLoader.load("bakedRoomWork.jpg");
bakedRoomWorkTexture.flipY = false;
bakedRoomWorkTexture.colorSpace = THREE.SRGBColorSpace;

const bakedWorkTexture = textureLoader.load("bakedRoomWorkInterieur.jpg");
bakedWorkTexture.flipY = false;
bakedWorkTexture.colorSpace = THREE.SRGBColorSpace;

const bakedNextTexture = textureLoader.load("bakedRoomNext.jpg");
bakedNextTexture.flipY = false;
bakedNextTexture.colorSpace = THREE.SRGBColorSpace;

const PaketTexture = textureLoader.load("Paket.jpg");
PaketTexture.flipY = false;
PaketTexture.colorSpace = THREE.SRGBColorSpace;


// Baked material

const bakedRoomLifeMaterial = new THREE.MeshBasicMaterial({ map: bakedRoomLifeTexture });
const bakedRoomLifeInterieurMaterial = new THREE.MeshBasicMaterial({ map: bakedRoomLifeInterieurTexture })
const bakedRoomWorkMaterial = new THREE.MeshBasicMaterial({ map: bakedRoomWorkTexture });
const bakedWorkMaterial = new THREE.MeshBasicMaterial({ map: bakedWorkTexture });
const bakedNextMaterial = new THREE.MeshBasicMaterial({ map: bakedNextTexture });
const PaketMaterial = new THREE.MeshBasicMaterial({ map: PaketTexture });

let groundMesh = null;
let hobbiesMesh = null;
let SecoundEtageMesh = null;
let WorkMesh = null;
let NextMesh = null;
let PaketMesh = null;
let BallMixer;
let BallClip;

gltfLoader.load("TestScene.glb", (gltf) => {
	gltf.scene.scale.set(0.62, 0.62, 0.62);
	gltf.scene.traverse((child) => {
		if (child.isMesh) {
			child.geometry.computeVertexNormals();
		}
	});

	groundMesh = gltf.scene.children.find((child) => child.name === "RoomLife");
	applyMaterialToMesh(groundMesh, bakedRoomLifeMaterial);

	hobbiesMesh = gltf.scene.children.find((child) => child.name === "Hobbies");
	applyMaterialToMesh(hobbiesMesh, bakedRoomLifeInterieurMaterial);

	SecoundEtageMesh = gltf.scene.children.find((child) => child.name === "RoomWork");
	applyMaterialToMesh(SecoundEtageMesh, bakedRoomWorkMaterial);

	WorkMesh = gltf.scene.children.find((child) => child.name === "Work");
	applyMaterialToMesh(WorkMesh, bakedWorkMaterial);

	NextMesh = gltf.scene.children.find((child) => child.name === "Next");
	applyMaterialToMesh(NextMesh, bakedNextMaterial);

	PaketMesh = gltf.scene.children.find((child) => child.name === "Box");
	applyMaterialToMesh(PaketMesh, PaketMaterial);

	worldGroup.add(gltf.scene);
	ScaleParty(0);

	let Loading = document.getElementsByClassName("loading")[0]
	Loading.remove();
	document.body.style.overflow = "auto";

	window.scrollTo(0, 0);
	BallMixer = new THREE.AnimationMixer(gltf.scene)
	BallClip = BallMixer.clipAction(gltf.animations[0])
	console.log(gltf.animations)

});

function applyMaterialToMesh(mesh, material) {
	mesh.material = material;
	mesh.children.forEach((child) => {
		applyMaterialToMesh(child, material);
		if (child.type === "Group") {
			child.children.forEach((c) => {
				applyMaterialToMesh(c, material);
			});
		}
	});
}

const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener("resize", () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

//Camera

// Group
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100);
camera.position.x = -0.25;
camera.position.z = 3;
cameraGroup.add(camera);

//Renderer

const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
	alpha: true,
});

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.autoClear = false;


//Scroll

let currentSection = Math.round(window.scrollY / sizes.height);
moveToCamPosition(currentSection);
window.scrollTo({
	top: currentSection * sizes.height,
	behavior: "smooth",
});
window.addEventListener("scroll", () => {
	const newSection = Math.round(window.scrollY / sizes.height);
	if (newSection !== currentSection) {
		currentSection = newSection;
		moveToCamPosition(currentSection);
		window.scrollTo({
			top: currentSection * sizes.height,
			behavior: "smooth",
		});
	}
});

//Animate

const clock = new THREE.Clock();
let previousTime = 0;
const tick = () => {
	const elapsedTime = clock.getElapsedTime();
	const deltaTime = elapsedTime - previousTime;
	previousTime = elapsedTime;

	idleProgress += deltaTime;
	idleRotation.x = Math.sin(idleProgress * 0.6) * 0.01;
	idleRotation.y = Math.cos(idleProgress * 0.5) * 0.01;
	camera.rotation.x = idleRotation.x;
	camera.rotation.y = idleRotation.y;

	if (BallMixer) {
		BallMixer.update(1 / 60)

	}
	if (worldGroup) {
		worldGroup.traverse((child) => {
			if (
				child.name.includes("Fisch")
			) {
				child.rotation.x = Math.sin(idleProgress * 0.6) * 0.4;
			}
			if (
				child.name.includes("Schach")
			) {
				child.rotation.x = Math.sin(elapsedTime) * 0.08;
			}
		});
	}

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};
tick();

// ScaleParty Funktion
function ScaleParty(duration) {
	if (camIndex == 0 || camIndex == 1) {
		if (groundMesh) {
			groundMesh.traverse((child) => {
				if (
					child.name === "RoomLife" ||
					child.name === "WandLife" ||
					child.name === "HolzBodenLife" ||
					child.name === "FensterRahmenLife" ||
					child.name === "FensterLifeLight" ||
					child.name === "PlattformLife"
				) {
					child.visible = true;
					gsap.to(child.scale, {
						duration,
						ease: "power3.inOut",
						x: 1,
						y: 1,
						z: 1,
					});
				} else {
					gsap.to(child.scale, {
						duration,
						ease: "power3.inOut",
						x: 1,
						y: 0,
						z: 1,
					});
					setTimeout(() => {
						if (camIndex == 0 || camIndex == 1) {
							child.visible = false;
						}
					}, duration * 1000);
				}
			});
		}

		if (PaketMesh) {
			if (camIndex == 0) {
				PaketMesh.visible = true;
				gsap.to(PaketMesh.scale, {
					duration,
					ease: "power3.inOut",
					x: 1,
					y: 1,
					z: 1,
				});
				gsap.to(PaketMesh.position, {
					duration,
					ease: "power3.inOut",
					x: 0,
					y: 0,
					z: 0,
				});
			} else {
				gsap.to(PaketMesh.scale, {
					duration,
					ease: "power3.inOut",
					x: 0,
					y: 0,
					z: 0,
				});
				gsap.to(PaketMesh.position, {
					duration,
					ease: "power3.inOut",
					x: 0,
					y: 3,
					z: 0,
				});
			}
		}

		if (SecoundEtageMesh) {
			SecoundEtageMesh.traverse((child) => {
				gsap.to(child.scale, {
					duration,
					ease: "power3.inOut",
					x: 1,
					y: 0,
					z: 1,
				});
				gsap.to(child.position, {
					duration,
					ease: "power3.inOut",
					x: 0,
					y: -1.2,
					z: 0,
				});
				setTimeout(() => {
					if (camIndex == 0 || camIndex == 1) {
						child.visible = false;
					}
				}, duration * 1000);
			});
		}

		if (hobbiesMesh) {
			hobbiesMesh.traverse((child) => {
				if (
					child.name === "Bild01" ||
					child.name === "Bild02"
				) {
					gsap.to(child.scale, {
						duration,
						ease: "power3.inOut",
						x: 3,
						y: 1,
						z: 1,
					});
					setTimeout(() => {
						if (camIndex == 0 || camIndex == 1) {
							child.visible = false;
						}
					}, duration * 1000);
				} else {
					child.visible = true;
					gsap.to(child.scale, {
						duration,
						ease: "power3.inOut",
						x: 1,
						y: 1,
						z: 1,
					});
				}
				if (child.name === "Ball") {
					child.visible = false;
				}
			});
		}
		if (WorkMesh) {
			WorkMesh.traverse((child) => {
				gsap.to(child.scale, {
					duration,
					ease: "power3.inOut",
					x: 1,
					y: 0,
					z: 1,
				});
				gsap.to(child.position, {
					duration,
					ease: "power3.inOut",
					x: 0,
					y: -1.2,
					z: 0,
				});
				setTimeout(() => {
					if (camIndex == 0 || camIndex == 1) {
						child.visible = false;
					}
				}, duration * 1000);
			});
		}
		if (NextMesh) {
			NextMesh.traverse((child) => {
				gsap.to(child.scale, {
					duration,
					ease: "power3.inOut",
					x: 1,
					y: 0,
					z: 1,
				});
				setTimeout(() => {
					if (camIndex == 0 || camIndex == 1) {
						child.visible = false;
					}
				}, duration * 1000);
			});
		}
	}

	if (camIndex == 2) {
		if (SecoundEtageMesh) {
			if (BallClip) {
				setTimeout(() => {
					BallClip.play()
				}, 800)
				
				setTimeout(() => {
					BallClip.stop()
					hobbiesMesh.traverse((child) => {
						if (child.name === "Ball") {
							child.visible = false;
						}
					})
				}, 3250)
			};
			SecoundEtageMesh.traverse((child) => {
				if (child.name === "etage") {
					child.visible = true;
					gsap.to(child.scale, {
						duration: duration / 4,
						x: 1,
						y: 1,
						z: 1,
					});
					gsap.to(child.position, {
						duration: duration / 4,
						x: 0,
						y: 0,
						z: 0,
					});
				} else {
					child.visible = true;
					gsap.to(child.scale, {
						duration,
						ease: "power3.out",
						x: 1,
						y: 1,
						z: 1,
					});
					gsap.to(child.position, {
						duration,
						ease: "power3.out",
						x: 0,
						y: 0,
						z: 0,
					});
				}
			});
		}
		if (hobbiesMesh) {
			hobbiesMesh.traverse((child) => {
				child.visible = true;
				gsap.to(child.scale, {
					duration,
					ease: "power3.out",
					x: 1,
					y: 1,
					z: 1,
				});
				if (child.name === "Ball" && prevCamIndex > 2) {
					child.visible = false;
				}
			});
		}
		
		if (WorkMesh) {
			WorkMesh.traverse((child) => {
				setTimeout(() => {
					child.visible = true;
					gsap.to(child.scale, {
						duration: duration,
						ease: "power3.out",
						x: 1,
						y: 1,
						z: 1,
					});
					gsap.to(child.position, {
						duration,
						ease: "power3.out",
						x: 0,
						y: 0,
						z: 0,
					});
				}, 0);
			});
		}
		if (NextMesh) {
			NextMesh.traverse((child) => {
				gsap.to(child.scale, {
					duration,
					ease: "power3.inOut",
					x: 1,
					y: 0,
					z: 1,
				});
				setTimeout(() => {
					if (camIndex == 2) {
						child.visible = false;
					}
				}, duration * 1000);
			});
		}
	}
	if (camIndex == 3) {
		if (NextMesh) {
			NextMesh.traverse((child) => {
				child.visible = true;
				gsap.to(child.scale, {
					duration,
					ease: "power3.inOut",
					x: 1,
					y: 1,
					z: 1,
				});
			});
		}
		if (WorkMesh) {
			WorkMesh.traverse((child) => {
				child.visible = true;
				gsap.to(child.scale, {
					duration,
					ease: "power3.inOut",
					x: 1,
					y: 1,
					z: 1,
				});
			});
		}
	}
}
