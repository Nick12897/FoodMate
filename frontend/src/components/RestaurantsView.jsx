import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Star,
  MapPin,
  Tag,
  Sparkles,
  PlusCircle,
  Navigation,
  Compass,
  Radar,
  Sliders,
  ChevronDown,
  Layers,
  Map as MapIcon,
  List,
  Check,
  Flame,
  Clock,
  Phone,
  Share2,
  Users
} from 'lucide-react';
import { CITIES_AND_DISTRICTS } from '../data/mockData';

// Công thức Haversine tính khoảng cách thực tế giữa 2 toạ độ GPS (km)
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default function RestaurantsView({
  restaurants = [],
  chats = [],
  onInviteAtRestaurant,
  onGoToDiscovery
}) {
  // Chế độ xem: 'list' (Danh sách thẻ) hoặc 'map' (Bản đồ vệ tinh & Radar)
  const [viewMode, setViewMode] = useState('list');

  // Bộ lọc địa điểm tùy chỉnh: Thành phố & Quận
  const [selectedCity, setSelectedCity] = useState('Hồ Chí Minh');
  const [selectedDistrict, setSelectedDistrict] = useState('Tất cả quận');

  // Trạng thái GPS Định vị thực tế
  const [userLocation, setUserLocation] = useState({
    lat: 10.7769,
    lng: 106.7009,
    isGpsActive: false,
    label: 'Trung tâm Quận 1, TP.HCM'
  });
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState('');

  // Bán kính quét vệ tinh (km): 0 là không giới hạn, 1, 3, 5, 10, 20
  const [scanRadius, setScanRadius] = useState(5);
  const [isScanningAnim, setIsScanningAnim] = useState(false);

  // Tìm kiếm từ khóa & filter món
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisineTag, setSelectedCuisineTag] = useState('ALL');

  // Quán đang được chọn xem trên bản đồ
  const [selectedMapRest, setSelectedMapRest] = useState(null);

  // Kích hoạt GPS Định vị thực tế từ thiết bị của người dùng
  const handleRequestGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Trình duyệt của bạn không hỗ trợ định vị GPS.');
      return;
    }

    setIsLocating(true);
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({
          lat: latitude,
          lng: longitude,
          isGpsActive: true,
          label: `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        });
        setIsLocating(false);
        setIsScanningAnim(true);
        setTimeout(() => setIsScanningAnim(false), 2000);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setGpsError('Không thể lấy vị trí GPS thực tế. Hệ thống dùng vị trí mặc định tại Quận 1.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Khi đổi thành phố, cập nhật lại quận mặc định
  const handleCityChange = (newCity) => {
    setSelectedCity(newCity);
    setSelectedDistrict('Tất cả quận');
    if (newCity === 'Hà Nội') {
      setUserLocation((prev) => ({ ...prev, lat: 21.0285, lng: 105.8542, label: 'Hoàn Kiếm, Hà Nội' }));
    } else if (newCity === 'Đà Nẵng') {
      setUserLocation((prev) => ({ ...prev, lat: 16.0544, lng: 108.2022, label: 'Hải Châu, Đà Nẵng' }));
    } else {
      setUserLocation((prev) => ({ ...prev, lat: 10.7769, lng: 106.7009, label: 'Quận 1, TP.HCM' }));
    }
  };

  // Danh sách quận tương ứng theo thành phố
  const districtList = CITIES_AND_DISTRICTS[selectedCity] || ['Tất cả quận'];

  // Tính khoảng cách GPS và lọc quán
  const processedRestaurants = useMemo(() => {
    return restaurants
      .map((r) => {
        const dist = calculateHaversineDistance(
          userLocation.lat,
          userLocation.lng,
          r.lat || 10.7769,
          r.lng || 106.7009
        );
        return {
          ...r,
          calculatedDistance: dist ?? 1.5
        };
      })
      .filter((r) => {
        // Lọc theo thành phố
        if (selectedCity && r.city && !r.city.toLowerCase().includes(selectedCity.toLowerCase())) {
          return false;
        }

        // Lọc theo quận
        if (selectedDistrict !== 'Tất cả quận' && r.district !== selectedDistrict) {
          return false;
        }

        // Lọc theo bán kính quét vệ tinh (nếu có GPS hoặc radius filter)
        if (scanRadius > 0 && r.calculatedDistance > scanRadius) {
          return false;
        }

        // Lọc theo từ khóa tìm kiếm
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchName = r.name.toLowerCase().includes(term);
          const matchCuisine = r.cuisine.toLowerCase().includes(term);
          const matchAddress = r.address.toLowerCase().includes(term);
          const matchTags = r.tags && r.tags.some((t) => t.toLowerCase().includes(term));
          if (!matchName && !matchCuisine && !matchAddress && !matchTags) return false;
        }

        return true;
      })
      .sort((a, b) => a.calculatedDistance - b.calculatedDistance);
  }, [restaurants, userLocation, selectedCity, selectedDistrict, scanRadius, searchTerm]);

  return (
    <div className="max-w-md mx-auto px-4 py-3 pb-28">
      {/* ===================== KHỐI 1: HEADER & ĐỊNH VỊ GPS VỆ TINH ===================== */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-orange-950 rounded-3xl p-4 text-white shadow-xl mb-4 relative overflow-hidden">
        {/* Radar Background Decor */}
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full border border-orange-500/20 pointer-events-none" />
        <div className="absolute -right-4 -top-4 w-32 h-32 rounded-full border border-orange-500/30 pointer-events-none animate-pulse" />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Radar className={`w-4 h-4 ${isLocating || isScanningAnim ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-orange-400 tracking-wider uppercase block">
                Radar Vệ Tinh Ẩm Thực
              </span>
              <h2 className="text-base font-black text-white leading-tight">Quán Ngon & Điểm Hẹn</h2>
            </div>
          </div>

          {/* Toggle View Mode */}
          <div className="flex items-center bg-white/10 p-1 rounded-xl backdrop-blur-md border border-white/10">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                viewMode === 'list'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Xem dạng danh sách"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                viewMode === 'map'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Xem bản đồ vệ tinh & radar"
            >
              <MapIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Nút bấm Kích hoạt Định vị GPS Thực tế */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-2">
          <div className="flex items-center space-x-1.5 text-xs text-slate-300">
            <span
              className={`w-2 h-2 rounded-full ${
                userLocation.isGpsActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
              }`}
            />
            <span className="truncate max-w-[170px] text-[11px] font-medium">
              {userLocation.isGpsActive ? 'GPS Thực tế' : userLocation.label}
            </span>
          </div>

          <button
            onClick={handleRequestGps}
            disabled={isLocating}
            className="px-3 py-1.5 rounded-xl bg-orange-500/90 hover:bg-orange-500 text-white text-xs font-bold flex items-center space-x-1 shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Đang dò GPS...' : '📍 Định vị GPS'}</span>
          </button>
        </div>

        {gpsError && <p className="text-[11px] text-amber-300 mt-1.5">{gpsError}</p>}
      </div>

      {/* ===================== KHỐI 2: TÙY CHỈNH THÀNH PHỐ, QUẬN & BÁN KÍNH QUÉT ===================== */}
      <div className="bg-white rounded-3xl p-3.5 border border-slate-100 shadow-sm space-y-3 mb-4">
        {/* Dropdown chọn Thành phố & Quận */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Thành phố
            </label>
            <div className="relative">
              <select
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full pl-2.5 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              >
                {Object.keys(CITIES_AND_DISTRICTS).map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Khu vực / Quận
            </label>
            <div className="relative">
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full pl-2.5 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              >
                {districtList.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Thanh chọn Bán kính quét vệ tinh */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
              <Compass className="w-3 h-3 mr-1 text-orange-500" />
              Bán kính quét radar
            </span>
            <span className="text-xs font-bold text-orange-600">
              {scanRadius === 0 ? 'Toàn bộ' : `≤ ${scanRadius} km`}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {[1, 3, 5, 10, 20, 0].map((r) => (
              <button
                key={r}
                onClick={() => setScanRadius(r)}
                className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition ${
                  scanRadius === r
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r === 0 ? 'Tất cả' : `${r} km`}
              </button>
            ))}
          </div>
        </div>

        {/* Thanh tìm kiếm từ khóa */}
        <div className="relative pt-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm quán nướng BBQ, lẩu nấm, ốc, phở..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* ===================== KHỐI 3: THỐNG KÊ & LIÊN KẾT NHANH VỚI QUẸT GU ===================== */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center space-x-1.5">
          <span className="text-xs font-bold text-slate-800">
            Tìm thấy {processedRestaurants.length} quán
          </span>
          {scanRadius > 0 && (
            <span className="text-[11px] text-slate-400 font-medium">(bán kính {scanRadius}km)</span>
          )}
        </div>

        {/* Nút liên kết tối ưu sang Quẹt Gu */}
        {onGoToDiscovery && (
          <button
            onClick={onGoToDiscovery}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Tìm bạn ăn hợp quán 👉</span>
          </button>
        )}
      </div>

      {/* ===================== CHẾ ĐỘ 1: BẢN ĐỒ VỆ TINH & RADAR (viewMode === 'map') ===================== */}
      {viewMode === 'map' && (
        <div className="space-y-4 mb-4">
          <div className="relative h-80 w-full bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-xl flex items-center justify-center">
            {/* Vòng tròn Radar quét vệ tinh (Concentric Radar Rings) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 rounded-full border border-orange-500/20" />
              <div className="absolute w-48 h-48 rounded-full border border-orange-500/30" />
              <div className="absolute w-32 h-32 rounded-full border border-orange-500/40" />
              <div className="absolute w-16 h-16 rounded-full border border-orange-500/50" />
              {/* Trục toạ độ chữ thập */}
              <div className="absolute w-full h-[1px] bg-orange-500/15" />
              <div className="absolute h-full w-[1px] bg-orange-500/15" />

              {/* Tia quét Radar xoay 360 độ */}
              <div
                className="absolute inset-0 rounded-full animate-spin"
                style={{
                  background:
                    'conic-gradient(from 0deg, rgba(249, 115, 22, 0.4) 0deg, rgba(249, 115, 22, 0) 60deg, transparent 360deg)',
                  animationDuration: '4s',
                  animationTimingFunction: 'linear',
                  animationIterationCount: 'infinite'
                }}
              />
            </div>

            {/* Điểm GPS trung tâm của bạn */}
            <div className="absolute z-20 flex flex-col items-center pointer-events-none">
              <div className="relative">
                <div className="w-4 h-4 rounded-full bg-sky-400 border-2 border-white shadow-lg animate-ping" />
                <div className="absolute inset-0 w-4 h-4 rounded-full bg-sky-500 border-2 border-white shadow-lg" />
              </div>
              <span className="text-[10px] font-black text-sky-300 mt-1 bg-black/60 px-1.5 py-0.5 rounded-md border border-sky-400/30">
                Bạn ở đây
              </span>
            </div>

            {/* Các Marker quán ăn trên bản đồ */}
            {processedRestaurants.map((r, idx) => {
              // Tính toạ độ phân bổ tương đối từ toạ độ GPS
              const dx = ((r.lng || 106.7) - userLocation.lng) * 1800;
              const dy = -((r.lat || 10.77) - userLocation.lat) * 1800;

              // Giới hạn trong khung map
              const clampedX = Math.max(-120, Math.min(120, dx));
              const clampedY = Math.max(-120, Math.min(120, dy));

              const isSelected = selectedMapRest?.id === r.id;

              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedMapRest(r)}
                  style={{
                    transform: `translate(${clampedX}px, ${clampedY}px)`
                  }}
                  className={`absolute z-30 flex flex-col items-center group transition active:scale-95`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-md border-2 transition ${
                      isSelected
                        ? 'bg-orange-500 border-white text-white scale-125 z-40'
                        : r.isPartner
                        ? 'bg-amber-500 border-white text-white'
                        : 'bg-white border-orange-500 text-orange-600'
                    }`}
                  >
                    📍
                  </div>
                  <span className="text-[9px] font-bold text-white max-w-[70px] truncate bg-black/75 px-1 rounded mt-0.5 border border-white/20">
                    {r.name.split(' ')[0]} ({r.calculatedDistance}km)
                  </span>
                </button>
              );
            })}

            {/* Badge vệ tinh góc trái */}
            <div className="absolute top-3 left-3 z-30 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-orange-400 border border-orange-500/30 flex items-center space-x-1">
              <Radar className="w-3 h-3 animate-spin" />
              <span>Vệ Tinh GPS Đang Quét</span>
            </div>
          </div>

          {/* Card Quán Đang Chọn Trên Bản Đồ (Popup Nổi) */}
          {selectedMapRest ? (
            <div className="bg-white rounded-3xl p-3.5 border border-orange-200 shadow-md animate-in fade-in space-y-2.5">
              <div className="flex items-start space-x-3">
                <img
                  src={selectedMapRest.imageUrl}
                  alt={selectedMapRest.name}
                  className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-100"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{selectedMapRest.name}</h4>
                    <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100 shrink-0">
                      Cách {selectedMapRest.calculatedDistance} km
                    </span>
                  </div>
                  <p className="text-xs text-orange-600 font-semibold">{selectedMapRest.cuisine}</p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{selectedMapRest.address}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <button
                  onClick={() => onInviteAtRestaurant(selectedMapRest)}
                  className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 hover:brightness-105 transition flex items-center justify-center space-x-1 active:scale-98"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Rủ Bạn Ăn Tại Quán Này</span>
                </button>
                <button
                  onClick={() => setSelectedMapRest(null)}
                  className="px-3 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          ) : (
            <p className="text-center text-xs text-slate-400">
              👉 Nhấn vào các điểm đánh dấu 📍 trên bản đồ để xem chi tiết quán và rủ bạn ăn.
            </p>
          )}
        </div>
      )}

      {/* ===================== CHẾ ĐỘ 2: DANH SÁCH THẺ QUÁN ĂN (viewMode === 'list') ===================== */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {processedRestaurants.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center shadow-xs">
              <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 mx-auto flex items-center justify-center mb-3">
                <Compass className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800 text-base mb-1">
                Không tìm thấy quán trong bán kính này
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4 leading-relaxed">
                Hãy mở rộng bán kính quét radar (ví dụ 10km hoặc 20km) hoặc chọn &quot;Tất cả quận&quot; để khám phá thêm nhiều địa điểm hấp dẫn nhé!
              </p>
              <button
                onClick={() => {
                  setScanRadius(20);
                  setSelectedDistrict('Tất cả quận');
                  setSearchTerm('');
                }}
                className="py-2.5 px-5 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition"
              >
                Mở rộng bán kính & hiển thị tất cả
              </button>
            </div>
          ) : (
            processedRestaurants.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition group"
              >
                {/* Image & Badges */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={r.imageUrl}
                    alt={r.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 flex items-center shadow-xs">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 mr-1" />
                    <span>
                      {r.rating} ({r.reviewsCount})
                    </span>
                  </div>

                  {/* Khoảng cách GPS thực tế */}
                  <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center space-x-1">
                    <Navigation className="w-3 h-3 text-orange-400" />
                    <span>Cách bạn {r.calculatedDistance} km</span>
                  </div>

                  {r.isPartner && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                      Đối tác FoodMate
                    </div>
                  )}
                </div>

                {/* Info Container */}
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{r.name}</h4>
                      <span className="text-xs text-orange-600 font-semibold">{r.cuisine}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg shrink-0">
                      {r.priceTier}
                    </span>
                  </div>

                  <div className="flex items-center text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-orange-500 mr-1 shrink-0" />
                    <span className="truncate">{r.address}</span>
                  </div>

                  {/* Tags */}
                  {r.tags && r.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {r.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Ưu đãi Đối tác */}
                  {r.discount && (
                    <div className="bg-orange-50 border border-orange-200/80 rounded-xl p-2 text-xs text-orange-800 font-medium flex items-center space-x-1.5">
                      <Tag className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                      <span>{r.discount}</span>
                    </div>
                  )}

                  {/* Nút hành động liên kết */}
                  <div className="pt-1 flex items-center space-x-2">
                    <button
                      onClick={() => onInviteAtRestaurant(r)}
                      className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-105 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 shadow-sm active:scale-98"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Rủ bạn ăn tại quán này</span>
                    </button>

                    {onGoToDiscovery && (
                      <button
                        onClick={onGoToDiscovery}
                        title="Tìm bạn ăn thích món quán này"
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                      >
                        <Users className="w-4 h-4 text-orange-500" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
