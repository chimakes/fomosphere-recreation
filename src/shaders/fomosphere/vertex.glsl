uniform float uTime;
uniform float uPositionFrequency;
uniform float uTimeFrequency;
uniform float uStrength;

attribute vec4 tangent;

varying float vDisplacement;
varying vec2 vUv;
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
        smoothMod((position.y += uTime * uTimeFrequency) * 2.0, 1.0, 1.5),
        0.35,
        0.6,
        0.0,
        1.0
    );
}

float getDisplacement(vec3 position)
{
    vec3 displacementPattern = position;
    displacementPattern += noise(displacementPattern * uPositionFrequency);

    return wave(displacementPattern * uStrength);
}

void main()
{
    vec3 biTangent = cross(normal, tangent.xyz);

    float shift = 0.01;
    vec3 positionA = csm_Position + tangent.xyz * shift;
    vec3 positionB = csm_Position + biTangent * shift;

    // displacement
    float displacement = getDisplacement(csm_Position);
    csm_Position += displacement * normal;

    positionA += getDisplacement(positionA) * normal;
    positionB += getDisplacement(positionB) * normal;


    // Compute normal
    vec3 toA = normalize(positionA - csm_Position);
    vec3 toB = normalize(positionB - csm_Position);
    csm_Normal = cross(toA, toB);
    
    // varyings
    vDisplacement = displacement / uStrength;
    vUv = uv;
    vLocalNormal = normal;
}