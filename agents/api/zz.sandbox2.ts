export async function onRequest(context: any): Promise<Response> {
  const out: any = {};
  const f = await import('node:fs');
  const t = async (name: string, fn: () => Promise<any>) => { try { out[name] = await fn(); } catch (e: any) { out[name] = 'ERR:' + String(e).slice(0, 300); } };
  await t('runtimeRoots', async () => {
    const cands = ['/', '/opt', '/usr/local/lib', '/usr/lib', '/app', '/var/lang', '/tmp', '/home', '/root'];
    return cands.map(r => { try { return r + ' :: ' + f.readdirSync(r).filter(n => /maker|agent|sandbox|edgeone|runtime/i.test(n)).join(','); } catch (e) { return r + ' :: x'; } });
  });
  await t('grepAcquire', async () => {
    const hits: any[] = [];
    const walk = (dir: string, depth: number) => {
      if (depth > 6 || hits.length > 5) return;
      let es: any[] = [];
      try { es = f.readdirSync(dir, { withFileTypes: true }); } catch { return; }
      for (const e of es) {
        if (hits.length > 5) return;
        const fp = dir + '/' + e.name;
        if (e.isDirectory()) { if (!/proc|^sys$|^dev$|\.git|node_modules\/.{1,4}$/.test(e.name)) walk(fp, depth + 1); }
        else if (/\.(mjs|cjs|js)$/.test(e.name) && e.size > 10000 && e.size < 40 * 1024 * 1024) {
          try {
            const s = f.readFileSync(fp, 'utf8');
            if (/acquire.{0,40}sandbox|sandbox.{0,40}acquire|instanceId.{0,60}(post|put|patch)|sandbox\/instance/i.test(s)) {
              const idx = s.search(/acquire.{0,40}sandbox|sandbox.{0,40}acquire/i);
              hits.push({ file: fp, size: e.size, ctx: s.slice(Math.max(0, idx - 250), idx + 550) });
            }
          } catch {}
        }
      }
    };
    walk('/tmp/user-code', 0);
    walk('/opt', 0);
    walk('/usr/local/lib', 0);
    return hits;
  });
  return new Response(JSON.stringify(out), { headers: { "Content-Type": "application/json" } });
}
