import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request) {
  try {
    const { wallet, fullName, email, country, phone, businessName, registrationNumber, businessCountry } =
      await request.json();

    if (!wallet) return NextResponse.json({ ok: false, error: "Connect a wallet first." }, { status: 400 });
    if (!fullName || !email || !country) {
      return NextResponse.json(
        { ok: false, error: "Full name, email, and country are required." },
        { status: 400 }
      );
    }
    if (!businessName || !registrationNumber || !businessCountry) {
      return NextResponse.json(
        { ok: false, error: "Business name, registration number, and business country are required." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from("kyc_submissions")
      .select("id, status")
      .eq("wallet", wallet)
      .maybeSingle();

    if (existing && existing.status !== "rejected") {
      return NextResponse.json(
        { ok: false, error: "You already have a KYC submission on file." },
        { status: 400 }
      );
    }

    const record = {
      full_name: fullName,
      email,
      country,
      phone: phone || "",
      business_name: businessName,
      registration_number: registrationNumber,
      business_country: businessCountry,
      status: "pending",
      rejection_reason: null,
      submitted_at: new Date().toISOString(),
      reviewed_at: null,
    };

    if (existing) {
      const { error } = await supabase.from("kyc_submissions").update(record).eq("id", existing.id);
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    } else {
      const { error } = await supabase.from("kyc_submissions").insert({ wallet, ...record });
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("kyc submit error:", err);
    return NextResponse.json({ ok: false, error: "Unexpected server error." }, { status: 500 });
  }
}

export async function GET(request) {
  const wallet = new URL(request.url).searchParams.get("wallet");
  if (!wallet) return NextResponse.json({ ok: false, error: "Wallet required." }, { status: 400 });

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("kyc_submissions")
    .select("status, rejection_reason")
    .eq("wallet", wallet)
    .maybeSingle();

  return NextResponse.json({
    ok: true,
    status: data?.status ?? "none",
    rejectionReason: data?.rejection_reason ?? null,
  });
}
