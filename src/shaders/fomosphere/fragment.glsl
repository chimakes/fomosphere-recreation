uniform float uTime;

varying float vDisplacement;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vLocalNormal;

#include ../includes/perlinNoise3d.glsl

/* 
* SMOOTH MOD
* - authored by @charstiles -
* based on https://math.stackexchange.com/questions/2491494/does-there-exist-a-smooth-approximation-of-x-bmod-y
* (axis) input axis to modify
* (amp) amplitude of each edge/tip
* (rad) radius of each edge/tip
* returns => smooth edges
*/

float smoothMod(float axis, float amp, float rad){
    float top = cos(PI * (axis / amp)) * sin(PI * (axis / amp));
    float bottom = pow(sin(PI * (axis / amp)), 2.0) + pow(rad, 2.0);
    float at = atan(top / bottom);
    return amp * (1.0 / 2.0) - (1.0 / PI) * at;
}

// float fit(float unscaled, float originalMin, float originalMax, float minAllowed, float maxAllowed) {
//   return (maxAllowed - minAllowed) * (unscaled - originalMin) / (originalMax - originalMin) + minAllowed;
// }

float remap(
    float value,
    float inMin,
    float inMax,
    float outMin,
    float outMax
) {
    return (value - inMin) / (inMax - inMin)
        * (outMax - outMin)
        + outMin;
}

float wave(vec3 position) {
    return remap(
        smoothMod((position.y += uTime * 0.1) * 2.0, 1.0, 1.5),
        0.35,
        0.6,
        0.0,
        1.0
    );
}

void main()
{
    // csm_FragColor.rgb = vec3(vDisplacement);

    vec3 displacementPattern  = vLocalNormal;
    // csm_FragColor.rgb = vec3(step(0.5, smoothMod((uv.y += uTime * 0.1) * 10.0, 1.0, 1.0)));
    // float pattern = fit(smoothMod((uv.y += uTime * 0.1) * 10.0, 1.0, 1.5), 0.35, 0.6, 0.0, 1.0);

    displacementPattern += noise(displacementPattern );
    float pattern = wave(displacementPattern );
    csm_FragColor.rgb = vec3(pattern);
}