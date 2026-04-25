import LocomotiveScroll from "locomotive-scroll";
import * as THREE from "three";
import vertexShader from "./shaders/vertexShader.glsl";
import fragmentShader from "./shaders/fragmentShader.glsl";

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
