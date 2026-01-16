"use client";
import React, { useState } from 'react';
import { Plus, Edit, Trash, FileImage, Youtube, Mic,Share2 } from "lucide-react";

const LEVELS = ["N5", "N4", "N3", "N2", "N1"];
const STAGES = ["Junbi (Chuẩn bị)", "Taisaku (Kiến thức)", "Luyện đề"];

export default function CurriculumManager() {
  const [selectedLevel, setSelectedLevel] = useState("N5");
  const [selectedStage, setSelectedStage] = useState("Junbi (Chuẩn bị)");

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Lộ trình học</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={18} /> Thêm bài học mới
        </button>
      </div>

      {/* Level Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {LEVELS.map(level => (
          <button
            key={level}
            onClick={() => setSelectedLevel(level)}
            className={`px-6 py-2 rounded-full font-bold transition ${
              selectedLevel === level 
                ? "bg-indigo-600 text-white shadow-md" 
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Stage Tabs (Junbi - Taisaku - Luyện đề) */}
      <div className="flex border-b border-gray-200 mb-6">
        {STAGES.map(stage => (
          <button
            key={stage}
            onClick={() => setSelectedStage(stage)}
            className={`px-6 py-3 font-medium text-sm relative ${
              selectedStage === stage 
                ? "text-blue-600 border-b-2 border-blue-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {stage}
          </button>
        ))}
      </div>

      {/* Danh sách bài học */}
      <div className="bg-white rounded-xl shadow border border-gray-100">
        {/* Giả lập danh sách chương */}
        {[1, 2, 3].map((chapter) => (
          <div key={chapter} className="border-b border-gray-100 last:border-0">
            <div className="p-4 bg-gray-50 flex justify-between items-center cursor-pointer hover:bg-gray-100">
              <span className="font-bold text-gray-700">Chương {chapter}: Gia đình & Bản thân</span>
              <div className="flex gap-2">
                 <button className="p-1 text-gray-400 hover:text-blue-600"><Edit size={16}/></button>
              </div>
            </div>
            
            {/* Nội dung chi tiết trong chương */}
            <div className="p-4 pl-8 space-y-3">
              {/* Từ vựng */}
              <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 text-green-600 rounded flex items-center justify-center"><FileImage size={18} /></div>
                  <div>
                    <p className="font-medium text-gray-800">Từ vựng bài {chapter}</p>
                    <p className="text-xs text-gray-500">24 thẻ Flashcard • 1 Quiz</p>
                  </div>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Active</span>
              </div>

              {/* Ngữ pháp + Sơ đồ tư duy */}
              <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded flex items-center justify-center"><Share2 size={18} /></div>
                  <div>
                    <p className="font-medium text-gray-800">Ngữ pháp & Sơ đồ tư duy</p>
                    <p className="text-xs text-gray-500">3 Cấu trúc • 1 Mindmap Image</p>
                  </div>
                </div>
                <button className="text-sm text-blue-600 hover:underline">Chỉnh sửa Mindmap</button>
              </div>

               {/* Video bài giảng */}
               <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 text-red-600 rounded flex items-center justify-center"><Youtube size={18} /></div>
                  <div>
                    <p className="font-medium text-gray-800">Video hướng dẫn (Speedmaster)</p>
                    <p className="text-xs text-gray-500">Có Script & Dịch nghĩa</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}