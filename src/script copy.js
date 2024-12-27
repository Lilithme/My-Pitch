import * as THREE from 'three'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import gsap from "gsap"

/**
 * Debug
 */
const gui = new GUI()

const parameters = {
    materialColor: '#ffeded'
}

gui
    .addColor(parameters, 'materialColor')
    .onChange(() => {
        material.color.set(parameters.materialColor)
    })

/**
 * Base
 */
// Loader
// Draco Loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

//  Array Meshes
let SectionMeshes = [];
// Texture
const TextureLoader = new THREE.TextureLoader()
const gradientTexture = TextureLoader.load("textures/gradients/3.jpg")
gradientTexture.magFilter = THREE.NearestFilter

// Material

const material = new THREE.MeshToonMaterial({
    color: parameters.materialColor,
    gradientMap: gradientTexture
})
const MagentaMaterial = new THREE.MeshToonMaterial({
    color: "#ffffff",
    gradientMap: gradientTexture
})

gltfLoader.load(
    'TestScene.glb',
    (gltf) => {
        gltf.scene.scale.set(0.3, 0.3, 0.3);
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.geometry.computeVertexNormals();
                // child.material = MagentaMaterial
            }
        });
        scene.add(gltf.scene)
        SectionMeshes.push(gltf.scene)
        gltf.scene.material = material
        gltf.scene.position.y = - 1
        gltf.scene.position.x = 0
    }
)

gltfLoader.load(
    'Kanne.glb',
    (gltf) => {
        gltf.scene.scale.set(3, 3, 3);

        // Referenz für das erste Kind-Objekt
        let firstChild = null;

        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.geometry.computeVertexNormals();
                child.material = material;

                // Prüfe, ob es das erste Kind ist
                if (!firstChild) {
                    firstChild = child;
                }
            }
        });

        // Ändere die Farbe des ersten Kindes
        if (firstChild) {
            firstChild.material = new THREE.MeshToonMaterial({
                color: '#A9E53D', // Grüne Farbe
                gradientMap: gradientTexture,
            });
        }

        scene.add(gltf.scene);
        SectionMeshes.push(gltf.scene);
        gltf.scene.position.y = -4;
        gltf.scene.position.x = -2
    }
);


// Objects
const objectsDistance = 4
// const mesh1 = new THREE.Mesh(
//     new THREE.TorusGeometry(1, 0.4, 16, 60),
//     material
// )

// const mesh2 = new THREE.Mesh(
//     new THREE.ConeGeometry(1, 2, 32),
//     material
// )

// const mesh3 = new THREE.Mesh(
//     new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
//     material
// )
// mesh1.position.y = - objectsDistance * 1
// mesh2.position.y = - objectsDistance * 1
// mesh3.position.y = - objectsDistance * 2

// scene.add(mesh1, mesh2, mesh3)
// SectionMeshes = [ mesh1, mesh2, mesh3,]

/**
 * Particles
 */
// Geometry
const particlesCount = 200
const positions = new Float32Array(particlesCount * 3)

for (let i = 0; i < particlesCount; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 10
    positions[i * 3 + 1] = objectsDistance * 0.5 - Math.random() * objectsDistance * 3
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10
}

const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

// Material
const particlesMaterial = new THREE.PointsMaterial({
    color: parameters.materialColor,
    sizeAttenuation: true,
    size: 0.03,
})

// points
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)
// Light

const directionalLight = new THREE.DirectionalLight("#ffffff", 3)
directionalLight.position.set(0, 1, 1)
scene.add(directionalLight)
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Group
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Scroll
 */
let scrollY = window.scrollY;
let currentSection = 0;

window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    const newSection = Math.round(window.scrollY / sizes.height);
    if (newSection !== currentSection) {
        currentSection = newSection;
        let currentMesh = SectionMeshes[currentSection];
        if (!currentMesh) return;
        console.log(currentMesh)
        gsap.to(currentMesh.rotation, {
            duration: 1.5,
            easw: 'power3.inOut',
            x: "+=6",
            y: "+=3",
        })
    }
});

// Cursor

const cursor = {}
cursor.x = 0
cursor.y = 0

window.addEventListener("mousemove", (event) => {
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = event.clientY / sizes.height - 0.5
})
/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0
const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Animate Camera
    camera.position.y = - scrollY / sizes.height * objectsDistance
    const parallaxX = cursor.x * 0.5
    const parallaxY = - cursor.y * 0.5
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime

    // Animate Meshes
    for (const mesh of SectionMeshes) {
        // mesh.rotation.x += deltaTime * 0.1
        mesh.rotation.y += deltaTime * 0.15
    }
    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()