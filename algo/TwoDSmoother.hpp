/**
 * @file TwoDSmoother.hpp
 * @author Urban Willi
 * @date October, 2023
 * @brief 2D Trajectory optimization: Smoothing algorithm using FIR filter on each axis ( North and East).
 *
 * Designed for smoothing path waypoints output from lanelet2 map.
 * 
 * 
 * Justification for chosen approach:
 *
 * FIR filter: low computation cost and low implementation effort, guaranteed stability.
 * 2D instead 3D: Car will never take off from the road, height information needed for steepness estimation and path finding (bridges etc) only.
 *  No forseeable need for smoothed height.
 * 
 * Some alternative algorithms:
 * 
 * - Kalman Filter
 * - B-Spline Curve Fitting with Least-Square
 * - Schneider's algorithm
 */
#pragma once

#include "FirFilter.hpp"

#include <lanelet2_core/LaneletMap.h>

#include <spdlog/spdlog.h>

#include <vector>


namespace twoDSmoother
{
    class TwoDSmoother
    {
    public:
        TwoDSmoother(const int fir_smooth_width = 9);
        void set_fir_smooth_width(const int fir_smooth_width);
        int get_fir_smooth_width();
        void smooth_linestring(const lanelet::BasicLineString3d &input, lanelet::BasicLineString3d &output);
        
    private:
        firFilter::FirFilter _fir;
        std::vector<double> _x;
        std::vector<double> _y;
        std::vector<double> _x_filtered;
        std::vector<double> _y_filtered;

        void _separate_xy(const lanelet::BasicLineString3d &input);
        void _join_xy(const lanelet::BasicLineString3d &original_input, lanelet::BasicLineString3d &output);
        
    };
} // End of namespace twoDSmoother