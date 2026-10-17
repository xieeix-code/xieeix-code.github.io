(async () => {
  const counter = document.getElementById('busuanzi_site_pv');
  if (!counter) return;

  counter.textContent = 'Loading…';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch('https://cdn.busuanzi.cc/api.php', {
      method: 'POST',
      body: JSON.stringify({ url: location.href, referrer: document.referrer }),
      signal: controller.signal
    });
    if (!response.ok) throw new Error('Counter request failed');
    const data = await response.json();
    const views = String(data.busuanzi_site_pv ?? '');
    if (!/^\d+$/.test(views)) throw new Error('Invalid counter response');
    counter.textContent = views;
  } catch {
    counter.textContent = '暂不可用';
    counter.title = '访问量服务暂时无法连接，请稍后刷新重试。';
  } finally {
    clearTimeout(timeout);
  }
})();
