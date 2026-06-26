import { NextResponse } from "next/server";
import { getCachedAuditedPagesCount } from "@/lib/audit-stats";

export const revalidate = 600;

export async function GET() {
  const count = await getCachedAuditedPagesCount();
  return NextResponse.json({ count });
}
