(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Scroll reveal */
  var revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  if (revealEls.length && !reduced) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-revealed'); });
  }

  /* Stat counters */
  function animateCounter(el) {
    var target = el.getAttribute('data-count');
    if (!target) return;
    var suffix = el.getAttribute('data-suffix') || '';
    var prefix = el.getAttribute('data-prefix') || '';
    var isPercent = suffix === '%';
    var numeric = parseFloat(target);
    if (isNaN(numeric)) {
      el.textContent = prefix + target + suffix;
      return;
    }
    if (reduced) {
      el.textContent = prefix + target + suffix;
      return;
    }
    var duration = 1400;
    var start = performance.now();
    function tick(now) {
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = numeric * eased;
      el.textContent = prefix + (Number.isInteger(numeric) ? Math.round(val) : val.toFixed(0)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var statObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll('[data-count]').forEach(function (el) {
    statObserver.observe(el);
  });

  /* Hero chart bars — trigger grow on load */
  var heroChart = document.querySelector('.dash-chart-bars');
  if (heroChart && !reduced) {
    requestAnimationFrame(function () {
      heroChart.classList.add('is-animated');
    });
  }
})();
