import { NextRequest, NextResponse } from "next/server";

const PAGE_ID = "100086028244784";
const FB_TOKEN = process.env.FACEBOOK_PAGE_TOKEN || "";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!FB_TOKEN) {
      return NextResponse.json(
        {
          error: "Facebook token not configured",
          posts: getDemoPosts(),
          isDemo: true,
        },
        { status: 200 }
      );
    }

    const url = `https://graph.facebook.com/v19.0/${PAGE_ID}/posts?fields=message,created_time,full_picture,permalink_url,shares&limit=${limit}&access_token=${FB_TOKEN}`;

    const res = await fetch(url, { next: { revalidate: 300 } });

    if (!res.ok) {
      return NextResponse.json(
        {
          error: "Failed to fetch Facebook posts",
          posts: getDemoPosts(),
          isDemo: true,
        },
        { status: 200 }
      );
    }

    const data = await res.json();

    const posts = (data.data || []).map(
      (post: Record<string, unknown>) => ({
        id: post.id,
        message: post.message || "",
        created_time: post.created_time,
        full_picture: post.full_picture || null,
        permalink_url: post.permalink_url || `https://web.facebook.com/${PAGE_ID}/posts/${(post.id as string)?.split("_")[1]}`,
        shares: (post.shares as Record<string, number>)?.count || 0,
      })
    );

    return NextResponse.json({ posts, isDemo: false });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Server error",
        posts: getDemoPosts(),
        isDemo: true,
      },
      { status: 200 }
    );
  }
}

function getDemoPosts() {
  return [
    {
      id: "demo1",
      message:
        "🎓 تم اختتام المؤتمر السنوي لرابطة خريجي جامعة أفريقيا العالمية بحضور أكثر من 200 خريج. شكرًا لكل الحضور والمساهمين في نجاح هذا الحدث.",
      created_time: new Date(Date.now() - 86400000 * 2).toISOString(),
      full_picture: null,
      permalink_url: "https://web.facebook.com/people/%D8%B1%D8%A7%D8%A8%D8%B7%D8%A9-%D8%AE%D8%B1%D9%8A%D8%AC%D9%8A-%D8%AC%D8%A7%D9%85%D8%B9%D8%A9-%D8%A5%D9%81%D8%B1%D9%8A%D9%82%D9%8A%D8%A7-%D8%A7%D9%84%D8%B9%D8%A7%D9%84%D9%85%D9%8A%D8%A9-Association-of-IUA-Graduates/100086028244784/",
      shares: 24,
    },
    {
      id: "demo2",
      message:
        "📚افتتاح التسجيل لدورة تدريبية في الذكاء الاصطناعي وتعلم الآلة. seats محدودة - سجّل الآن!",
      created_time: new Date(Date.now() - 86400000 * 5).toISOString(),
      full_picture: null,
      permalink_url: "https://web.facebook.com/people/%D8%B1%D8%A7%D8%A8%D8%B7%D8%A9-%D8%AE%D8%B1%D9%8A%D8%AC%D9%8A-%D8%AC%D8%A7%D9%85%D8%B9%D8%A9-%D8%A5%D9%81%D8%B1%D9%8A%D9%82%D9%8A%D8%A7-%D8%A7%D9%84%D8%B9%D8%A7%D9%84%D9%85%D9%8A%D8%A9-Association-of-IUA-Graduates/100086028244784/",
      shares: 15,
    },
    {
      id: "demo3",
      message:
        "🤝 توقيع اتفاقية تعاون بين رابطة الخريجين وشركة Sudatel لتوظيف الخريجين في مشاريع البنية التحتية الرقمية.",
      created_time: new Date(Date.now() - 86400000 * 8).toISOString(),
      full_picture: null,
      permalink_url: "https://web.facebook.com/people/%D8%B1%D8%A7%D8%A8%D8%B7%D8%A9-%D8%AE%D8%B1%D9%8A%D8%AC%D9%8A-%D8%AC%D8%A7%D9%85%D8%B9%D8%A9-%D8%A5%D9%81%D8%B1%D9%8A%D9%82%D9%8A%D8%A7-%D8%A7%D9%84%D8%B9%D8%A7%D9%84%D9%85%D9%8A%D8%A9-Association-of-IUA-Graduates/100086028244784/",
      shares: 31,
    },
    {
      id: "demo4",
      message:
        "🎉 مبروك للخريجين الجدد! نتمنى لكم التوفيق في مساراتكم المهنية. رابطة الخريجين دائماً بجانبكم.",
      created_time: new Date(Date.now() - 86400000 * 12).toISOString(),
      full_picture: null,
      permalink_url: "https://web.facebook.com/people/%D8%B1%D8%A7%D8%A8%D8%B7%D8%A9-%D8%AE%D8%B1%D9%8A%D8%AC%D9%8A-%D8%AC%D8%A7%D9%85%D8%B9%D8%A9-%D8%A5%D9%81%D8%B1%D9%8A%D9%82%D9%8A%D8%A7-%D8%A7%D9%84%D8%B9%D8%A7%D9%84%D9%85%D9%8A%D8%A9-Association-of-IUA-Graduates/100086028244784/",
      shares: 42,
    },
  ];
}
