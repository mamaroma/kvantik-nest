(() => {
  'use strict';

  const root = document.getElementById('toast-root');
  if (!root) return;

  const toast = (text) => {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = text;
    root.appendChild(el);

    // небольшая анимация появления/исчезновения
    requestAnimationFrame(() => el.classList.add('toast--show'));
    setTimeout(() => {
      el.classList.remove('toast--show');
      setTimeout(() => el.remove(), 300);
    }, 3500);
  };

  try {
    const es = new EventSource('/articles/sse');
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        const label = data.type === 'created'
          ? 'Новая статья'
          : data.type === 'updated'
            ? 'Статья обновлена'
            : 'Статья удалена';
        toast(`${label}: ${data.title}`);
      } catch {
        toast('Получено обновление');
      }
    };

    es.onerror = () => {
      // тихо показываем, но без спама
      // (в dev-режиме nodemon может перезапускать сервер)
    };
  } catch {
    // SSE может быть недоступен в некоторых окружениях
  }
})();
