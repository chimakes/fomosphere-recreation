uniform float uTime;
uniform float uPositionFrequency;
uniform float uTimeFrequency;
uniform float uStrength;
uniform float uTwistFrequency;
uniform float uTwistAmplitude;
uniform float uAmplitudeSpeed;

uniform float uWaveMin;
uniform float uWaveMax;

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
        uWaveMin,
        uWaveMax,
        0.0,
        1.0
    );
}

vec3 rotateZ(vec3 p, float angle)
{
    float c = cos(angle);
    float s = sin(angle);

    return vec3(
        c * p.x - s * p.y,
        s * p.x + c * p.y,
        p.z
    );
}

float getDisplacement(vec3 position)
{
    vec3 displacementPattern = position;

    // 1. just displacement without warp
    // displacementPattern += noise(displacementPattern * uPositionFrequency);
    
    // Twist coordinates around sphere's local Z
    float angle = sin(position.z * uTwistFrequency + uTime * 2.8) * uTwistAmplitude;
    // float angle = position.z * uTwistAmplitude;
    displacementPattern = -rotateZ(displacementPattern, angle);

    // 2.warp
    vec3 noisePosition = position * uPositionFrequency;
    displacementPattern.y += noise(noisePosition) * 2.0;



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