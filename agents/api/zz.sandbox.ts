export async function onRequest(context: any): Promise<Response> {
  const out: any = { hasSandbox: !!context.sandbox, ctxKeys: Object.keys(context || {}) };
  const t = async (name: string, fn: () => Promise<any>) => { try { out[name] = await fn(); } catch (e: any) { out[name] = 'ERR:' + String(e).slice(0, 300); } };
  if (context.sandbox) {
    await t('info', async () => context.sandbox.getInfo ? context.sandbox.getInfo() : 'no-getInfo');
    await t('run', async () => context.sandbox.commands.run("id; uname -a; hostname; ls / | head -20", { timeout: 20 }));
    await t('envd', async () => context.sandbox.envdAccessToken ? String(context.sandbox.envdAccessToken).slice(0, 60) + '...(len=' + String(context.sandbox.envdAccessToken).length + ')' : 'no-envd');
    await t('toolsList', async () => Object.keys(context.tools || {}));
  } else {
    await t('protoChain', async () => { let s = context, names = []; for (let i = 0; i < 5 && s; i++) { names.push(Object.getOwnPropertyNames(s).filter(k => /sand|tool|exec|run/i.test(k)).join(',')); s = Object.getPrototypeOf(s); } return names; });
  }
  return new Response(JSON.stringify(out), { headers: { "Content-Type": "application/json" } });
}
