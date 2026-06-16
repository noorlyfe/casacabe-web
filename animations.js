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

  function formatValue(val, el) {
    var format = el.getAttribute('data-format');
    var suffix = el.getAttribute('data-suffix') || '';
    var prefix = el.getAttribute('data-prefix') || '';
    if (format === 'currency') {
      return '$' + Math.round(val).toLocaleString('en-US');
    }
    if (suffix === '%') {
      var decimals = (el.getAttribute('data-count') || '').indexOf('.') !== -1 ? 1 : 0;
      return (decimals ? val.toFixed(1) : Math.round(val)) + suffix;
    }
    return prefix + (Number.isInteger(parseFloat(el.getAttribute('data-count'))) ? Math.round(val) : val.toFixed(1)) + suffix;
  }

  /* Stat counters */
  function animateCounter(el) {
    var target = el.getAttribute('data-count');
    if (!target) return;
    var numeric = parseFloat(target);
    if (isNaN(numeric)) {
      el.textContent = target;
      return;
    }
    if (reduced) {
      el.textContent = formatValue(numeric, el);
      return;
    }
    var duration = 1400;
    var start = performance.now();
    function tick(now) {
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatValue(numeric * eased, el);
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
    { threshold: 0.35 }
  );

  document.querySelectorAll('[data-count]').forEach(function (el) {
    statObserver.observe(el);
  });

  /* Bar charts — grow on scroll into view */
  function animateBars(chart) {
    if (chart.classList.contains('is-animated')) return;
    chart.classList.add('is-animated');
  }

  var chartObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateBars(entry.target);
          chartObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25 }
  );

  document.querySelectorAll('.dash-chart-bars').forEach(function (chart) {
    if (reduced) {
      chart.classList.add('is-animated');
    } else {
      chartObserver.observe(chart);
    }
  });

  /* Problem chart line draw */
  var problemChart = document.querySelector('.problem-chart');
  if (problemChart && !reduced) {
    var lineObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            problemChart.classList.add('is-animated');
            lineObserver.unobserve(problemChart);
          }
        });
      },
      { threshold: 0.4 }
    );
    lineObserver.observe(problemChart);
  } else if (problemChart) {
    problemChart.classList.add('is-animated');
  }
})();
