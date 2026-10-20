import React from 'react';
import { Flame, MapPin, ShieldCheck, AlertCircle } from 'lucide-react';

export default function Header({ onSosClick, isLoggedIn, profile, onSwitchUser }) {
  const isThy = profile?.id === 'user-thy-01' || (profile?.phoneNumber && profile.phoneNumber.includes('0901234568'));
  const nextTargetName = isThy ? 'Sang' : 'Thy';
  const currentShortName = profile?.fullName?.split(' ').slice(-1)[0] || (isThy ? 'Thy' : 'Sang');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-100 px-3.5 py-2.5 shadow-xs">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Flame className="w-5 h-5 fill-white stroke-orange-500 stroke-1" />
          </div>
          <div>
            <span className="text-lg font-black bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent tracking-tight block leading-tight">
              FoodMate
            </span>
            <div className="flex items-center text-[11px] text-slate-500 font-medium">
              <MapPin className="w-3 h-3 text-orange-500 mr-0.5 inline shrink-0" />
              <span className="truncate max-w-[120px]">Quận 1, TP.HCM</span>
            </div>
          </div>
        </div>

        {/* Action buttons góc phải */}
        <div className="flex items-center space-x-1.5">
          {/* Nút SOS khẩn cấp */}
          <button 
            onClick={onSosClick}
            title="Cảnh báo an toàn khẩn cấp"
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-semibold hover:bg-red-100 transition active:scale-95 shrink-0"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">SOS</span>
          </button>
          
          {/* Nút Đổi nhanh tài khoản (1-Click Switch: Sang ⇄ Thy) */}
          {isLoggedIn && profile ? (
            <button
              onClick={onSwitchUser}
              title={`Đang đăng nhập: ${profile.fullName}. Bấm để đổi sang ${nextTargetName}`}
              className="flex items-center space-x-1 px-2.5 py-1 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 border border-orange-200 rounded-full text-xs font-bold text-orange-800 shadow-2xs transition active:scale-95 group shrink-0"
            >
              <img
                src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'}
                alt={profile.fullName}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80';
                }}
                className="w-4 h-4 rounded-full object-cover border border-orange-300 shrink-0"
              />
              <span className="text-[11px]">{currentShortName}</span>
              <span className="text-[10px] bg-orange-200 text-orange-700 px-1 py-0.2 rounded font-medium group-hover:bg-orange-300">
                ⇄ {nextTargetName}
              </span>
            </button>
          ) : isLoggedIn ? (
            <div className="flex items-center text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-full font-medium border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              <span>Đã eKYC</span>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
