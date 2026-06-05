export type Lang = 'ar' | 'en';

export const translations: Record<Lang, Record<string, string>> = {
  ar: {
    // Auth
    appName: 'IKIGAI Quest',
    appTagline: 'رحلة المؤتمر التفاعلية',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    signIn: 'تسجيل الدخول',
    loginFailed: 'فشل تسجيل الدخول',
    invalidCredentials: 'بيانات خاطئة. حاول مرة أخرى.',
    enterCredentials: 'أدخل البريد وكلمة المرور',
    useConferenceCredentials: 'استخدم بيانات المؤتمر لتسجيل الدخول',

    // Tabs
    home: 'الرئيسية',
    leaderboard: 'الترتيب',
    scanQr: 'QR',
    quizzes: 'مسابقات',
    profile: 'حسابي',

    // Home
    welcomeBack: 'مرحباً بعودتك،',
    totalXp: 'إجمالي النقاط',
    conferenceXp: 'نقاط المؤتمر',
    sportsXp: 'نقاط الرياضة',
    yourTribe: 'فريقك',
    quickActions: 'إجراءات سريعة',
    recentActivity: 'النشاط الأخير',
    noActivityYet: 'لا يوجد نشاط بعد. ابدأ بجمع النقاط!',
    scanQrAction: 'مسح QR',
    leaderboardAction: 'الترتيب',
    quizzesAction: 'المسابقات',
    sportsAction: 'الرياضة',

    // Leaderboard
    individual: 'الأفراد',
    tribes: 'الفرق',
    noEntries: 'لا توجد نتائج',
    members: 'أعضاء',

    // Scanner
    scanQrCode: 'مسح رمز QR',
    attendance: 'الحضور',
    bonus: 'المكافأة',
    pointCamera: 'وجّه الكاميرا نحو رمز QR',
    pointCameraAttendance: 'وجّه الكاميرا نحو رمز QR للجلسة',
    pointCameraBonus: 'وجّه الكاميرا نحو رمز QR للمكافأة',
    processing: 'جاري المعالجة...',
    scanAgain: 'مسح مرة أخرى',
    cameraRequired: 'مطلوب إذن الكاميرا',
    cameraExplanation: 'نحتاج للكاميرا لمسح رموز QR للحضور والمكافآت.',
    grantPermission: 'منح الإذن',
    scanFailed: 'فشل المسح. حاول مرة أخرى.',

    // Quizzes
    testKnowledge: 'اختبر معلوماتك واكسب نقاط',
    noQuizzes: 'لا توجد مسابقات',
    checkLater: 'تحقق لاحقاً من المسابقات الجديدة',
    quizComplete: 'انتهت المسابقة!',
    correct: 'صحيح',
    done: 'تم',
    next: 'التالي',
    previous: 'السابق',
    submit: 'إرسال',
    failedToLoad: 'فشل تحميل المسابقة',
    failedToSubmit: 'فشل إرسال المسابقة',

    // Profile
    totalXpLabel: 'إجمالي النقاط',
    level: 'المستوى',
    tribe: 'الفريق',
    none: 'لا يوجد',
    xpBreakdown: 'تفصيل النقاط',
    attendanceXp: 'الحضور',
    quizXp: 'المسابقات',
    bonusAwards: 'المكافآت',
    sports: 'الرياضة',
    other: 'أخرى',
    xpHistory: 'سجل النقاط',
    noTransactions: 'لا توجد معاملات بعد',
    logout: 'تسجيل خروج',
    logoutConfirm: 'هل تريد تسجيل الخروج؟',
    cancel: 'إلغاء',

    // Sports
    footballMatches: 'مباريات كرة القدم',
    noMatches: 'لا توجد مباريات بعد',
    matchesAppearHere: 'ستظهر مباريات كرة القدم هنا',

    // General
    xp: 'نقطة',
    error: 'خطأ',

    // Language
    language: 'اللغة',
    arabic: 'العربية',
    english: 'English',
  },
  en: {
    // Auth
    appName: 'IKIGAI Quest',
    appTagline: 'Your conference gamification journey',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign In',
    loginFailed: 'Login Failed',
    invalidCredentials: 'Invalid credentials. Please try again.',
    enterCredentials: 'Please enter email and password',
    useConferenceCredentials: 'Use your conference credentials to log in',

    // Tabs
    home: 'Home',
    leaderboard: 'Ranks',
    scanQr: 'Scan',
    quizzes: 'Quizzes',
    profile: 'Profile',

    // Home
    welcomeBack: 'Welcome back,',
    totalXp: 'Total XP',
    conferenceXp: 'Conference',
    sportsXp: 'Sports',
    yourTribe: 'Your Team',
    quickActions: 'Quick Actions',
    recentActivity: 'Recent Activity',
    noActivityYet: 'No activity yet. Start earning XP!',
    scanQrAction: 'Scan QR',
    leaderboardAction: 'Leaderboard',
    quizzesAction: 'Quizzes',
    sportsAction: 'Sports',

    // Leaderboard
    individual: 'Individual',
    tribes: 'Teams',
    noEntries: 'No entries yet',
    members: 'members',

    // Scanner
    scanQrCode: 'Scan QR Code',
    attendance: 'Attendance',
    bonus: 'Bonus',
    pointCamera: 'Point camera at a QR code',
    pointCameraAttendance: 'Point camera at a session QR code',
    pointCameraBonus: 'Point camera at a bonus QR code',
    processing: 'Processing...',
    scanAgain: 'Scan Again',
    cameraRequired: 'Camera Access Required',
    cameraExplanation: 'We need camera access to scan QR codes for attendance and bonus points.',
    grantPermission: 'Grant Permission',
    scanFailed: 'Scan failed. Try again.',

    // Quizzes
    testKnowledge: 'Test your knowledge and earn XP',
    noQuizzes: 'No Quizzes Available',
    checkLater: 'Check back later for new quizzes',
    quizComplete: 'Quiz Complete!',
    correct: 'correct',
    done: 'Done',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    failedToLoad: 'Failed to load quiz',
    failedToSubmit: 'Failed to submit quiz',

    // Profile
    totalXpLabel: 'Total XP',
    level: 'Level',
    tribe: 'Team',
    none: 'None',
    xpBreakdown: 'XP Breakdown',
    attendanceXp: 'Attendance',
    quizXp: 'Quizzes',
    bonusAwards: 'Bonus & Awards',
    sports: 'Sports',
    other: 'Other',
    xpHistory: 'XP History',
    noTransactions: 'No XP transactions yet',
    logout: 'Logout',
    logoutConfirm: 'Are you sure you want to log out?',
    cancel: 'Cancel',

    // Sports
    footballMatches: 'Football matches & XP',
    noMatches: 'No Matches Yet',
    matchesAppearHere: 'Football matches will appear here',

    // General
    xp: 'XP',
    error: 'Error',

    // Language
    language: 'Language',
    arabic: 'العربية',
    english: 'English',
  },
};
