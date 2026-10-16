// Danh mục Master Data theo SCHEMA.sql & SRS.md

export const MASTER_CUISINES = [
  { code: 'VN_TRAD', name: 'Món Việt truyền thống', icon: '🍲', group: 'Bản địa' },
  { code: 'VN_STREET', name: 'Ăn vặt / Đường phố', icon: '🍢', group: 'Ăn vặt' },
  { code: 'KOR_BBQ', name: 'Món Hàn & BBQ', icon: '🥩', group: 'Châu Á' },
  { code: 'JPN_SUSHI', name: 'Món Nhật & Sushi', icon: '🍣', group: 'Châu Á' },
  { code: 'CHN_DIM', name: 'Món Hoa & Dimsum', icon: '🥟', group: 'Châu Á' },
  { code: 'THA_HOT', name: 'Món Thái chua cay', icon: '🌶️', group: 'Châu Á' },
  { code: 'WES_STEAK', name: 'Món Âu & Steak', icon: '🍷', group: 'Âu Mỹ' },
  { code: 'HOTPOT', name: 'Lẩu các loại', icon: '🥘', group: 'Đi nhóm' },
  { code: 'VEG_PURE', name: 'Món Chay & Healthy', icon: '🥗', group: 'Healthy' },
  { code: 'CAFE_DES', name: 'Cà phê & Tráng miệng', icon: '☕', group: 'Thư giãn' },
];

export const BUDGET_TIERS = [
  { code: 'BUDGET_T1', name: 'Bình dân (< 50k)', desc: 'Cơm tấm, bún riêu, vỉa hè' },
  { code: 'BUDGET_T2', name: 'Phổ thông (50k - 150k)', desc: 'Quán ăn gia đình, gà rán, trà sữa' },
  { code: 'BUDGET_T3', name: 'Trung cấp (150k - 300k)', desc: 'Lẩu, nướng BBQ, đồ Hàn' },
  { code: 'BUDGET_T4', name: 'Tiệm cận cao cấp (300k - 500k)', desc: 'Sushi, Steak, Bistro' },
  { code: 'BUDGET_T5', name: 'Cao cấp (> 500k)', desc: 'Fine dining, Omakase' },
];

export const INITIAL_MY_PROFILE = {
  id: 'me-user-01',
  fullName: 'Minh Khoa',
  age: 25,
  gender: 'Nam',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
  bio: 'Mê lẩu nấm & đồ nướng Hàn Quốc, tìm bạn ăn chung mỗi tối cuối tuần quanh Q1 & Bình Thạnh!',
  occupation: 'Software Engineer',
  trustScore: 98,
  isVerified: true,
  tasteProfile: {
    cuisines: ['VN_TRAD', 'KOR_BBQ', 'HOTPOT'],
    spicyLevel: 3,
    budgetTier: 'BUDGET_T3',
    connectionPurpose: 'food_buddy', // 'food_buddy', 'friendship', 'dating'
    favoriteDish: 'Lẩu Nấm Bò Wagyu',
    allergies: ['Dị ứng tôm cua biển'],
    dietary: 'Ăn tự do',
    maxDistanceKm: 10,
  }
};

export const MOCK_DISCOVERY_CARDS = [
  {
    id: 'user-02',
    fullName: 'Lê Mai Phương',
    age: 24,
    gender: 'Nữ',
    occupation: 'Content Creator',
    distanceKm: 2.4,
    compatibilityScore: 94.5,
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80'
    ],
    bio: 'Đam mê đồ cay cấp 3 trở lên! Cuối tuần thích lang thang hàng quán hoặc ghé quán nướng thơm nức.',
    favoriteDish: 'Mì cay hải sản & Lẩu Tomyum',
    cuisines: ['THA_HOT', 'KOR_BBQ', 'HOTPOT'],
    spicyLevel: 4,
    budgetTier: 'BUDGET_T2',
    connectionPurpose: 'Bạn ăn uống (Food Buddy)',
    isVerified: true,
  },
  {
    id: 'user-03',
    fullName: 'Hoàng Nam',
    age: 26,
    gender: 'Nam',
    occupation: 'UX/UI Designer',
    distanceKm: 3.8,
    compatibilityScore: 88.0,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80'
    ],
    bio: 'Thích khám phá các quán cà phê specialty yên tĩnh và quán Nhật tinh tế. Ăn thanh đạm, ít dầu mỡ.',
    favoriteDish: 'Sashimi Cá Hồi & Matcha Latte',
    cuisines: ['JPN_SUSHI', 'CAFE_DES', 'VN_TRAD'],
    spicyLevel: 1,
    budgetTier: 'BUDGET_T3',
    connectionPurpose: 'Kết nối bạn bè (Friendship)',
    isVerified: true,
  },
  {
    id: 'user-04',
    fullName: 'Khánh Linh',
    age: 23,
    gender: 'Nữ',
    occupation: 'Marketing Specialist',
    distanceKm: 1.5,
    compatibilityScore: 91.2,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80'
    ],
    bio: 'Team mê món cuốn và ăn vặt Sài Gòn. Ai biết quán ốc nào tươi ngon kéo mình đi với nha!',
    favoriteDish: 'Bánh tráng cuốn thịt heo & Ốc bươu nướng tiêu',
    cuisines: ['VN_STREET', 'VN_TRAD', 'HOTPOT'],
    spicyLevel: 2,
    budgetTier: 'BUDGET_T2',
    connectionPurpose: 'Bạn ăn uống (Food Buddy)',
    isVerified: false,
  },
  {
    id: 'user-05',
    fullName: 'Thành Đạt',
    age: 27,
    gender: 'Nam',
    occupation: 'Data Analyst',
    distanceKm: 5.2,
    compatibilityScore: 82.5,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80'
    ],
    bio: 'Ăn chay bán thời gian (Thứ 2 & ngày rằm). Cuối tuần hay đi tìm các nhà hàng thuần chay sáng tạo.',
    favoriteDish: 'Nấm nướng tiêu xanh & Cơm sen',
    cuisines: ['VEG_PURE', 'VN_TRAD', 'CAFE_DES'],
    spicyLevel: 2,
    budgetTier: 'BUDGET_T3',
    connectionPurpose: 'Ăn uống & trò chuyện',
    isVerified: true,
  }
];

export const MOCK_RESTAURANTS = [
  {
    id: 'rest-01',
    name: 'Lẩu Nấm An Nhiên',
    address: '71 Mạc Đĩnh Chi, P. Đa Kao, Quận 1, TP.HCM',
    district: 'Quận 1',
    city: 'Hồ Chí Minh',
    cuisine: 'Lẩu & Chay Thanh Đạm',
    priceTier: '150k - 250k / người',
    rating: 4.8,
    reviewsCount: 142,
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80',
    tags: ['Thanh đạm', 'Không gian ấm cúng', 'Phù hợp hẹn 2 người'],
    isPartner: true,
    discount: 'Giảm 10% cho thành viên FoodMate Check-in'
  },
  {
    id: 'rest-02',
    name: 'Gyu-Kaku Japanese BBQ',
    address: '15 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM',
    district: 'Quận 1',
    city: 'Hồ Chí Minh',
    cuisine: 'Món Nhật & BBQ',
    priceTier: '300k - 450k / người',
    rating: 4.7,
    reviewsCount: 289,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    tags: ['Thịt bò hảo hạng', 'Buffet nướng', 'View đẹp'],
    isPartner: true,
    discount: 'Tặng tráng miệng kem matcha'
  },
  {
    id: 'rest-03',
    name: 'Som Tum Thai Bistro',
    address: '29 Lê Duẩn, Bến Nghé, Quận 1, TP.HCM',
    district: 'Quận 1',
    city: 'Hồ Chí Minh',
    cuisine: 'Món Thái chua cay',
    priceTier: '180k - 300k / người',
    rating: 4.6,
    reviewsCount: 110,
    imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&auto=format&fit=crop&q=80',
    tags: ['Cay nồng đúng điệu', 'Gỏi đu đủ giòn', 'Trà sữa Thái'],
    isPartner: false,
  },
  {
    id: 'rest-04',
    name: 'Phở Thìn 13 Lò Đúc (Chi nhánh Sài Gòn)',
    address: '110 Hai Bà Trưng, Đa Kao, Quận 1, TP.HCM',
    district: 'Quận 1',
    city: 'Hồ Chí Minh',
    cuisine: 'Món Việt truyền thống',
    priceTier: '75k - 100k / người',
    rating: 4.5,
    reviewsCount: 350,
    imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&auto=format&fit=crop&q=80',
    tags: ['Phở bò tái lăn', 'Nước dùng đậm đà', 'Bữa sáng / trưa'],
    isPartner: false,
  }
];

export const MOCK_INVITES = [
  {
    id: 'inv-101',
    inviteCode: 'INV-202610-8831',
    partnerName: 'Lê Mai Phương',
    partnerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
    restaurantName: 'Lẩu Nấm An Nhiên',
    restaurantAddress: '71 Mạc Đĩnh Chi, P. Đa Kao, Quận 1',
    scheduledAt: '19:00 - Thứ Bảy này (18/10)',
    paymentPolicy: 'Chia đôi hóa đơn (50/50)',
    note: 'Mình đi lẩu nấm nhé, quán này thanh đạm chuẩn gu cả 2 đứa luôn!',
    status: 'accepted', // 'pending', 'accepted', 'checked_in', 'completed'
    myCheckIn: true,
    partnerCheckIn: false,
    shareSafetyToken: 'sec_safe_token_88992',
  }
];

export const MOCK_CHATS = [
  {
    id: 'chat-01',
    partnerId: 'user-02',
    partnerName: 'Lê Mai Phương',
    partnerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
    lastMessage: 'Ok chốt lịch 19h tối Thứ Bảy nhé Khoa ơi!',
    lastMessageTime: '14:25',
    unreadCount: 0,
    messages: [
      { id: 1, sender: 'them', text: 'Chào Khoa! Thấy bạn cũng mê lẩu với đồ nướng cay hả? 😋', time: '14:15' },
      { id: 2, sender: 'me', text: 'Đúng rồi nè Phương! Mình ăn được cay mức 3 á, cuối tuần này bạn có rảnh đi ăn không?', time: '14:18' },
      { id: 3, sender: 'them', text: 'Trùng hợp ghê, cuối tuần này mình đang thèm lẩu nấm hoặc lẩu Thái nè!', time: '14:20' },
      { id: 4, sender: 'me', text: 'Mình mới gửi lời mời qua quán Lẩu Nấm An Nhiên nè, bạn xem thử nhé!', time: '14:22' },
      { id: 5, sender: 'them', text: 'Ok chốt lịch 19h tối Thứ Bảy nhé Khoa ơi! 🎉', time: '14:25' }
    ]
  }
];
