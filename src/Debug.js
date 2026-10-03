import GUI from "lil-gui";

export default class debug
{
    constructor(uniforms, palette)
    {
        this.gui = new GUI({ width: 320 })
        this.uniforms = uniforms
        this.palette = palette

        this.addColorControls()
        // this.addControls()
    }

    addColorControls()
    {
        this.palette.forEach((color, index) => {
            const debug = {
                color: `#${color.getHexString()}`
            }
        
            this.gui.addColor(debug, 'color').name(`Color ${index + 1}`)
                .onChange((value) => {
                    color.set(value)
                })
        })
    }
    
    addControls()
    {
        this.gui.add(this.uniforms.uPositionFrequency, 'value', 0, 2, 0.001).name('uPositionFrequency')
        this.gui.add(this.uniforms.uTimeFrequency, 'value', 0, 2, 0.001).name('uTimeFrequency')
        this.gui.add(this.uniforms.uStrength, 'value', 0, 2, 0.001).name('uStrength')
        this.gui.add(this.uniforms.uTwistAmplitude, 'value', -3, 3, 0.001).name('uTwistAmplitude')
        this.gui.add(this.uniforms.uTwistFrequency, 'value', -3, 3, 0.001).name('uTwistFrequency')
        this.gui.add(this.uniforms.uAmplitudeSpeed, 'value', 0, 2, 0.01).name('uAmplitudeSpeed')
        
        this.gui.add(this.uniforms.uWaveMin, 'value')
            .min(0)
            .max(1)
            .step(0.01)
            .name('Wave Min');
        
        this.gui.add(this.uniforms.uWaveMax, 'value')
            .min(0)
            .max(1)
            .step(0.01)
            .name('Wave Max');
        
        // color debug
        this.gui.add(this.uniforms.uColorFrequency, 'value', 0, 2, 0.01).name('uColorFrequency')
        this.gui.add(this.uniforms.uDisplacementInfluence, 'value', 0, 1, 0.01).name('uDisplacementInfluence')
        
        this.gui.add(this.uniforms.uColor1Start, 'value', 0, 1, 0.01).name('Color 1 Start')
        this.gui.add(this.uniforms.uColor1End, 'value', 0, 1, 0.01).name('Color 1 End')
        
        this.gui.add(this.uniforms.uColor2Start, 'value', 0, 1, 0.01).name('Color 2 Start')
        this.gui.add(this.uniforms.uColor2End, 'value', 0, 1, 0.01).name('Color 2 End')
        this.gui.add(this.uniforms.uColor3Start, 'value', 0, 1, 0.01).name('Color 3 Start')
        this.gui.add(this.uniforms.uColor3End, 'value', 0, 1, 0.01).name('Color 3 End')
        this.gui.add(this.uniforms.uColor4Start, 'value', 0, 1, 0.01).name('Color 4 Start')
        this.gui.add(this.uniforms.uColor4End, 'value', 0, 1, 0.01).name('Color 4 End')
    }
}