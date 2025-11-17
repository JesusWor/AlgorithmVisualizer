"use client"

import React from "react"

export const Slider = React.forwardRef(
  ({ className = "", min = 0, max = 100, step = 1, value = [50], onValueChange, ...props }, ref) => {
    const handleChange = (e) => {
      const newValue = [Number(e.target.value)]
      if (onValueChange) {
        onValueChange(newValue)
      }
    }

    return (
      <div className={`relative flex w-full touch-none select-none items-center ${className}`}>
        <input
          type="range"
          ref={ref}
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={handleChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
          {...props}
        />
        <style jsx>{`
          .slider-thumb::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #2563eb;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          .slider-thumb::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #2563eb;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
        `}</style>
      </div>
    )
  },
)
Slider.displayName = "Slider"
