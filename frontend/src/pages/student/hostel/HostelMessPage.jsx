import React, { useState } from "react";
import { Utensils } from "lucide-react";
import { hostelData } from "../../../hooks/studentExtendedData";

export default function HostelMessPage() {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-extrabold flex items-center gap-2">
          <Utensils className="w-6 h-6" /> Mess Menu & Meal Schedule
        </h1>
        <p className="text-amber-100 text-xs mt-1">Dedicated Page for Daily Meals, Timings & Nutritional Chart</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-base font-bold text-gray-800">Weekly Meal Plan</h2>
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedDay === day
                    ? "bg-amber-600 text-white shadow"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {hostelData.messMenu[selectedDay] && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-amber-700">Breakfast (07:30 AM - 09:00 AM)</span>
              <p className="text-xs font-bold text-gray-800">{hostelData.messMenu[selectedDay].breakfast}</p>
            </div>
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-amber-700">Lunch (12:30 PM - 02:00 PM)</span>
              <p className="text-xs font-bold text-gray-800">{hostelData.messMenu[selectedDay].lunch}</p>
            </div>
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-amber-700">Snacks (05:00 PM - 06:00 PM)</span>
              <p className="text-xs font-bold text-gray-800">{hostelData.messMenu[selectedDay].snacks}</p>
            </div>
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-amber-700">Dinner (08:00 PM - 09:30 PM)</span>
              <p className="text-xs font-bold text-gray-800">{hostelData.messMenu[selectedDay].dinner}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
