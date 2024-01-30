#include "TwoDSmoother.hpp"

using namespace twoDSmoother;
using namespace lanelet;


TwoDSmoother::TwoDSmoother(const int fir_smooth_width) : _fir(fir_smooth_width) {}

/**
 * @brief Set smooth width of underlying 1D FIR filter.
 * 
 * @param fir_smooth_width Smooth width of FIR filter, must be at least 3 and odd.
*/
void TwoDSmoother::set_fir_smooth_width(const int fir_smooth_width)
{
    _fir.set_smooth_width(fir_smooth_width);
}

/**
 * @brief Get smooth width of underlying 1D FIR filter.
 * 
 * @return Smooth width of FIR filter.
*/
int TwoDSmoother::get_fir_smooth_width()
{
    return _fir.get_smooth_width();
}

/**
 * @brief Smooth Linestring with FIR filter in East and North direction.
 * 
 * @param input Linestring to be smoothed.
 * @param output Result will be appendend to this linestring.
*/
void TwoDSmoother::smooth_linestring(const BasicLineString3d &input, BasicLineString3d &output)
{
    _separate_xy(input);

    _x_filtered.clear();
    _y_filtered.clear();

    _fir.filter(_x, _x_filtered);
    _fir.filter(_y, _y_filtered);

    _join_xy(input, output);

    SPDLOG_DEBUG("BasicLinesString with waypoints smoothed and appended to output linestring.");
}

void TwoDSmoother::_separate_xy(const BasicLineString3d &input)
{
    _x.clear();
    _y.clear();

    for (auto it=input.begin(); it!=input.end(); it++)
    {
        _x.push_back(it->x());
        _y.push_back(it->y());
    }
}

/**
 * @brief Construct resulting smoothed path.
 * 
 * @param original_input Needed for z information that was not smoothed.
 * @param output Result will be appendend to this linestring.
*/
void TwoDSmoother::_join_xy(const BasicLineString3d &original_input, BasicLineString3d &output)
{
    for (long unsigned int i=0; i<_x_filtered.size(); i++)
    {
        output.push_back(BasicPoint3d(_x_filtered[i], _y_filtered[i], original_input[i].z()));
    }
}
