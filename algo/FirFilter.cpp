#include "FirFilter.hpp"

using namespace firFilter;

/**
 * @param smooth_width Number of elements taken into account for smoothing 1 data point. Symmetric before/after smoothed element. Must be a minimum of 3 and an odd number.
*/
FirFilter::FirFilter(const int smooth_width)
{
    _verify_valid_smooth_width(smooth_width);
    _smooth_width = smooth_width;
    _create_coefficients();
}

/**
 * @brief Set smooth width after creation of object.
 * 
 * @param smooth_width Number of elements taken into account for smoothing 1 data point. Symmetric before/after smoothed element. Must be a minimum of 3 and an odd number.
*/
void FirFilter::set_smooth_width(const int smooth_width)
{
    _verify_valid_smooth_width(smooth_width);
    _smooth_width = smooth_width;
    _create_coefficients();
}

/**
 * @brief Get smooth width of filter object.
 * 
 * @return smooth width
*/
int FirFilter::get_smooth_width()
{
    return _smooth_width;
}

/**
 * @brief Apply FIR filter to vector of data.
 * 
 * @param input Vector of type double with dataset to be smoothed.
 * @param output Vector of type double where smoothed values are appended. (Existing values in this vector remain.)
*/
void FirFilter::filter(const std::vector<double> &input, std::vector<double> &output)
{
    const int n_reused_coefficients = _smooth_width / 2;

    // Pre-calculate and store multiplications that can be used several times (symmetry)
    std::vector<std::vector<double>> multiplied_reused(n_reused_coefficients);

    for (int i=0; i<n_reused_coefficients; i++)
    {
        multiplied_reused[i].reserve(input.size());

        for (long unsigned int j=0; j<input.size(); j++)
        {
            multiplied_reused[i].push_back(_coefficients[i] * input[j]);
        }
    }
    
    // Copy first unfiltered elements
    for (int i=0; i<n_reused_coefficients; i++)
    {
        output.push_back(input[i]);
    }

    // Smoothing
    int i = n_reused_coefficients;

    const int sum_of_coefficients = std::pow(_coefficients.back(), 2); // n(n+1)/2 * 2 + (n+1)

    int last_tuple = input.size() - n_reused_coefficients;
    double smoothed;

    for (; i<last_tuple; i ++)
    {
        smoothed = 0;

        for (int j=0; j<n_reused_coefficients; j++)
        {
            smoothed += multiplied_reused[j][i - n_reused_coefficients + j];
            smoothed += multiplied_reused[j][i + n_reused_coefficients - j];
        }

        smoothed += _coefficients.back() * input[i];

        output.push_back(smoothed / sum_of_coefficients);
    }

    // Copy last unfiltered elements
    for (long unsigned int i=last_tuple; i<input.size(); i++)
    {
        output.push_back(input[i]);
    }

    SPDLOG_DEBUG("FIR filter applied and appended to output vector.");
}

/**
 * @brief Coefficients are automatically created based on the smooth width parameter.
 * 
 * The coefficients are determined as a symmetric pyramid with step value 1, the furthest element
 * being given the value 1.
 * 
 * Example: smooth width = 5
 * Coefficients: 1, 2, 3, 2, 1
 * The middle element, with the highest number, is multiplied with the point to be smoothed itself. 
*/
void FirFilter::_create_coefficients()
{
    _coefficients = std::vector<int>(_smooth_width/2+1);

    for (int i=0; i<_smooth_width/2+1; i++)
    {
        _coefficients[i] = (i + 1);
    }

    SPDLOG_DEBUG("Triangular FIR filter coefficients calculated successfully.");
}

/**
 * @brief Smooth width must be a positive integer greater 3, and it must be odd.
*/
void FirFilter::_verify_valid_smooth_width(const int smooth_width)
{
    if (smooth_width < 3)
    {
        throw std::invalid_argument("Minimum smooth width is 3.");
    }

    if (smooth_width % 2 == 0)
    {
        throw std::invalid_argument("Smooth width must be odd. This is a symmetric filter implementation.");
    }
    
    SPDLOG_INFO("Smooth width of FIR filter set to: {}", smooth_width);
}