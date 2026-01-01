export async function GET() {
  return Response.json({ ok: true, service: "rgztec-saas", time: new Date().toISOString() });
}
