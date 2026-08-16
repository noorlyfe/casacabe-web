(function () {
  var screens = [
    'dashboard',
    'sales',
    'expenses',
    'invoices',
    'import',
    'products',
    'vendors',
    'purchasing',
    'inventory',
    'reports',
    'budgets',
    'price-alerts',
    'calendar',
    'staff',
    'settings'
  ];

  var labels = {
    dashboard: 'Dashboard',
    sales: 'Sales',
    expenses: 'Expenses',
    invoices: 'Invoices',
    import: 'Import',
    products: 'Products',
    vendors: 'Vendors',
    purchasing: 'Purchasing',
    inventory: 'Inventory',
    reports: 'Reports',
    budgets: 'Budgets',
    'price-alerts': 'Price Alerts',
    calendar: 'Calendar',
    staff: 'Staff',
    settings: 'Settings'
  };

  function validId(id) {
    return screens.indexOf(id) !== -1;
  }

  function activate(id) {
    if (!validId(id)) id = screens[0];

    document.querySelectorAll('.tour-nav-item, .tour-mobile-tab').forEach(function (el) {
      var on = el.getAttribute('data-screen') === id;
      el.classList.toggle('is-active', on);
      el.setAttribute('aria-selected', on ? 'true' : 'false');
    });

    document.querySelectorAll('.tour-screen').forEach(function (el) {
      var on = el.getAttribute('data-screen') === id;
      el.classList.toggle('is-active', on);
      el.hidden = !on;
    });

    document.querySelectorAll('.tour-caption').forEach(function (el) {
      el.classList.toggle('is-active', el.getAttribute('data-screen') === id);
    });

    var title = document.getElementById('tour-topbar-title');
    if (title) title.textContent = labels[id] || 'Dashboard';

    var body = document.querySelector('.tour-body');
    if (body) body.scrollTop = 0;

    if (history.replaceState) {
      history.replaceState(null, '', '#' + id);
    }
  }

  function bind(selector) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.addEventListener('click', function () {
        activate(el.getAttribute('data-screen'));
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!document.getElementById('tour-app')) return;

    bind('.tour-nav-item');
    bind('.tour-mobile-tab');

    var fromHash = (location.hash || '').replace('#', '');
    activate(validId(fromHash) ? fromHash : screens[0]);

    window.addEventListener('hashchange', function () {
      var id = (location.hash || '').replace('#', '');
      if (validId(id)) activate(id);
    });
  });
})();
