"use client";

import { useState, useEffect } from "react";
import { User, Calendar, FileText, Settings, Bell, BookOpen, Heart, Award, Clock, ChevronLeft, ChevronRight, MapPin, LogOut, Edit } from "lucide-react";

export default function DashboardPage({ params }: { params: Promise<{ lang: string }> }) {
  const [lang] = useState("ar");
  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const [user] = useState({
    name: isArabic ? "أحمد محمد علي" : "Ahmed Mohammed Ali",
    email: "ahmed@example.com",
    memberSince: "2023",
    membershipType: isArabic ? "عضوية مميزة" : "Premium Membership",
    studentId: "AIU-2020-1234",
    faculty: isArabic ? "كلية الهندسة" : "Faculty of Engineering",
  });

  const quickActions = [
    { icon: Calendar, title: isArabic ? "الأحداث" : "Events", href: "#events", color: "bg-primary/10 text-primary" },
    { icon: FileText, title: isArabic ? "الموارد" : "Resources", href: "#resources", color: "bg-secondary/10 text-secondary" },
    { icon: Heart, title: isArabic ? "التبرعات" : "Donations", href: "#donations", color: "bg-error/10 text-error" },
    { icon: Award, title: isArabic ? "الشهادات" : "Certificates", href: "#certificates", color: "bg-accent/10 text-accent" },
    { icon: BookOpen, title: isArabic ? "الإرشاد" : "Mentoring", href: "#mentoring", color: "bg-primary/10 text-primary" },
    { icon: Settings, title: isArabic ? "الإعدادات" : "Settings", href: "#settings", color: "bg-text-secondary/10 text-text-secondary" },
  ];

  const upcomingEvents = [
    { title: isArabic ? "ورشة المهارات المهنية" : "Professional Skills Workshop", date: isArabic ? "10 يوليو 2026" : "July 10, 2026", time: "09:00 AM", location: isArabic ? "قاعة المؤتمرات" : "Conference Hall" },
    { title: isArabic ? "يوم التوظيف" : "Career Day", date: isArabic ? "25 يوليو 2026" : "July 25, 2026", time: "10:00 AM", location: isArabic ? "المكتبة المركزية" : "Central Library" },
    { title: isArabic ? "حلقة نقاش" : "Panel Discussion", date: isArabic ? "5 أغسطس 2026" : "August 5, 2026", time: "02:00 PM", location: isArabic ? "صالة الندوات" : "Seminar Hall" },
  ];

  const recentActivity = [
    { action: isArabic ? "تم تحديث الملف الشخصي" : "Profile updated", time: isArabic ? "منذ ساعتين" : "2 hours ago", icon: Edit },
    { action: isArabic ? "تم التسجيل في ورشة عمل" : "Registered for workshop", time: isArabic ? "منذ يوم" : "1 day ago", icon: Calendar },
    { action: isArabic ? "تم تحميل شهادة العضوية" : "Membership certificate downloaded", time: isArabic ? "منذ 3 أيام" : "3 days ago", icon: Award },
    { action: isArabic ? "تم إرسال طلب إرشاد" : "Mentoring request sent", time: isArabic ? "منذ أسبوع" : "1 week ago", icon: BookOpen },
  ];

  return (
    <div dir={dir} className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">
            {isArabic ? `مرحباً، ${user.name}` : `Welcome, ${user.name}`}
          </h1>
          <p className="text-text-secondary">
            {isArabic ? "لوحة التحكم الخاصة بك" : "Your Dashboard"}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Summary */}
            <div className="bg-surface rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-text">{isArabic ? "ملفي الشخصي" : "My Profile"}</h2>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                  {isArabic ? "تعديل" : "Edit"}
                </button>
              </div>
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <div className="flex-1 grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-text-light text-xs mb-1">{isArabic ? "الاسم" : "Name"}</p>
                    <p className="font-medium text-text">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-text-light text-xs mb-1">{isArabic ? "البريد الإلكتروني" : "Email"}</p>
                    <p className="font-medium text-text">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-text-light text-xs mb-1">{isArabic ? "رقم الطالب" : "Student ID"}</p>
                    <p className="font-medium text-text">{user.studentId}</p>
                  </div>
                  <div>
                    <p className="text-text-light text-xs mb-1">{isArabic ? "الكلية" : "Faculty"}</p>
                    <p className="font-medium text-text">{user.faculty}</p>
                  </div>
                  <div>
                    <p className="text-text-light text-xs mb-1">{isArabic ? "عضو منذ" : "Member Since"}</p>
                    <p className="font-medium text-text">{user.memberSince}</p>
                  </div>
                  <div>
                    <p className="text-text-light text-xs mb-1">{isArabic ? "نوع العضوية" : "Membership Type"}</p>
                    <p className="font-medium text-secondary">{user.membershipType}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-surface rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-text mb-6">{isArabic ? "إجراءات سريعة" : "Quick Actions"}</h2>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {quickActions.map((action, i) => (
                  <a key={i} href={action.href} className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-background transition-colors text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${action.color}`}>
                      <action.icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-medium text-text">{action.title}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-surface rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-text">{isArabic ? "الأحداث القادمة" : "Upcoming Events"}</h2>
                <a href="#" className="flex items-center gap-1 text-primary text-sm font-medium hover:gap-2 transition-all">
                  {isArabic ? "عرض الكل" : "View All"}
                  {isArabic ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </a>
              </div>
              <div className="space-y-4">
                {upcomingEvents.map((event, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-background rounded-xl border border-border hover:border-primary/30 transition-all">
                    <div className="w-14 h-14 bg-primary rounded-xl flex flex-col items-center justify-center text-white shrink-0">
                      <span className="text-xs font-bold">{event.date.split(" ")[0]}</span>
                      <span className="text-lg font-bold">{event.date.split(" ")[1]}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-text text-sm">{event.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-text-light mt-1">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-all">
                      {isArabic ? "تسجيل" : "Register"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Membership Card */}
            <div className="bg-gradient-to-br from-primary to-primary-light rounded-2xl p-6 text-white">
              <Award className="w-8 h-8 text-secondary mb-4" />
              <h3 className="font-bold text-lg mb-1">{user.membershipType}</h3>
              <p className="text-white/70 text-sm mb-4">{isArabic ? "عضو منذ" : "Member since"} {user.memberSince}</p>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-white/60 text-xs mb-1">{isArabic ? "رقم العضوية" : "Membership ID"}</p>
                <p className="font-bold">{user.studentId}</p>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-surface rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-text">{isArabic ? "الإشعارات" : "Notifications"}</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                  <div>
                    <p className="text-sm text-text">{isArabic ? "حدث جديد قريب" : "New upcoming event"}</p>
                    <p className="text-xs text-text-light">{isArabic ? "ورشة المهارات المهنية" : "Professional Skills Workshop"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-background rounded-lg">
                  <div className="w-2 h-2 bg-text-light rounded-full mt-2 shrink-0" />
                  <div>
                    <p className="text-sm text-text">{isArabic ? "تم تأكيد تسجيلك" : "Your registration confirmed"}</p>
                    <p className="text-xs text-text-light">{isArabic ? "يوم التوظيف" : "Career Day"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-surface rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-text mb-4">{isArabic ? "النشاط الأخير" : "Recent Activity"}</h3>
              <div className="space-y-3">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <activity.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text truncate">{activity.action}</p>
                      <p className="text-xs text-text-light">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Logout */}
            <button className="flex items-center justify-center gap-2 w-full py-3 bg-error/10 text-error rounded-xl font-bold hover:bg-error/20 transition-all">
              <LogOut className="w-5 h-5" />
              {isArabic ? "تسجيل الخروج" : "Logout"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
