varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec2 uMouse;
uniform float uHover;

void main() {

    float blocks = 15.0;
    vec2 blockUv = floor(vUv * blocks) / blocks;

    float distance = length(blockUv - uMouse);
    float effect = smoothstep(0.4, 0.0, distance);

    vec2 distortion = vec2(0.05) * effect;

    vec4 color = texture2D(uTexture, vUv + (distortion * uHover));

    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    vec3 grayscale = vec3(gray);

    vec3 finalColor = mix(grayscale, color.rgb, uHover);

    gl_FragColor = vec4(finalColor, color.a);
}