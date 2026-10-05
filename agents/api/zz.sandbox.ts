export async function onRequest(context: any): Promise<Response> {
  const out: any = {};
  const t = async (name: string, fn: () => Promise<any>) => { try { out[name] = await fn(); } catch (e: any) { out[name] = 'ERR:' + String(e).slice(0, 300); } };
  await t('warm', async () => context.sandbox.commands.run("echo warm", { timeout: 20 }));
  await t('envdLocal', async () => context.sandbox.commands.run("curl -s -m 5 -o /dev/null -w '%{http_code}' http://127.0.0.1:49999/ ; echo ; curl -s -m 5 http://127.0.0.1:49999/ | head -c 200", { timeout: 25 }));
  await t('envdEth', async () => context.sandbox.commands.run("curl -s -m 5 -o /dev/null -w '%{http_code}' http://169.254.68.6:49999/", { timeout: 25 }));
  await t('runtimeModules', async () => { const f = await import('node:fs'); const paths = ['/var/user/node_modules', '/tmp/user-code/node_modules', process.cwd() + '/node_modules']; const found = []; for (const p of paths) { try { found.push(...f.readdirSync(p).filter(n => /makers|edgeone|sandbox|agent/i.test(n)).map(n => p + '/' + n)); } catch {} } return found.slice(0, 12); });
  return new Response(JSON.stringify(out), { headers: { "Content-Type": "application/json" } });
}
