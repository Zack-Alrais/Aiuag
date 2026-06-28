import { Phone, Mail, MapPin, Clock, ExternalLink } from "lucide-react";
import HeroSection from "@/components/ui/hero-section";
import ContactForm from "@/components/ui/contact-form";

const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/5QYUhErRpQXMsdSY8";
const MAPS_EMBED_URL = "https://www.google.com/maps?q=15.532935,32.566055&z=15&output=embed";

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const contactInfo = [
    { icon: Phone, title: isArabic ? "الهاتف" : "Phone", value: "+249 11 421 0853", link: "tel:+249114210853" },
    { icon: Mail, title: isArabic ? "البريد الإلكتروني" : "Email", value: "aiuagho@gmail.com", link: "mailto:aiuagho@gmail.com" },
    { icon: MapPin, title: isArabic ? "العنوان" : "Address", value: isArabic ? "الخرطوم - السودان" : "Khartoum - Sudan", link: GOOGLE_MAPS_URL },
    { icon: Clock, title: isArabic ? "ساعات العمل" : "Working Hours", value: isArabic ? "الأحد - الخميس: 8 ص - 4 م" : "Sun - Thu: 8 AM - 4 PM", link: "#" },
  ];

  return (
    <div dir={dir}>
      <HeroSection
        pageSlug="contact"
        lang={lang}
        defaultTitle={isArabic ? "اتصل بنا" : "Contact Us"}
        defaultSubtitle={isArabic ? "نحن هنا لمساعدتك. تواصل معنا لأي استفسار أو دعم" : "We are here to help you. Contact us for any inquiry or support"}
      />

      {/* Contact Info Cards */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, i) => (
              <a key={i} href={info.link} target={info.link.startsWith("http") ? "_blank" : undefined} rel={info.link.startsWith("http") ? "noopener noreferrer" : undefined} className="bg-surface rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all hover:border-primary/30 border border-border">
                <div className="w-14 h-14 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <info.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold text-text mb-2">{info.title}</h3>
                <p className="text-text-secondary text-sm">{info.value}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Form + Map */}
      <section className="py-20 bg-surface">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              <h2 className="text-2xl font-bold text-text mb-6">{isArabic ? "أرسل لنا رسالة" : "Send Us a Message"}</h2>
              <ContactForm lang={lang} />
            </div>

            {/* Map */}
            <div>
              <h2 className="text-2xl font-bold text-text mb-6">{isArabic ? "موقعنا" : "Our Location"}</h2>
              <div className="rounded-2xl overflow-hidden border border-border shadow-sm h-[250px] sm:h-[300px] lg:h-[400px]">
                <iframe
                  src={MAPS_EMBED_URL}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={isArabic ? "موقع الرابطة على الخريطة" : "Association Location on Map"}
                />
              </div>
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                {isArabic ? "فتح في خرائط جوجل" : "Open in Google Maps"}
              </a>
              <div className="mt-6 bg-background rounded-xl p-5">
                <h3 className="font-bold text-text mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  {isArabic ? "ساعات العمل" : "Working Hours"}
                </h3>
                <div className="space-y-2 text-sm text-text-secondary">
                  <div className="flex justify-between">
                    <span>{isArabic ? "الأحد - الخميس" : "Sunday - Thursday"}</span>
                    <span className="font-medium text-text">{isArabic ? "8:00 ص - 4:00 م" : "8:00 AM - 4:00 PM"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{isArabic ? "الجمعة - السبت" : "Friday - Saturday"}</span>
                    <span className="font-medium text-error">{isArabic ? "عطلة" : "Closed"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
