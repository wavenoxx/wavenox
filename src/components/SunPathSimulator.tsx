import * as React from "react";
import { Sun, Compass, Zap, Shield, Clock, Calendar } from "lucide-react";
import { computeHyderabadSunPosition, HYDERABAD_COORDS } from "@/lib/suncalc";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function SunPathSimulator() {
  const [monthIndex, setMonthIndex] = React.useState(2); // March
  const [hour, setHour] = React.useState(12.5); // 12:30 PM

  const sunData = React.useMemo(() => {
    return computeHyderabadSunPosition(monthIndex, hour);
  }, [monthIndex, hour]);

  const formattedTime = React.useMemo(() => {
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    const ampm = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:${m.toString().padStart(2, "0")} ${ampm}`;
  }, [hour]);

  // Compute shadow displacement for a representative 2.4m elevated pergola / water tank
  const shadowDistance = Math.min(110, sunData.shadowLengthRatio * 18);
  const shadowAngleRad = ((sunData.shadowAngleDeg - 90) * Math.PI) / 180;
  const shadowDx = Math.cos(shadowAngleRad) * shadowDistance;
  const shadowDy = Math.sin(shadowAngleRad) * shadowDistance;

  return (
    <div className="w-full max-w-5xl mx-auto rounded-[8px] bg-[#111215] border border-[#23272F] p-6 sm:p-10 text-[#FFFFFF] shadow-2xl overflow-hidden selection:bg-[#F57C00] selection:text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#23272F]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F57C00]" />
            <span className="text-[12px] font-medium tracking-[0.16em] uppercase text-[#9CA3AF]">
              SunCalc Architectural Heliometrics
            </span>
          </div>
          <h3 className="text-[24px] sm:text-[30px] font-medium tracking-tight text-[#FFFFFF] mt-1.5">
            Hyderabad Sun-Path & Shadow Projection
          </h3>
          <p className="text-[13px] text-[#9CA3AF] mt-1">
            Astronomical solar coordinates at {HYDERABAD_COORDS.latDeg}° N,{" "}
            {HYDERABAD_COORDS.lonDeg}° E (Deccan Plateau)
          </p>
        </div>

        {/* Live Generation Badge */}
        <div className="flex items-center gap-3 bg-[#1B1E24] px-4 py-3 rounded-[4px] border border-[#2C323C] self-start sm:self-auto">
          <Zap className="w-5 h-5 text-[#F57C00]" />
          <div>
            <div className="text-[12px] uppercase text-[#9CA3AF]">Est. Generation (10 kWp)</div>
            <div className="text-[20px] font-semibold text-[#FFFFFF] tabular-nums">
              {sunData.generationKw.toFixed(1)}{" "}
              <span className="text-[13px] text-[#9CA3AF] font-normal">kW</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-[#23272F]">
        {/* Month Selector */}
        <div>
          <div className="flex items-center justify-between text-[13px] text-[#9CA3AF] mb-2.5">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#F57C00]" />
              <span>Month (Solar Declination)</span>
            </span>
            <span className="text-[#FFFFFF] font-medium">{MONTHS[monthIndex]}</span>
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1">
            {MONTHS.map((m, idx) => (
              <button
                key={m}
                type="button"
                onClick={() => setMonthIndex(idx)}
                className={`py-1.5 text-[12px] rounded-[3px] transition-colors cursor-pointer border ${
                  monthIndex === idx
                    ? "bg-[#FFFFFF] text-[#111215] font-semibold border-white"
                    : "bg-[#16181D] hover:bg-[#23272F] text-[#9CA3AF] border-[#23272F]"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Hour Slider */}
        <div>
          <div className="flex items-center justify-between text-[13px] text-[#9CA3AF] mb-2.5">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#F57C00]" />
              <span>Time of Day (Sun Angle)</span>
            </span>
            <span className="text-[#FFFFFF] font-medium">{formattedTime}</span>
          </div>
          <input
            type="range"
            min="6"
            max="18"
            step="0.25"
            value={hour}
            onChange={(e) => setHour(parseFloat(e.target.value))}
            aria-label="Hour of day slider"
            aria-valuetext={formattedTime}
            className="w-full h-2 bg-[#23272F] rounded-lg appearance-none cursor-pointer accent-[#F57C00]"
          />
          <div className="flex justify-between text-[12px] text-[#5C5E62] mt-1.5 font-mono">
            <span>06:00 AM</span>
            <span>12:00 PM</span>
            <span>06:00 PM</span>
          </div>
        </div>
      </div>

      {/* Visualizer Plan View */}
      <div className="my-6 p-6 sm:p-8 rounded-[6px] bg-[#16181D] border border-[#23272F]">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Terrace Cadastral SVG Plan */}
          <div className="relative w-full max-w-md aspect-square bg-[#0E1013] rounded-[6px] border border-[#2C323C] p-6 flex items-center justify-center overflow-hidden">
            {/* Compass Heading Indicator */}
            <div className="absolute top-3 right-3 flex items-center gap-1 text-[12px] text-[#5C5E62] font-mono">
              <Compass className="w-3.5 h-3.5 text-[#F57C00]" />
              <span>N</span>
            </div>

            <svg viewBox="0 0 300 300" className="w-full h-full">
              {/* Terrace Boundary */}
              <rect
                x="30"
                y="30"
                width="240"
                height="240"
                fill="#16181D"
                stroke="#343A46"
                strokeWidth="2"
                rx="4"
              />

              {/* Parapet border */}
              <rect
                x="40"
                y="40"
                width="220"
                height="220"
                fill="none"
                stroke="#23272F"
                strokeWidth="1"
                strokeDasharray="4 4"
              />

              {/* Water Tank (Obstacle casting shadow) */}
              {sunData.isDaylight && (
                <ellipse
                  cx={80 + shadowDx}
                  cy={80 + shadowDy}
                  rx="22"
                  ry="22"
                  fill="#000000"
                  opacity="0.5"
                />
              )}
              <circle cx="80" cy="80" r="18" fill="#2C323C" stroke="#5C5E62" strokeWidth="1.5" />
              <text
                x="80"
                y="84"
                fill="#9CA3AF"
                fontSize="12"
                textAnchor="middle"
                fontFamily="Inter, sans-serif"
              >
                Tank
              </text>

              {/* Solar Array Structure (Tilted 12° South) */}
              {sunData.isDaylight && (
                <rect
                  x={120 + shadowDx * 0.5}
                  y={110 + shadowDy * 0.5}
                  width="110"
                  height="110"
                  fill="#000000"
                  opacity="0.45"
                  rx="2"
                />
              )}
              <rect
                x="120"
                y="110"
                width="110"
                height="110"
                fill="#1B1E24"
                stroke="#F57C00"
                strokeWidth="1.5"
                rx="2"
              />
              {/* Array Rows */}
              <line x1="120" y1="146" x2="230" y2="146" stroke="#2C323C" strokeWidth="1" />
              <line x1="120" y1="182" x2="230" y2="182" stroke="#2C323C" strokeWidth="1" />
              <text
                x="175"
                y="170"
                fill="#FFFFFF"
                fontSize="12"
                fontWeight="500"
                textAnchor="middle"
                fontFamily="Inter, sans-serif"
              >
                10 kWp Array
              </text>

              {/* Solar Ray Vector */}
              {sunData.isDaylight && (
                <line
                  x1="150"
                  y1="150"
                  x2={150 - Math.cos(shadowAngleRad) * 60}
                  y2={150 - Math.sin(shadowAngleRad) * 60}
                  stroke="#F57C00"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              )}
            </svg>
          </div>

          {/* Metric Telemetry Cards */}
          <div className="flex-1 space-y-4 w-full">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-[4px] bg-[#111215] border border-[#23272F]">
                <div className="text-[12px] text-[#9CA3AF] uppercase">Sun Altitude</div>
                <div className="text-[22px] font-semibold text-[#FFFFFF] mt-1">
                  {sunData.altitudeDeg}°
                </div>
                <div className="text-[12px] text-[#5C5E62] mt-0.5">Above Horizon</div>
              </div>

              <div className="p-4 rounded-[4px] bg-[#111215] border border-[#23272F]">
                <div className="text-[12px] text-[#9CA3AF] uppercase">Sun Azimuth</div>
                <div className="text-[22px] font-semibold text-[#FFFFFF] mt-1">
                  {sunData.azimuthDeg}°
                </div>
                <div className="text-[12px] text-[#5C5E62] mt-0.5">True Heading</div>
              </div>

              <div className="p-4 rounded-[4px] bg-[#111215] border border-[#23272F]">
                <div className="text-[12px] text-[#9CA3AF] uppercase">Shadow Factor</div>
                <div className="text-[22px] font-semibold text-[#FFFFFF] mt-1">
                  {sunData.shadowLengthRatio.toFixed(2)}×
                </div>
                <div className="text-[12px] text-[#5C5E62] mt-0.5">Obstacle Height</div>
              </div>

              <div className="p-4 rounded-[4px] bg-[#111215] border border-[#23272F]">
                <div className="text-[12px] text-[#9CA3AF] uppercase">Daylight Status</div>
                <div className="text-[22px] font-semibold text-[#F57C00] mt-1">
                  {sunData.isDaylight ? "Active Solar" : "Night Horizon"}
                </div>
                <div className="text-[12px] text-[#5C5E62] mt-0.5">Direct Irradiance</div>
              </div>
            </div>

            <div className="p-4 rounded-[4px] bg-[#111215] border border-[#23272F] text-[13px] text-[#9CA3AF] leading-relaxed">
              <span className="text-[#FFFFFF] font-medium">Architectural Note:</span> In Hyderabad,
              summer sun reaches up to 88° altitude at noon, casting minimal shadow. Winter sun dips
              to 49° south, casting longer northerly shadows that dictate panel row spacing (1.8m
              inter-row clearance) to prevent self-shading.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
