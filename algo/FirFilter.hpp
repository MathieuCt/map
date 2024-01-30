/**
 * @file FirFilter.hpp
 * @author Urban Willi
 * @date October, 2023
 * @brief Finite-Impulse-Response Filter. Symmetric, triangular coefficients, variable smooth width.
 * 
 * First and last elements (smooth_width/2) are unfiltered.
 * Smooth width must be greater or equal to three and it must be an odd number.
 * 
 * Class takes advantage of symmetry to make multiplications only once.
 * 
 * 
 * Example:
 * smooth width = 3
 * 
 * Resulting coefficients: 1, 2, 1
 * 
 * input = {0., 0., 1., 2., 3., 0., 0.}
 * output = {0., 0.33, 1., 2.67, 2.67, 1.0, 0.}
 * 
 * First element: Unfiltered (smaller than smooth_width/2)
 * 2nd: 1 / 4 = (1 * 0 + 2 * 0 + 1 * 1) / sum of coefficients = 0.25
 * 3rd: 3 / 4 = (1 * 0 + 2 * 1 + 1 * 2) / sum of coefficients = 0.75
 * 4th: 8 / 4 = (1 * 1 + 2 * 2 + 1 * 3) / sum of coefficients = 2
 * 5th: 8 / 4 = (1 * 2 + 2 * 3 + 1 * 0) / sum of coefficients = 2
 * 6th: 3 / 4 = (1 * 3 + 2 * 0 + 1 * 0) / sum of coefficients = 0.75
 * 7th: Unfiltered (closer to end of dataset than smooth_width/2)
 */
#pragma once

#include <spdlog/spdlog.h>

#include <vector>
#include <stdexcept>
#include <cmath>


namespace firFilter
{
    class FirFilter
    {
    public:
        FirFilter(const int smooth_width = 5);
        void filter(const std::vector<double> &input, std::vector<double> &output);
        int get_smooth_width();
        void set_smooth_width(const int _smooth_width);

    private:
        int _smooth_width;
        std::vector<int> _coefficients;

        void _create_coefficients();
        void _verify_valid_smooth_width(const int smooth_width);
    };
} // End of namespace firFilter