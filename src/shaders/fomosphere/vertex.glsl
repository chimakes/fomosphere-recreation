uniform float uTime;
uniform float uPositionFrequency;
uniform float uTimeFrequency;
uniform float uStrength;
uniform float uTwistFrequency;
uniform float uTwistAmplitude;
uniform float uAmplitudeSpeed;

uniform float uWaveMin;
uniform float uWaveMax;

uniform float uColorFrequency;
uniform float uDisplacementInfluence;

uniform float uColor1Start;
uniform float uColor1End;
uniform float uColor2Start;
uniform float uColor2End;
uniform float uColor3Start;
uniform float uColor3End;
uniform float uColor4Start;
uniform float uColor4End;

uniform vec3 uColor[4];

attribute vec4 tangent;

varying float vDisplacement;
varying vec2 vUv;
varying vec3 vLocalNormal;
varying vec3 vColor;

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



    // Color
    vColor = uColor[0];

    for (int i = 1; i < 4; i++)
    {
        float noiseFactor = noise(csm_Position * uColorFrequency);
        noiseFactor = noiseFactor * 0.5 + 0.5;

        float displacementFactor = displacement / uStrength;

        float colorFactor = mix(
            noiseFactor,
            displacementFactor,
            uDisplacementInfluence
        );

        float start = uColor1Start;
        float end = uColor1End;

        if (i == 1) // pink
        {
            start -= uColor2Start;
            end -= uColor2End;
        }

        if (i == 2) // purple
        {
            start -= uColor3Start;
            end -= uColor3End;
        }

        if (i == 3) // yellow
        {
            start -= uColor4Start;
            end -= uColor4End;
        }

        colorFactor = smoothstep(start, end, colorFactor);

        vColor = mix(vColor, uColor[i], colorFactor);
    }
   

    // varyings
    vDisplacement = displacement / uStrength;
    vUv = uv;
    vLocalNormal = normal;
}