/**
 * @author Mathieu Chantot <mathieu.chantot@hes-so.ch>
 * @date 01/24
 * 
 * Finite-Impulse-Response Filter. Symmetric, triangular coefficients, variable smooth width.
 */

export class Smooth{
    /**
     * 
     * @param {number} smooth_width - Number of points used to smooth the trajectory.
     */
    constructor(smooth_width = 100){
        this.verify_valid_smooth_width(smooth_width);
        this.smooth_width = smooth_width;
        this.coefficients = [];
        this.create_coefficients();
    }

    /**
     * 
     * @param {Object[]} trajectory - trajectory to smooth.
	 * @property {number} trajectory[].x - The x-coordinate of the point.
	 * @property {number} trajectory[].y - The y-coordinate of the point.
     * @returns {Object[]} - Smoothed trajectory.
     */
    filter(input){
        let output = [];
        let halfWidth = Math.floor(this.smooth_width / 2);
        let fullcoeffSum = this.coefficients.reduce((a, b) => a + b, 0);
        let coeffSum;

        for (let i = 0; i < input.length; i++){
            if(i === 0 || i === input.length - 1){
                output.push(input[i]);
            }else{
                let sumLng = 0;
                let sumLat = 0;
                if(i >= halfWidth && i <= input.length - halfWidth - 1){
                    for(let j = -halfWidth; j <= halfWidth; j++) {
                        sumLng += this.coefficients[j + halfWidth] * input[i + j][0];
                        sumLat += this.coefficients[j + halfWidth] * input[i + j][1];
                    }
                    coeffSum = fullcoeffSum;
                }else{
                    coeffSum = 0;
                    for(let j = -halfWidth; j <= halfWidth; j++){
                        if (i + j >= 0 && i + j < input.length) {
                            sumLng += this.coefficients[j + halfWidth] * input[i + j][0];
                            sumLat += this.coefficients[j + halfWidth] * input[i + j][1];
                            coeffSum += this.coefficients[j + halfWidth];
                        }
                    }
                }
                output.push([sumLng / coeffSum, sumLat / coeffSum]);
            }
        }
        return output;
    }

    /**
     * @param {number} smooth_width - Number of points used to smooth the trajectory.
     */
    set_smooth_width(smooth_width) {
        this.verify_valid_smooth_width(smooth_width);
        this.smooth_width = smooth_width;
        this.create_coefficients();
    }

    /**
     * @returns {number} - Number of points used to smooth the trajectory.
     */
    verify_valid_smooth_width(smooth_width) {
        if (smooth_width < 3 ) {
            this.set_smooth_width(3);
        }
        if (smooth_width % 2 === 0) {
            this.set_smooth_width(smooth_width + 1);
        }
    }

    /**
     * Create the coefficients used to smooth the trajectory.
     */
    create_coefficients() {
        this.coefficients = [];
        let halfWidth = Math.floor(this.smooth_width / 2);
        for (let i = 0; i < this.smooth_width; i++) {
            this.coefficients.push((Math.min(i, this.smooth_width - i - 1) + 1)**2);
        }
    }
}
