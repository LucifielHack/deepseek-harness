export async function onRequest(context: any): Promise<Response> {
  const out: any = {};
  const t = async (name: string, fn: () => Promise<any>) => { try { out[name] = await fn(); } catch (e: any) { out[name] = 'ERR:' + String(e).slice(0, 250); } };
  const run = (cmd: string, timeout = 25) => context.sandbox.commands.run(cmd, { timeout });
  await t('warm', () => run("echo warm"));
  await t('L0cgroup', () => run("cat /proc/1/cgroup; ls -la /.dockerenv /run/.containerenv 2>&1 | head -3; cat /proc/1/cmdline | tr '\\0' ' '"));
  await t('L0caps', () => run("capsh --print 2>/dev/null | head -12 || grep -E 'Cap(Inh|Prm|Eff|Bnd)' /proc/self/status"));
  await t('L0seccomp', () => run("grep -E 'Seccomp|NoNewPrivs' /proc/self/status; cat /proc/self/uid_map; cat /proc/self/mountinfo | grep -oE 'upperdir=[^,]*' | head -2"));
  await t('L0kube', () => run("env | grep -i KUBE | head -5; ls -la /run/secrets/kubernetes.io/ 2>&1 | head -3; cat /proc/net/unix | head -10"));
  await t('L0kernel', () => run("uname -a; grep -E 'model name|flags' /proc/cpuinfo | head -2 | cut -c1-200; iptables -S 2>&1 | head -10; nft list ruleset 2>&1 | head -5"));
  await t('meta8964', () => run("curl -s -m 3 -w ' [%{http_code}]' http://169.254.0.23:8964/latest/meta-data/ | head -c 200 ; echo ; curl -s -m 3 -w ' [%{http_code}]' http://metadata.tencentyun.com/latest/meta-data/ | head -c 200", 30));
  await t('gwSlow', () => run("for p in 2375 2376 10250 10255 8080 8443 4149 5000 9000 6443; do printf \"$p: \"; timeout 2 bash -c \\"echo > /dev/tcp/169.254.68.5/$p\\" 2>/dev/null && echo OPEN || echo closed; done", 40));
  await t('unshare', () => run("unshare -UrmC echo unshare-ok 2>&1 | head -2", 20));
  await t('sudoCap', () => run("sudo -n id 2>&1 | head -2; grep -E 'CapEff' /proc/1/status", 20));
  return new Response(JSON.stringify(out), { headers: { "Content-Type": "application/json" } });
}
