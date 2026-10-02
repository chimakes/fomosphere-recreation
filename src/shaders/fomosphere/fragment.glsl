uniform float uTime;

varying float vDisplacement;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vLocalNormal;
varying vec3 vColor;

varying float vNoise;

void main()
{
    csm_DiffuseColor.rgb = vColor;
}