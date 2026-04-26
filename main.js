import LocomotiveScroll from "locomotive-scroll";
import * as THREE from "three";
import vertexShader from "./shaders/vertexShader.glsl";
import fragmentShader from "./shaders/fragmentShader.glsl";
import gsap from "gsap";

const locomotiveScroll = new LocomotiveScroll();
const scene = new THREE.Scene();

const cameraDistance = 20;
const fov =
    2 * Math.atan(window.innerHeight / 2 / cameraDistance) * (180 / Math.PI);
const camera = new THREE.PerspectiveCamera(
    fov,
    window.innerWidth / window.innerHeight,
    0.1,
    100,
);

camera.position.z = cameraDistance;

const planes = [];
const images = document.querySelectorAll("img");

const planeInfos = [];

images.forEach((image, idx) => {
    const texture = new THREE.TextureLoader().load(image.src);
    const imagebounds = image.getBoundingClientRect();

    const geometry = new THREE.PlaneGeometry(
        imagebounds.width,
        imagebounds.height,
    );

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTexture: { value: texture },
            uMouse: { value: new THREE.Vector2(0.5, 0.5) },
            uHover: { value: 0 },
            uTime: { value: 0 },
        },

        vertexShader,
        fragmentShader,
    });

    const plane = new THREE.Mesh(geometry, material);
    plane.position.set(
        imagebounds.left - window.innerWidth / 2 + imagebounds.width / 2,
        -imagebounds.top + window.innerHeight / 2 - imagebounds.height / 2,
        0,
    );
    planes.push(plane);
    planeInfos.push({
        plane,
        material,
        image,
        isHovered: false, // We will use this to detect hover changes
    });
    scene.add(plane);
});

function updatePlanePosition() {
    planes.forEach((plane, idx) => {
        const image = images[idx];
        const imagebounds = image.getBoundingClientRect();
        plane.position.set(
            imagebounds.left - window.innerWidth / 2 + imagebounds.width / 2,
            -imagebounds.top + window.innerHeight / 2 - imagebounds.height / 2,
            0,
        );
    });
}

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("canvas"),
    antialias: true,
    alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Helper to animate uHover via GSAP
function setPlaneHoverState(planeInfo, hovered) {
    if (planeInfo.isHovered !== hovered) {
        planeInfo.isHovered = hovered;

        gsap.to(planeInfo.material.uniforms.uHover, {
            value: hovered ? 1 : 0,
            duration: hovered ? 2 : 2.5,
            ease: hovered ? "sine.out" : "expo.out",
            overwrite: true,
        });
    }
}

// Add event listener to update mouse position and uniform on hover
window.addEventListener("mousemove", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planes);

    for (const planeInfo of planeInfos) {
        setPlaneHoverState(planeInfo, false);
    }

    for (const intersect of intersects) {
        for (const planeInfo of planeInfos) {
            if (planeInfo.plane === intersect.object) {
                planeInfo.material.uniforms.uMouse.value.copy(intersect.uv);
                setPlaneHoverState(planeInfo, true);
            }
        }
    }
});

// Animate and render
function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
    updatePlanePosition();
}
animate();

window.addEventListener("resize", function (e) {
    const newfov =
        2 *
        Math.atan(window.innerHeight / 2 / cameraDistance) *
        (180 / Math.PI);
    camera.fov = newfov;
    camera.aspect = window.innerWidth / window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.updateProjectionMatrix();
    updatePlanePosition();
});
