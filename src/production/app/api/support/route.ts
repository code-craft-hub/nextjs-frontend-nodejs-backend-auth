import { NextResponse, type NextRequest } from "next/server";

/**
 * POST /api/support
 *
 * Wire this up to whatever your support stack uses — e.g.:
 *   - Postmark / Resend / SendGrid email to support@cverai.com
 *   - Firestore `support_tickets` collection
 *   - Crisp / Intercom / Zendesk webhook
 *
 * The client-side form (`SupportContactForm`) already validates required
 * fields and sends `multipart/form-data` if an attachment is present.
 */
export async function POST(req: NextRequest) {
  try {
    const ctype = req.headers.get("content-type") ?? "";

    let payload: {
      name: string;
      email: string;
      category: string;
      subject?: string;
      message: string;
      attachment?: File | null;
    };

    if (ctype.includes("multipart/form-data")) {
      const fd = await req.formData();
      payload = {
        name: String(fd.get("name") ?? ""),
        email: String(fd.get("email") ?? ""),
        category: String(fd.get("category") ?? ""),
        subject: String(fd.get("subject") ?? ""),
        message: String(fd.get("message") ?? ""),
        attachment: (fd.get("attachment") as File) ?? null,
      };
    } else {
      payload = await req.json();
    }

    // ── Server-side validation ────────────────────────────────────────
    if (!payload.name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!/^\S+@\S+\.\S+$/.test(payload.email ?? "")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (!payload.category) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }
    if (!payload.message?.trim() || payload.message.length < 10) {
      return NextResponse.json({ error: "Message is too short" }, { status: 400 });
    }

    // TODO: persist + notify
    // await db.collection("support_tickets").add({ ...payload, createdAt: Date.now() });
    // await sendSupportEmail(payload);

    const ticket = `CVR-${Math.floor(100000 + Math.random() * 900000)}`;
    return NextResponse.json({ ok: true, ticket });
  } catch (err) {
    return NextResponse.json(
      { error: "Could not submit ticket" },
      { status: 500 },
    );
  }
}
