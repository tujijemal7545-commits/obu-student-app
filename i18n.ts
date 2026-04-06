import { I18n } from 'i18n-js';

const translations = {
  English: {
    welcome: 'Welcome back,',
    dashboard: 'Dashboard Hub',
    students_db: 'Students Database',
    students_db_sub: 'View & Search Student Records',
    register: 'Register Student',
    register_sub: 'Add a new student to registry',
    users: 'User Management',
    users_sub: 'Create & manage Admins',
    attendance: 'Attendance Scanner',
    attendance_sub: 'Scan QR Codes',
    analytics: 'Analytics & PDF Export',
    analytics_sub: 'Statistics & registry downloads',
    my_account: 'My Account',
    my_account_sub: 'Profile settings & preferences',
    settings: 'System Settings',
    settings_sub: 'Theme, Language, Logout'
  },
  Oromo: {
    welcome: 'Baga Nagaan Deebitan,',
    dashboard: 'Giddugala Daashboordii',
    students_db: 'Kuusaa Ragaa Barattootaa',
    students_db_sub: 'Ragaa barattootaa ilaali fi barbaadi',
    register: 'Barataa Galmeessi',
    register_sub: 'Barataa haaraa galmeessi',
    users: 'Bulchiinsa Fayyadamtootaa',
    users_sub: 'Admiinii haaraa uumi',
    attendance: 'Koodii QR Iskaanii',
    attendance_sub: 'Hirmaannaa barattootaa',
    analytics: 'Istaatistiksii fi PDF',
    analytics_sub: 'Gabaasa buufadhu',
    my_account: 'Herrega Koo',
    my_account_sub: 'Sajoo pirofaayilii',
    settings: 'Sajoo Sirnichaa',
    settings_sub: 'Dhaabbata, Afaan, Ba\'i'
  },
  Arabic: {
    welcome: 'مرحباً بعودتك،',
    dashboard: 'لوحة القيادة',
    students_db: 'قاعدة بيانات الطلاب',
    students_db_sub: 'عرض والبحث في سجلات الطلاب',
    register: 'تسجيل طالب',
    register_sub: 'إضافة طالب جديد إلى السجل',
    users: 'إدارة المستخدمين',
    users_sub: 'إنشاء وإدارة المسؤولين',
    attendance: 'ماسح الحضور',
    attendance_sub: 'مسح رموز الاستجابة السريعة',
    analytics: 'التحليلات وتصدير PDF',
    analytics_sub: 'الإحصائيات وتنزيلات السجل',
    my_account: 'حسابي',
    my_account_sub: 'إعدادات الملف الشخصي',
    settings: 'إعدادات النظام',
    settings_sub: 'السمة، اللغة، تسجيل الخروج'
  }
};

const i18n = new I18n(translations);
i18n.locale = 'English';
i18n.enableFallback = true;
i18n.defaultLocale = 'English';

export default i18n;
