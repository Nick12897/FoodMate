import React from 'react';
import { Flame, MapPin, ShieldCheck, AlertCircle } from 'lucide-react';

export default function Header({ onSosClick, isLoggedIn, onLoginClick }) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-100 px-4 py-3 shadow-xs">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Flame className="w-6 h-6 fill-white stroke-orange-500 stroke-1" />
          </div>
          <div>
            <span className="text-xl font-black bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent tracking-tight">
              FoodMate
            </span>
            <div className="flex items-center text-xs text-slate-500 font-medium">
              <MapPin className="w-3 h-3 text-orange-500 mr-0.5 inline" />
              <span>Quận 1, TP. Hồ Chí Minh</span>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={onSosClick}
            title="Cảnh báo an toàn khẩn cấp"
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-semibold hover:bg-red-100 transition active:scale-95"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>SOS</span>
          </button>
          
          {isLoggedIn ? (
            <div className="flex items-center text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-full font-medium border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              <span>Đã eKYC</span>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs transition active:scale-95"
            >
              <span>Đăng nhập</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
