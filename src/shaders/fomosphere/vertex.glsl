uniform float uTime;
uniform float uPositionFrequency;
uniform float uTimeFrequency;
uniform float uStrength;

attribute vec4 tangent;

varying float vDisplacement;
varying vec2 vUv;
varying vec3 vLocalNormal;

#include ../includes/simplexNoise4d.glsl

float getDisplacement(vec3 position)
{
    return simplexNoise4d(vec4(
        position * uPositionFrequency,
        uTime * uTimeFrequency
    )) * uStrength;
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