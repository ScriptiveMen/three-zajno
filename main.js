import LocomotiveScroll from "locomotive-scroll";
import * as THREE from "three";
import vertexShader from "./shaders/vertexShader.glsl";
import fragmentShader from "./shaders/fragmentShader.glsl";
import gsap from "gsap";

// Use only window.innerWidth for mobile detection
function isMobileDevice() {
    return window.innerWidth <= 768;
}

const locomotiveScroll = new LocomotiveScroll();
const scene = new THREE.Scene();

const cameraDistance = 20;
let fov =
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

// Set image opacity based on device type
function updateImageOpacityForDevice() {
    const isMobile = isMobileDevice();
    images.forEach((img) => {
        img.style.opacity = isMobile ? "1" : "0";
    });
}

// Run image opacity setting on load and resize
updateImageOpacityForDevice();
window.addEventListener("resize", updateImageOpacityForDevice);

let effectEnabled = !isMobileDevice();

// Create plane for each image if effect is enabled
function createPlaneForImage(image, idx) {
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
    return { plane, material, image, isHovered: false };
}

if (effectEnabled) {
    images.forEach((image, idx) => {
        const {
            plane,
            material,
            image: img,
            isHovered,
        } = createPlaneForImage(image, idx);
        planes.push(plane);
        planeInfos.push({
            plane,
            material,
            image: img,
            isHovered,
        });
        scene.add(plane);
    });
}

// Update geometry and position of all planes on resize
function updatePlanesOnResize() {
    if (!effectEnabled) return;
    planeInfos.forEach((planeInfo, idx) => {
        const image = planeInfo.image;
        const plane = planeInfo.plane;
        const imagebounds = image.getBoundingClientRect();

        plane.geometry.dispose();
        const newGeometry = new THREE.PlaneGeometry(
            imagebounds.width,
            imagebounds.height,
        );
        plane.geometry = newGeometry;

        plane.position.set(
            imagebounds.left - window.innerWidth / 2 + imagebounds.width / 2,
            -imagebounds.top + window.innerHeight / 2 - imagebounds.height / 2,
            0,
        );
    });
}

// Only update position if effect is enabled
function updatePlanePosition() {
    if (!effectEnabled) return;
    planeInfos.forEach((planeInfo, idx) => {
        const image = planeInfo.image;
        const plane = planeInfo.plane;
        const imagebounds = image.getBoundingClientRect();
        plane.position.set(
            imagebounds.left - window.innerWidth / 2 + imagebounds.width / 2,
            -imagebounds.top + window.innerHeight / 2 - imagebounds.height / 2,
            0,
        );
    });
}

let renderer, raycaster, mouse;
if (effectEnabled) {
    renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector("canvas"),
        antialias: true,
        alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
}

// Animate uHover uniform
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

// Add hover effect only if enabled
if (effectEnabled) {
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
}

// Render only if enabled
function animate() {
    if (effectEnabled && renderer) {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        updatePlanePosition();
    }
}
if (effectEnabled) {
    animate();
}

// Responsive: adjust on resize, including enabling/disabling effect
window.addEventListener("resize", function (e) {
    updateImageOpacityForDevice();
    const shouldEnable = !isMobileDevice();

    // Only refresh/reload page if the effect turns on/off due to screen size change
    if (shouldEnable !== effectEnabled) {
        window.location.reload();
        return;
    }

    if (effectEnabled) {
        fov =
            2 *
            Math.atan(window.innerHeight / 2 / cameraDistance) *
            (180 / Math.PI);
        camera.fov = fov;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
        updatePlanesOnResize();
    }
});
