const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const productCatalog = [
  { id: 'P001', name: 'Classic Tote Bag', category: 'Accessories', unitPrice: 39, unitCost: 21 },
  { id: 'P002', name: 'Gold Earrings', category: 'Accessories', unitPrice: 52, unitCost: 30 },
  { id: 'P003', name: 'Lip Gloss', category: 'Beauty', unitPrice: 12, unitCost: 5 },
  { id: 'P004', name: 'Body Lotion', category: 'Beauty', unitPrice: 24, unitCost: 11 },
  { id: 'P005', name: 'Pink Top', category: 'Clothing', unitPrice: 36, unitCost: 18 },
  { id: 'P006', name: 'Scented Candle', category: 'Home', unitPrice: 28, unitCost: 14 }
];

const expenseCategories = [
  'Marketing',
  'Transport',
  'Rent',
  'Packaging',
  'Utilities',
  'Other operating costs'
];

const monthlyTargets = {
  '2026': {
    January: 8400,
    February: 7800,
    March: 9000,
    April: 9300,
    May: 9800,
    June: 10150
  }
};

const STORAGE_KEYS = {
  sales: 'bizinsights_sales_records',
  expenses: 'bizinsights_expense_records'
};

const state = {
  activeView: 'overview',
  salesRecords: [],
  expenseRecords: [],
  filters: {
    year: '2026',
    month: 'all',
    category: 'all',
    product: 'all'
  },
  productSearch: '',
  productSort: 'revenue-desc',
  charts: {},
  editing: {
    sales: null,
    expense: null
  }
};

const moneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2
});

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 1
});

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function safeDivide(numerator, denominator) {
  return denominator === 0 ? 0 : numerator / denominator;
}

function formatCurrency(value) {
  const amount = safeNumber(value);
  return moneyFormatter.format(amount);
}

function formatPercent(value) {
  const number = safeNumber(value);
  if (!Number.isFinite(number)) {
    return 'N/A';
  }

  if (Math.abs(number) >= 1) {
    return `${number.toFixed(1)}%`;
  }

  return `${(number * 100).toFixed(1)}%`;
}

function formatSignedPercent(value) {
  const number = safeNumber(value);
  if (Number.isNaN(number)) {
    return 'N/A';
  }

  if (Math.abs(number) >= 1) {
    return `${number.toFixed(1)}%`;
  }

  return `${(number * 100).toFixed(1)}%`;
}

function sanitizeText(value) {
  return String(value ?? '').replace(/[<>]/g, '');
}

function createDemoData() {
  const monthPatterns = {
    January: { P001: 42, P002: 28, P003: 74, P004: 58, P005: 36, P006: 30 },
    February: { P001: 38, P002: 24, P003: 70, P004: 53, P005: 32, P006: 28 },
    March: { P001: 46, P002: 30, P003: 80, P004: 60, P005: 40, P006: 34 },
    April: { P001: 43, P002: 26, P003: 82, P004: 62, P005: 42, P006: 35 },
    May: { P001: 52, P002: 34, P003: 88, P004: 66, P005: 48, P006: 38 },
    June: { P001: 49, P002: 31, P003: 92, P004: 70, P005: 50, P006: 40 }
  };

  const sales = [];
  let idCounter = 1;

  monthNames.forEach((monthName, monthIndex) => {
    const currentYear = 2026;
    if (!monthPatterns[monthName]) {
      return;
    }

    const monthPattern = monthPatterns[monthName];
    const day = 8 + (monthIndex % 5);

    Object.entries(monthPattern).forEach(([productId, quantity]) => {
      const product = productCatalog.find((entry) => entry.id === productId);
      if (!product) {
        return;
      }

      const record = {
        id: `TX-${currentYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(idCounter).padStart(3, '0')}`,
        date: `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        month: monthName,
        year: currentYear,
        productId,
        productName: product.name,
        category: product.category,
        quantity: quantity,
        unitSellingPrice: product.unitPrice,
        unitCost: product.unitCost
      };

      sales.push(record);
      idCounter += 1;
    });
  });

  const expenses = [
    { id: 'EXP-2026-01', date: '2026-01-04', month: 'January', year: 2026, category: 'Marketing', description: 'Spring product feature campaign', amount: 1800 },
    { id: 'EXP-2026-02', date: '2026-01-06', month: 'January', year: 2026, category: 'Transport', description: 'Regional delivery and logistics', amount: 720 },
    { id: 'EXP-2026-03', date: '2026-01-09', month: 'January', year: 2026, category: 'Rent', description: 'Retail premise rent', amount: 2400 },
    { id: 'EXP-2026-04', date: '2026-01-12', month: 'January', year: 2026, category: 'Packaging', description: 'Gift wrap and packaging supplies', amount: 680 },
    { id: 'EXP-2026-05', date: '2026-01-16', month: 'January', year: 2026, category: 'Utilities', description: 'Electricity and internet', amount: 620 },
    { id: 'EXP-2026-06', date: '2026-01-18', month: 'January', year: 2026, category: 'Other operating costs', description: 'Insurance and admin administrative costs', amount: 430 },

    { id: 'EXP-2026-07', date: '2026-02-03', month: 'February', year: 2026, category: 'Marketing', description: 'Email and social media campaign', amount: 1600 },
    { id: 'EXP-2026-08', date: '2026-02-06', month: 'February', year: 2026, category: 'Transport', description: 'Delivery coordination and route fuel', amount: 690 },
    { id: 'EXP-2026-09', date: '2026-02-11', month: 'February', year: 2026, category: 'Rent', description: 'Retail premise rent', amount: 2400 },
    { id: 'EXP-2026-10', date: '2026-02-14', month: 'February', year: 2026, category: 'Packaging', description: 'Shipping materials', amount: 640 },
    { id: 'EXP-2026-11', date: '2026-02-15', month: 'February', year: 2026, category: 'Utilities', description: 'Utilities and broadband', amount: 610 },
    { id: 'EXP-2026-12', date: '2026-02-18', month: 'February', year: 2026, category: 'Other operating costs', description: 'Software subscriptions and overhead', amount: 470 },

    { id: 'EXP-2026-13', date: '2026-03-04', month: 'March', year: 2026, category: 'Marketing', description: 'Spring assortment promotion', amount: 1900 },
    { id: 'EXP-2026-14', date: '2026-03-07', month: 'March', year: 2026, category: 'Transport', description: 'Courier and local distribution', amount: 760 },
    { id: 'EXP-2026-15', date: '2026-03-12', month: 'March', year: 2026, category: 'Rent', description: 'Retail premise rent', amount: 2400 },
    { id: 'EXP-2026-16', date: '2026-03-14', month: 'March', year: 2026, category: 'Packaging', description: 'Customer shipment packaging', amount: 720 },
    { id: 'EXP-2026-17', date: '2026-03-17', month: 'March', year: 2026, category: 'Utilities', description: 'Electricity, water and internet', amount: 670 },
    { id: 'EXP-2026-18', date: '2026-03-20', month: 'March', year: 2026, category: 'Other operating costs', description: 'Warehouse and miscellaneous operating expense', amount: 520 },

    { id: 'EXP-2026-19', date: '2026-04-02', month: 'April', year: 2026, category: 'Marketing', description: 'Targeted seasonal promotion', amount: 2000 },
    { id: 'EXP-2026-20', date: '2026-04-05', month: 'April', year: 2026, category: 'Transport', description: 'Regional distribution and fleet costs', amount: 760 },
    { id: 'EXP-2026-21', date: '2026-04-08', month: 'April', year: 2026, category: 'Rent', description: 'Retail premise rent', amount: 2400 },
    { id: 'EXP-2026-22', date: '2026-04-12', month: 'April', year: 2026, category: 'Packaging', description: 'Shipping boxes and inserts', amount: 720 },
    { id: 'EXP-2026-23', date: '2026-04-16', month: 'April', year: 2026, category: 'Utilities', description: 'Utilities and connectivity', amount: 650 },
    { id: 'EXP-2026-24', date: '2026-04-18', month: 'April', year: 2026, category: 'Other operating costs', description: 'Insurance and office support', amount: 540 },

    { id: 'EXP-2026-25', date: '2026-05-05', month: 'May', year: 2026, category: 'Marketing', description: 'Influencer and content campaign', amount: 2200 },
    { id: 'EXP-2026-26', date: '2026-05-08', month: 'May', year: 2026, category: 'Transport', description: 'Dispatch and local logistics', amount: 810 },
    { id: 'EXP-2026-27', date: '2026-05-11', month: 'May', year: 2026, category: 'Rent', description: 'Retail premise rent', amount: 2400 },
    { id: 'EXP-2026-28', date: '2026-05-13', month: 'May', year: 2026, category: 'Packaging', description: 'Gift and shipment packaging kits', amount: 860 },
    { id: 'EXP-2026-29', date: '2026-05-15', month: 'May', year: 2026, category: 'Utilities', description: 'Electricity, water and internet', amount: 680 },
    { id: 'EXP-2026-30', date: '2026-05-20', month: 'May', year: 2026, category: 'Other operating costs', description: 'Store support and admin costs', amount: 610 },

    { id: 'EXP-2026-31', date: '2026-06-01', month: 'June', year: 2026, category: 'Marketing', description: 'Summer launch and brand push', amount: 2500 },
    { id: 'EXP-2026-32', date: '2026-06-04', month: 'June', year: 2026, category: 'Transport', description: 'Shipping and delivery logistics', amount: 840 },
    { id: 'EXP-2026-33', date: '2026-06-08', month: 'June', year: 2026, category: 'Rent', description: 'Retail premise rent', amount: 2400 },
    { id: 'EXP-2026-34', date: '2026-06-10', month: 'June', year: 2026, category: 'Packaging', description: 'Fulfilment packaging and inserts', amount: 900 },
    { id: 'EXP-2026-35', date: '2026-06-15', month: 'June', year: 2026, category: 'Utilities', description: 'Utilities and broadband service', amount: 760 },
    { id: 'EXP-2026-36', date: '2026-06-22', month: 'June', year: 2026, category: 'Other operating costs', description: 'Insurance and staff support', amount: 660 }
  ];

  return { sales, expenses };
}

function getDatasetFromStorage() {
  const demoData = createDemoData();

  try {
    const storedSales = localStorage.getItem(STORAGE_KEYS.sales);
    const storedExpenses = localStorage.getItem(STORAGE_KEYS.expenses);

    if (!storedSales && !storedExpenses) {
      return demoData;
    }

    const parsedSales = storedSales ? JSON.parse(storedSales) : demoData.sales;
    const parsedExpenses = storedExpenses ? JSON.parse(storedExpenses) : demoData.expenses;

    if (!Array.isArray(parsedSales) || !Array.isArray(parsedExpenses)) {
      throw new Error('Invalid localStorage structure');
    }

    return { sales: parsedSales, expenses: parsedExpenses };
  } catch (error) {
    showStatus('LocalStorage data was unavailable or invalid. The original demo data has been restored.', 'error');
    return demoData;
  }
}

function persistRecords() {
  try {
    localStorage.setItem(STORAGE_KEYS.sales, JSON.stringify(state.salesRecords));
    localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(state.expenseRecords));
  } catch (error) {
    showStatus('Your browser blocked LocalStorage. Changes cannot be saved this session.', 'error');
  }
}

function showStatus(message, type = 'success') {
  const statusElement = document.getElementById('statusMessage');
  if (!statusElement) {
    return;
  }

  statusElement.textContent = message;
  statusElement.className = `status-message ${type}`;
}

function getAllSalesRecords() {
  return state.salesRecords;
}

function getAllExpenseRecords() {
  return state.expenseRecords;
}

function getMonthValue(records, monthName) {
  return records.filter((record) => record.month === monthName);
}

function getFilteredSalesRecords() {
  return getAllSalesRecords().filter((record) => {
    const yearMatches = state.filters.year === 'all' || String(record.year) === String(state.filters.year);
    const monthMatches = state.filters.month === 'all' || record.month === state.filters.month;
    const categoryMatches = state.filters.category === 'all' || record.category === state.filters.category;
    const productMatches = state.filters.product === 'all' || record.productId === state.filters.product;
    return yearMatches && monthMatches && categoryMatches && productMatches;
  });
}

function getFilteredExpenses() {
  return getAllExpenseRecords().filter((record) => {
    const yearMatches = state.filters.year === 'all' || String(record.year) === String(state.filters.year);
    const monthMatches = state.filters.month === 'all' || record.month === state.filters.month;
    return yearMatches && monthMatches;
  });
}

function getFilteredTrendData() {
  const selectedYear = state.filters.year === 'all' ? '2026' : state.filters.year;
  const months = monthNames.slice(0, 6);

  return months.map((monthName) => {
    const monthRecords = getAllSalesRecords().filter((record) => {
      const yearMatches = String(record.year) === String(selectedYear);
      const monthMatches = record.month === monthName;
      const categoryMatches = state.filters.category === 'all' || record.category === state.filters.category;
      const productMatches = state.filters.product === 'all' || record.productId === state.filters.product;
      return yearMatches && monthMatches && categoryMatches && productMatches;
    });

    const monthlyRevenue = monthRecords.reduce((sum, record) => sum + record.quantity * record.unitSellingPrice, 0);
    const monthlyCost = monthRecords.reduce((sum, record) => sum + record.quantity * record.unitCost, 0);
    const monthlyGrossProfit = monthlyRevenue - monthlyCost;
    const monthExpenses = getAllExpenseRecords().filter((record) => {
      const yearMatches = String(record.year) === String(selectedYear);
      const monthMatches = record.month === monthName;
      return yearMatches && monthMatches;
    }).reduce((sum, record) => sum + safeNumber(record.amount), 0);

    const monthlyNetProfit = monthlyGrossProfit - monthExpenses;

    return {
      month: monthName,
      revenue: monthlyRevenue,
      grossProfit: monthlyGrossProfit,
      netProfit: monthlyNetProfit,
      expenses: monthExpenses,
      isSelected: state.filters.month === monthName
    };
  });
}

function getRevenueSummary(records) {
  const revenue = records.reduce((sum, record) => sum + record.quantity * record.unitSellingPrice, 0);
  const cogs = records.reduce((sum, record) => sum + record.quantity * record.unitCost, 0);
  const grossProfit = revenue - cogs;
  const units = records.reduce((sum, record) => sum + record.quantity, 0);
  const operatingExpenses = getFilteredExpenses().reduce((sum, record) => sum + safeNumber(record.amount), 0);
  const netProfit = grossProfit - operatingExpenses;
  const margin = safeDivide(grossProfit, revenue);
  const netMargin = safeDivide(netProfit, revenue);
  const avgSellingPrice = safeDivide(revenue, units);

  return {
    revenue,
    cogs,
    grossProfit,
    margin,
    units,
    operatingExpenses,
    netProfit,
    netMargin,
    avgSellingPrice
  };
}

function getMonthRangeLabel() {
  if (state.filters.month !== 'all') {
    return `${state.filters.month} ${state.filters.year}`;
  }

  return `${state.filters.year} · All months`;
}

function getRevenueTarget() {
  const selectedYear = state.filters.year === 'all' ? '2026' : state.filters.year;
  const targetMap = monthlyTargets[selectedYear] || {};

  if (state.filters.month !== 'all') {
    return targetMap[state.filters.month] || 0;
  }

  return Object.values(targetMap).reduce((sum, value) => sum + value, 0);
}

function getTargetStatus() {
  const actualRevenue = getRevenueSummary(getFilteredSalesRecords()).revenue;
  const targetRevenue = getRevenueTarget();
  const achievement = safeDivide(actualRevenue, targetRevenue);

  return {
    actualRevenue,
    targetRevenue,
    achievement,
    status: achievement >= 1 ? 'On Track' : 'Below Target'
  };
}

function getCategorySummary(records) {
  const totals = new Map();

  records.forEach((record) => {
    const key = record.category;
    const current = totals.get(key) || { revenue: 0, profit: 0, units: 0 };
    current.revenue += record.quantity * record.unitSellingPrice;
    current.profit += record.quantity * (record.unitSellingPrice - record.unitCost);
    current.units += record.quantity;
    totals.set(key, current);
  });

  const totalRevenue = records.reduce((sum, record) => sum + record.quantity * record.unitSellingPrice, 0);
  const list = [...totals.entries()].map(([category, summary]) => ({
    category,
    revenue: summary.revenue,
    profit: summary.profit,
    units: summary.units,
    contribution: totalRevenue === 0 ? 0 : (summary.revenue / totalRevenue) * 100
  }));

  return list.sort((a, b) => b.revenue - a.revenue);
}

function getProductSummary(records) {
  const totals = new Map();

  records.forEach((record) => {
    const key = record.productId || record.productName;
    const current = totals.get(key) || {
      name: record.productName,
      category: record.category,
      units: 0,
      revenue: 0,
      cogs: 0,
      profit: 0,
      margin: 0
    };

    current.units += record.quantity;
    current.revenue += record.quantity * record.unitSellingPrice;
    current.cogs += record.quantity * record.unitCost;
    current.profit += record.quantity * (record.unitSellingPrice - record.unitCost);
    totals.set(key, current);
  });

  const totalRevenue = records.reduce((sum, record) => sum + record.quantity * record.unitSellingPrice, 0);

  const list = [...totals.values()].map((item) => {
    const revenueContribution = totalRevenue === 0 ? 0 : (item.revenue / totalRevenue) * 100;
    return {
      ...item,
      margin: item.revenue === 0 ? 0 : (item.profit / item.revenue) * 100,
      revenueContribution
    };
  });

  return list.sort((a, b) => b.revenue - a.revenue);
}

function getMonthlySeries() {
  const selectedYear = state.filters.year === 'all' ? '2026' : state.filters.year;

  return monthNames.slice(0, 6).map((month) => {
    const monthRecords = getAllSalesRecords().filter((record) => {
      const yearMatches = String(record.year) === String(selectedYear);
      const monthMatches = record.month === month;
      const categoryMatches = state.filters.category === 'all' || record.category === state.filters.category;
      const productMatches = state.filters.product === 'all' || record.productId === state.filters.product;
      return yearMatches && monthMatches && categoryMatches && productMatches;
    });

    const revenue = monthRecords.reduce((sum, record) => sum + record.quantity * record.unitSellingPrice, 0);
    const grossProfit = monthRecords.reduce((sum, record) => sum + record.quantity * (record.unitSellingPrice - record.unitCost), 0);
    const expenses = getAllExpenseRecords().filter((record) => {
      const yearMatches = String(record.year) === String(selectedYear);
      const monthMatches = record.month === month;
      return yearMatches && monthMatches;
    }).reduce((sum, record) => sum + safeNumber(record.amount), 0);

    return {
      month,
      revenue,
      grossProfit,
      netProfit: grossProfit - expenses,
      selected: state.filters.month === month
    };
  });
}

function createKpiCard(config) {
  const card = document.createElement('article');
  card.className = 'kpi-card';
  card.innerHTML = `
    <div class="kpi-card-header">
      <div>
        <div class="label">${config.label}</div>
      </div>
      <div class="kpi-icon ${config.iconClass}">${config.icon}</div>
    </div>
    <div class="value">${config.value}</div>
    <div class="description">${config.description}</div>
  `;
  return card;
}

function renderOverviewKpis() {
  const container = document.getElementById('overviewKpis');
  if (!container) {
    return;
  }

  const summary = getRevenueSummary(getFilteredSalesRecords());
  const cards = [
    {
      label: 'Total revenue',
      value: formatCurrency(summary.revenue),
      description: 'Sales generated in the selected window.',
      icon: '$',
      iconClass: 'blue'
    },
    {
      label: 'Gross profit',
      value: formatCurrency(summary.grossProfit),
      description: 'Revenue minus cost of goods sold.',
      icon: 'GP',
      iconClass: 'green'
    },
    {
      label: 'Gross profit margin',
      value: formatPercent(summary.margin * 100),
      description: 'Percentage of sales retained as gross profit.',
      icon: '%',
      iconClass: 'purple'
    },
    {
      label: 'Units sold',
      value: summary.units.toLocaleString(),
      description: 'Total units sold for the selected data.',
      icon: 'U',
      iconClass: 'orange'
    },
    {
      label: 'Operating expenses',
      value: formatCurrency(summary.operatingExpenses),
      description: 'Marketing, logistics, rent and other costs.',
      icon: 'E',
      iconClass: 'red'
    },
    {
      label: 'Net profit',
      value: formatCurrency(summary.netProfit),
      description: 'Gross profit after operating expenses.',
      icon: 'NP',
      iconClass: 'green'
    },
    {
      label: 'Net profit margin',
      value: formatPercent(summary.netMargin * 100),
      description: 'Percentage of revenue retained after all costs.',
      icon: 'N%',
      iconClass: 'purple'
    },
    {
      label: 'Average selling price',
      value: formatCurrency(summary.avgSellingPrice),
      description: 'Average revenue generated per unit sold.',
      icon: 'ASP',
      iconClass: 'blue'
    }
  ];

  container.innerHTML = '';
  cards.forEach((card) => container.appendChild(createKpiCard(card)));
}

function renderOverviewSummary() {
  const container = document.getElementById('overviewSummaryStats');
  if (!container) {
    return;
  }

  const records = getFilteredSalesRecords();
  const categorySummary = getCategorySummary(records);
  const productSummary = getProductSummary(records);
  const topProduct = productSummary[0];
  const topCategory = categorySummary[0];
  const monthlyData = getMonthlySeries();
  const bestMonth = [...monthlyData].sort((a, b) => b.revenue - a.revenue)[0];
  const previousMonth = monthlyData[monthlyData.length - 2] || null;
  const currentMonth = monthlyData[monthlyData.length - 1] || null;

  const summaryItems = [
    {
      title: 'Top product',
      value: topProduct ? topProduct.name : 'N/A',
      text: topProduct ? `${formatCurrency(topProduct.revenue)} revenue` : 'No product data available.'
    },
    {
      title: 'Top category',
      value: topCategory ? topCategory.category : 'N/A',
      text: topCategory ? `${formatCurrency(topCategory.revenue)} in revenue` : 'No category data available.'
    },
    {
      title: 'Best month',
      value: bestMonth ? bestMonth.month : 'N/A',
      text: bestMonth ? `${formatCurrency(bestMonth.revenue)} in revenue` : 'No monthly data available.'
    },
    {
      title: 'Revenue growth',
      value: currentMonth && previousMonth && previousMonth.revenue !== 0 ? `${formatSignedPercent(((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100)}` : 'N/A',
      text: currentMonth && previousMonth ? `${currentMonth.month} versus ${previousMonth.month}` : 'Comparison unavailable.'
    }
  ];

  container.innerHTML = summaryItems.map((item) => `
    <div class="summary-item">
      <strong>${sanitizeText(item.title)}</strong>
      <div>${sanitizeText(item.value)}</div>
      <span>${sanitizeText(item.text)}</span>
    </div>
  `).join('');
}

function renderTargetSummary() {
  const container = document.getElementById('targetSummary');
  if (!container) {
    return;
  }

  const targetStatus = getTargetStatus();
  const target = targetStatus.targetRevenue;
  const actual = targetStatus.actualRevenue;
  const progress = target === 0 ? 0 : Math.min((actual / target) * 100, 100);

  const statusClass = targetStatus.status === 'On Track' ? 'on-track' : 'below-target';

  container.innerHTML = `
    <div class="target-row">
      <span>Monthly target</span>
      <span>${formatCurrency(target)}</span>
    </div>
    <div class="target-row">
      <span>Actual revenue</span>
      <span>${formatCurrency(actual)}</span>
    </div>
    <div class="target-row">
      <span>Variance</span>
      <span>${formatCurrency(actual - target)}</span>
    </div>
    <div class="target-progress">
      <span style="width:${Math.max(progress, 0)}%"></span>
    </div>
    <div class="target-row">
      <span>Target achievement</span>
      <span>${formatPercent(targetStatus.achievement * 100)}</span>
    </div>
    <div class="target-status ${statusClass}">${targetStatus.status}</div>
  `;
}

function renderInsights() {
  const container = document.getElementById('insightList');
  if (!container) {
    return;
  }

  const currentSummary = getRevenueSummary(getFilteredSalesRecords());
  const categorySummary = getCategorySummary(getFilteredSalesRecords());
  const productSummary = getProductSummary(getFilteredSalesRecords());
  const topProduct = productSummary[0] || null;
  const topCategory = categorySummary[0] || null;
  const revenueTrend = getMonthlySeries();
  const lastMonth = revenueTrend[revenueTrend.length - 1];
  const previousMonth = revenueTrend[revenueTrend.length - 2] || null;
  const netProfitPositive = currentSummary.netProfit >= 0;

  const insights = [];

  if (topProduct) {
    insights.push({
      title: 'Top revenue driver',
      metric: topProduct.name,
      explanation: `${formatCurrency(topProduct.revenue)} revenue with ${topProduct.units} units sold.`,
      action: 'Increase promotional support on the strongest product to sustain conversion.'
    });
  }

  if (topCategory) {
    insights.push({
      title: 'Largest category',
      metric: topCategory.category,
      explanation: `${formatPercent(topCategory.contribution)} of total revenue comes from this category.`,
      action: 'Strengthen inventory availability in the top category to protect sales volume.'
    });
  }

  if (previousMonth && lastMonth) {
    const growth = previousMonth.revenue === 0 ? 0 : ((lastMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100;
    insights.push({
      title: 'Revenue momentum',
      metric: `${formatSignedPercent(growth)} month-over-month`,
      explanation: `Current month revenue is ${formatSignedPercent(growth)} compared with the previous month.`,
      action: 'Review promotions and stock levels if momentum weakens further.'
    });
  }

  if (productSummary.length > 1) {
    const lowestMargin = [...productSummary].sort((a, b) => a.margin - b.margin)[0];
    insights.push({
      title: 'Margin watchlist',
      metric: lowestMargin ? lowestMargin.name : 'N/A',
      explanation: lowestMargin ? `Margin is ${formatPercent(lowestMargin.margin)} for ${lowestMargin.name}.` : 'No product margin data available.',
      action: 'Review pricing or supplier cost reduction on lower-margin products.'
    });
  }

  insights.push({
    title: 'Target performance',
    metric: `${formatPercent(getTargetStatus().achievement * 100)}`,
    explanation: `${formatCurrency(getTargetStatus().actualRevenue)} achieved against a target of ${formatCurrency(getTargetStatus().targetRevenue)}.`,
    action: 'Focus on campaigns or inventory adjustments to close the gap to target.'
  });

  insights.push({
    title: 'Profitability status',
    metric: netProfitPositive ? 'Positive net profit' : 'Negative net profit',
    explanation: `${formatCurrency(currentSummary.netProfit)} net profit with a ${formatPercent(currentSummary.netMargin * 100)} margin.`,
    action: netProfitPositive ? 'Maintain the current operating discipline and expand the strongest categories.' : 'Reduce discretionary spending and revisit pricing or promotions.'
  });

  container.innerHTML = insights.map((item) => `
    <div class="insight-item">
      <strong>${sanitizeText(item.title)}</strong>
      <div>${sanitizeText(item.metric)}</div>
      <span>${sanitizeText(item.explanation)} ${sanitizeText(item.action)}</span>
    </div>
  `).join('');
}

function renderOverviewCharts() {
  const years = state.filters.year === 'all' ? ['2026'] : [state.filters.year];
  const selectedYear = years[0] || '2026';
  const monthSeries = getMonthlySeries();

  const revenueSeries = monthSeries.map((item) => item.revenue);
  const grossSeries = monthSeries.map((item) => item.grossProfit);
  const netSeries = monthSeries.map((item) => item.netProfit);
  const categoryData = getCategorySummary(getFilteredSalesRecords());

  if (typeof Chart === 'undefined') {
    document.getElementById('statusMessage').textContent = 'Chart.js could not load. Please reconnect to the internet and refresh the page.';
    return;
  }

  const sharedLineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: true },
      tooltip: {
        callbacks: {
          label(context) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback(value) {
            return formatCurrency(value);
          }
        }
      }
    }
  };

  createOrUpdateChart('overviewRevenueTrendChart', 'line', {
    labels: monthSeries.map((item) => item.month),
    datasets: [{
      label: 'Revenue',
      data: revenueSeries,
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.12)',
      borderWidth: 3,
      tension: 0.25,
      pointRadius: 4,
      fill: true
    }]
  }, sharedLineOptions);

  createOrUpdateChart('overviewGrossProfitTrendChart', 'line', {
    labels: monthSeries.map((item) => item.month),
    datasets: [{
      label: 'Gross Profit',
      data: grossSeries,
      borderColor: '#16a34a',
      backgroundColor: 'rgba(22, 163, 74, 0.12)',
      borderWidth: 3,
      tension: 0.25,
      pointRadius: 4,
      fill: true
    }]
  }, sharedLineOptions);

  createOrUpdateChart('overviewNetProfitTrendChart', 'line', {
    labels: monthSeries.map((item) => item.month),
    datasets: [{
      label: 'Net Profit',
      data: netSeries,
      borderColor: '#7c3aed',
      backgroundColor: 'rgba(124, 58, 237, 0.12)',
      borderWidth: 3,
      tension: 0.25,
      pointRadius: 4,
      fill: true
    }]
  }, sharedLineOptions);

  createOrUpdateChart('overviewCategoryChart', 'doughnut', {
    labels: categoryData.map((item) => item.category),
    datasets: [{
      label: 'Revenue by category',
      data: categoryData.map((item) => item.revenue),
      backgroundColor: ['#2563eb', '#16a34a', '#7c3aed', '#f59e0b']
    }]
  }, {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label(context) {
            return `${context.label}: ${formatCurrency(context.parsed)}`;
          }
        }
      }
    }
  });
}

function renderSalesKpis() {
  const container = document.getElementById('salesKpis');
  if (!container) {
    return;
  }

  const summary = getRevenueSummary(getFilteredSalesRecords());
  const items = [
    { label: 'Revenue', value: formatCurrency(summary.revenue), description: 'Sales revenue within the selected range.', icon: '$', iconClass: 'blue' },
    { label: 'Units sold', value: summary.units.toLocaleString(), description: 'Number of units sold in the selected period.', icon: 'U', iconClass: 'green' },
    { label: 'Gross profit', value: formatCurrency(summary.grossProfit), description: 'Revenue less product cost.', icon: 'GP', iconClass: 'purple' },
    { label: 'Net profit', value: formatCurrency(summary.netProfit), description: 'Gross profit after operating expenses.', icon: 'NP', iconClass: 'orange' }
  ];

  container.innerHTML = '';
  items.forEach((item) => container.appendChild(createKpiCard(item)));
}

function renderSalesComparison() {
  const container = document.getElementById('periodComparison');
  if (!container) {
    return;
  }

  const monthlySeries = getMonthlySeries();
  const selectedMonth = state.filters.month !== 'all' ? state.filters.month : 'June';
  const selectedIndex = monthlySeries.findIndex((entry) => entry.month === selectedMonth);
  const currentMonth = monthlySeries[selectedIndex] || monthlySeries[monthlySeries.length - 1];
  const prevIndex = Math.max(selectedIndex - 1, 0);
  const previousMonth = monthlySeries[prevIndex] || null;
  const revenueGrowth = previousMonth && previousMonth.revenue !== 0
    ? ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100
    : null;

  const profitGrowth = previousMonth && previousMonth.grossProfit !== 0
    ? ((currentMonth.grossProfit - previousMonth.grossProfit) / previousMonth.grossProfit) * 100
    : null;

  container.innerHTML = `
    <div class="summary-item">
      <strong>Selected month</strong>
      <div>${currentMonth ? `${currentMonth.month} ${state.filters.year}` : 'N/A'}</div>
      <span>Revenue: ${currentMonth ? formatCurrency(currentMonth.revenue) : 'N/A'} | Gross profit: ${currentMonth ? formatCurrency(currentMonth.grossProfit) : 'N/A'}</span>
    </div>
    <div class="summary-item">
      <strong>Revenue growth</strong>
      <div>${revenueGrowth === null ? 'N/A' : formatSignedPercent(revenueGrowth)}</div>
      <span>${previousMonth ? `Compared with ${previousMonth.month}` : 'No previous period available.'}</span>
    </div>
    <div class="summary-item">
      <strong>Profit growth</strong>
      <div>${profitGrowth === null ? 'N/A' : formatSignedPercent(profitGrowth)}</div>
      <span>${previousMonth ? `Compared with ${previousMonth.month}` : 'No previous period available.'}</span>
    </div>
  `;
}

function renderSalesCategoryContribution() {
  const container = document.getElementById('categoryContribution');
  if (!container) {
    return;
  }

  const categorySummary = getCategorySummary(getFilteredSalesRecords());
  container.innerHTML = categorySummary.map((item) => `
    <div class="summary-item">
      <strong>${sanitizeText(item.category)}</strong>
      <div>${formatCurrency(item.revenue)}</div>
      <span>${formatPercent(item.contribution)} of total revenue</span>
    </div>
  `).join('');
}

function renderSalesMonthlyTable() {
  const tbody = document.getElementById('salesMonthlyTableBody');
  if (!tbody) {
    return;
  }

  const monthSeries = getMonthlySeries();
  const previousMonthValue = monthSeries[monthSeries.length - 2] || null;

  tbody.innerHTML = monthSeries.map((monthData) => {
    const growth = previousMonthValue && previousMonthValue.revenue !== 0
      ? ((monthData.revenue - previousMonthValue.revenue) / previousMonthValue.revenue) * 100
      : null;

    return `
      <tr>
        <td>${monthData.month}</td>
        <td>${formatCurrency(monthData.revenue)}</td>
        <td>${formatCurrency(monthData.grossProfit)}</td>
        <td>${monthData.revenue > 0 ? Math.round(monthData.revenue / 32).toLocaleString() : '0'}</td>
        <td>${formatCurrency(monthData.netProfit)}</td>
        <td>${growth === null ? 'N/A' : formatSignedPercent(growth)}</td>
      </tr>
    `;
  }).join('');
}

function renderSalesCharts() {
  if (typeof Chart === 'undefined') {
    return;
  }

  const monthlySeries = getMonthlySeries();
  const categorySeries = getCategorySummary(getFilteredSalesRecords());

  createOrUpdateChart('salesTrendChart', 'bar', {
    labels: monthlySeries.map((item) => item.month),
    datasets: [
      {
        label: 'Revenue',
        data: monthlySeries.map((item) => item.revenue),
        backgroundColor: '#2563eb'
      },
      {
        label: 'Gross profit',
        data: monthlySeries.map((item) => item.grossProfit),
        backgroundColor: '#16a34a'
      }
    ]
  }, {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label(context) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback(value) {
            return formatCurrency(value);
          }
        }
      }
    }
  });

  createOrUpdateChart('salesCategoryChart', 'doughnut', {
    labels: categorySeries.map((item) => item.category),
    datasets: [{
      data: categorySeries.map((item) => item.revenue),
      backgroundColor: ['#2563eb', '#16a34a', '#7c3aed', '#f59e0b']
    }]
  }, {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label(context) {
            return `${context.label}: ${formatCurrency(context.parsed)}`;
          }
        }
      }
    }
  });
}

function renderProductKpis() {
  const container = document.getElementById('productKpis');
  if (!container) {
    return;
  }

  const records = getFilteredSalesRecords();
  const productSummary = getProductSummary(records);
  const topProduct = productSummary[0] || null;
  const highestMargin = productSummary.length ? [...productSummary].sort((a, b) => b.margin - a.margin)[0] : null;
  const lowestMargin = productSummary.length ? [...productSummary].sort((a, b) => a.margin - b.margin)[0] : null;

  const items = [
    { label: 'Best-selling product', value: topProduct ? topProduct.name : 'N/A', description: topProduct ? `${topProduct.units} units sold` : 'No data available.', icon: '★', iconClass: 'blue' },
    { label: 'Highest revenue', value: topProduct ? formatCurrency(topProduct.revenue) : 'N/A', description: topProduct ? topProduct.name : 'No data available.', icon: 'R', iconClass: 'green' },
    { label: 'Highest margin', value: highestMargin ? formatPercent(highestMargin.margin) : 'N/A', description: highestMargin ? highestMargin.name : 'No data available.', icon: 'M', iconClass: 'purple' },
    { label: 'Lowest margin', value: lowestMargin ? formatPercent(lowestMargin.margin) : 'N/A', description: lowestMargin ? lowestMargin.name : 'No data available.', icon: 'L', iconClass: 'orange' }
  ];

  container.innerHTML = '';
  items.forEach((item) => container.appendChild(createKpiCard(item)));
}

function getProductRows() {
  const records = getFilteredSalesRecords();
  const productSummary = getProductSummary(records);
  const searchValue = state.productSearch.toLowerCase().trim();

  const filtered = productSummary.filter((item) => {
    if (!searchValue) {
      return true;
    }

    return item.name.toLowerCase().includes(searchValue) || item.category.toLowerCase().includes(searchValue);
  });

  const [field, direction] = state.productSort.split('-');
  const sorted = [...filtered].sort((a, b) => {
    const left = a[field] || 0;
    const right = b[field] || 0;
    return direction === 'asc' ? left - right : right - left;
  });

  return sorted;
}

function renderProductTable() {
  const tbody = document.getElementById('productTableBody');
  if (!tbody) {
    return;
  }

  const rows = getProductRows();

  if (!rows.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="11">No products match the current search and filters.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = rows.map((product) => {
    let badge = 'Stable';
    if (product.margin >= 40) {
      badge = 'Top Performer';
    } else if (product.revenue >= 5000) {
      badge = 'High Revenue';
    } else if (product.margin < 25) {
      badge = 'Low Margin';
    }

    const badgeClass = badge === 'Top Performer' ? 'top-performer' : badge === 'High Revenue' ? 'high-revenue' : badge === 'Low Margin' ? 'low-margin' : 'stable';

    return `
      <tr>
        <td>${sanitizeText(product.name)}</td>
        <td>${sanitizeText(product.category)}</td>
        <td>${product.units}</td>
        <td>${formatCurrency((product.revenue / product.units) || 0)}</td>
        <td>${formatCurrency((product.cogs / product.units) || 0)}</td>
        <td>${formatCurrency(product.revenue)}</td>
        <td>${formatCurrency(product.cogs)}</td>
        <td>${formatCurrency(product.profit)}</td>
        <td>${formatPercent(product.margin)}</td>
        <td>${formatPercent(product.revenueContribution)}</td>
        <td><span class="badge ${badgeClass}">${badge}</span></td>
      </tr>
    `;
  }).join('');
}

function renderProductCharts() {
  if (typeof Chart === 'undefined') {
    return;
  }

  const data = getProductRows();
  const labels = data.slice(0, 6).map((item) => item.name);
  const revenueValues = data.slice(0, 6).map((item) => item.revenue);
  const unitValues = data.slice(0, 6).map((item) => item.units);

  createOrUpdateChart('productRevenueChart', 'bar', {
    labels,
    datasets: [{
      label: 'Revenue',
      data: revenueValues,
      backgroundColor: '#2563eb'
    }]
  }, {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label(context) {
            return `${context.label}: ${formatCurrency(context.parsed.x)}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          callback(value) {
            return formatCurrency(value);
          }
        }
      }
    }
  });

  createOrUpdateChart('productUnitsChart', 'bar', {
    labels,
    datasets: [{
      label: 'Units',
      data: unitValues,
      backgroundColor: '#16a34a'
    }]
  }, {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        ticks: {
          callback(value) {
            return `${value}`;
          }
        }
      }
    }
  });
}

function createOrUpdateChart(chartId, type, data, options) {
  const canvas = document.getElementById(chartId);
  if (!canvas) {
    return;
  }

  if (state.charts[chartId]) {
    state.charts[chartId].destroy();
  }

  state.charts[chartId] = new Chart(canvas, {
    type,
    data,
    options
  });
}

function updateReportingPeriod() {
  const periodElement = document.getElementById('reportingPeriod');
  if (!periodElement) {
    return;
  }

  periodElement.textContent = getMonthRangeLabel();
}

function updatePageTitle() {
  const titleEl = document.getElementById('pageTitle');
  const subtitleEl = document.getElementById('pageSubtitle');
  if (!titleEl || !subtitleEl) {
    return;
  }

  const labels = {
    overview: { title: 'Overview', subtitle: 'Executive summary of the business' },
    sales: { title: 'Sales Analysis', subtitle: 'Revenue, growth and profitability insights' },
    products: { title: 'Product Performance', subtitle: 'Best sellers, margins and product opportunity review' }
  };

  const config = labels[state.activeView];
  titleEl.textContent = config.title;
  subtitleEl.textContent = config.subtitle;
}

function renderNavigation() {
  const navButtons = document.querySelectorAll('.nav-item');
  navButtons.forEach((button) => {
    const isActive = button.dataset.view === state.activeView;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-current', isActive ? 'page' : 'false');
  });

  document.querySelectorAll('.view').forEach((view) => {
    view.classList.toggle('active', view.id === `view-${state.activeView}`);
  });

  updatePageTitle();
  updateReportingPeriod();
}

function refreshAll() {
  renderNavigation();
  renderOverviewKpis();
  renderTargetSummary();
  renderOverviewSummary();
  renderInsights();
  renderOverviewCharts();

  renderSalesKpis();
  renderSalesComparison();
  renderSalesCategoryContribution();
  renderSalesMonthlyTable();
  renderSalesCharts();

  renderProductKpis();
  renderProductTable();
  renderProductCharts();

  updateReportingPeriod();
}

function establishFilterOptions() {
  const monthSelect = document.getElementById('monthFilter');
  const yearSelect = document.getElementById('yearFilter');
  const categorySelect = document.getElementById('categoryFilter');
  const productSelect = document.getElementById('productFilter');

  if (monthSelect) {
    monthSelect.innerHTML = '<option value="all">All months</option>' + monthNames
      .slice(0, 6)
      .map((monthName) => `<option value="${monthName}">${monthName}</option>`)
      .join('');
    monthSelect.value = state.filters.month;
  }

  if (yearSelect) {
    yearSelect.innerHTML = '<option value="2026">2026</option>';
    yearSelect.value = state.filters.year;
  }

  if (categorySelect) {
    const categories = [...new Set(state.salesRecords.map((record) => record.category))];
    categorySelect.innerHTML = '<option value="all">All categories</option>' + categories.map((category) => `<option value="${category}">${category}</option>`).join('');
    categorySelect.value = state.filters.category;
  }

  if (productSelect) {
    const products = [...new Set(state.salesRecords.map((record) => ({ id: record.productId, name: record.productName })))]
      .filter((item) => item.id || item.name);

    productSelect.innerHTML = '<option value="all">All products</option>' + products.map((product) => `<option value="${product.id || product.name}">${product.name}</option>`).join('');
    productSelect.value = state.filters.product;
  }
}

function resetFilters() {
  state.filters = { year: '2026', month: 'all', category: 'all', product: 'all' };
  state.productSearch = '';
  const searchInput = document.getElementById('productSearch');
  const sortSelect = document.getElementById('productSortSelect');

  if (searchInput) {
    searchInput.value = '';
  }

  if (sortSelect) {
    sortSelect.value = 'revenue-desc';
    state.productSort = 'revenue-desc';
  }

  establishFilterOptions();
  refreshAll();
}

function bindStaticEvents() {
  document.querySelectorAll('.nav-item').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeView = button.dataset.view;
      renderNavigation();
      refreshAll();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  const monthFilter = document.getElementById('monthFilter');
  const yearFilter = document.getElementById('yearFilter');
  const categoryFilter = document.getElementById('categoryFilter');
  const productFilter = document.getElementById('productFilter');

  [monthFilter, yearFilter, categoryFilter, productFilter].forEach((element) => {
    if (element) {
      element.addEventListener('change', () => {
        state.filters.month = monthFilter ? monthFilter.value : 'all';
        state.filters.year = yearFilter ? yearFilter.value : '2026';
        state.filters.category = categoryFilter ? categoryFilter.value : 'all';
        state.filters.product = productFilter ? productFilter.value : 'all';
        refreshAll();
      });
    }
  });

  const resetButton = document.getElementById('resetFilters');
  if (resetButton) {
    resetButton.addEventListener('click', resetFilters);
  }

  const productSearch = document.getElementById('productSearch');
  if (productSearch) {
    productSearch.addEventListener('input', (event) => {
      state.productSearch = event.target.value;
      renderProductTable();
      renderProductCharts();
    });
  }

  const productSortSelect = document.getElementById('productSortSelect');
  if (productSortSelect) {
    productSortSelect.addEventListener('change', (event) => {
      state.productSort = event.target.value;
      renderProductTable();
      renderProductCharts();
    });
  }

  document.getElementById('openDataManagement')?.addEventListener('click', () => {
    const modal = document.getElementById('dataModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
      renderManagementTables();
    }
  });

  document.getElementById('closeDataManagement')?.addEventListener('click', () => {
    const modal = document.getElementById('dataModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
    }
  });

  document.querySelector('[data-close-modal="true"]')?.addEventListener('click', () => {
    const modal = document.getElementById('dataModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
    }
  });

  document.getElementById('restoreDemoData')?.addEventListener('click', () => {
    const shouldReset = window.confirm('This will permanently replace unsaved custom data. Continue?');
    if (!shouldReset) {
      return;
    }

    const { sales, expenses } = createDemoData();
    state.salesRecords = sales;
    state.expenseRecords = expenses;
    persistRecords();
    establishFilterOptions();
    refreshAll();
    renderManagementTables();
    showStatus('The original demo dataset was restored successfully.', 'success');
  });

  document.getElementById('exportSalesCsv')?.addEventListener('click', () => {
    exportCsv('sales-records.csv', state.salesRecords, ['id', 'date', 'month', 'year', 'productId', 'productName', 'category', 'quantity', 'unitSellingPrice', 'unitCost']);
  });

  document.getElementById('exportExpenseCsv')?.addEventListener('click', () => {
    exportCsv('operating-expenses.csv', state.expenseRecords, ['id', 'date', 'month', 'year', 'category', 'description', 'amount']);
  });

  document.getElementById('exportProductCsv')?.addEventListener('click', () => {
    const rows = getProductRows().map((item) => ({
      productName: item.name,
      category: item.category,
      units: item.units,
      revenue: item.revenue,
      cogs: item.cogs,
      grossProfit: item.profit,
      grossMargin: item.margin,
      revenueContribution: item.revenueContribution
    }));

    exportCsv('product-performance.csv', rows, ['productName', 'category', 'units', 'revenue', 'cogs', 'grossProfit', 'grossMargin', 'revenueContribution']);
  });

  document.getElementById('salesForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const payload = {
      id: formData.get('transactionId'),
      date: formData.get('date'),
      month: new Date(`${formData.get('date')}T12:00:00`).toLocaleString('en-US', { month: 'long' }),
      year: Number(new Date(`${formData.get('date')}T12:00:00`).getFullYear()),
      productName: formData.get('productName'),
      category: formData.get('category'),
      quantity: Number(formData.get('quantity')),
      unitSellingPrice: Number(formData.get('unitPrice')),
      unitCost: Number(formData.get('unitCost'))
    };

    if (!payload.id || !payload.date || !payload.productName || !payload.category || payload.quantity <= 0 || payload.unitSellingPrice <= 0 || payload.unitCost < 0) {
      showStatus('Please enter valid sales values and a date before saving.', 'error');
      return;
    }

    const existing = state.salesRecords.find((record) => record.id === payload.id);
    if (existing && !state.editing.sales) {
      showStatus('Transaction ID already exists. Please use a unique identifier.', 'error');
      return;
    }

    if (state.editing.sales) {
      const recordIndex = state.salesRecords.findIndex((record) => record.id === state.editing.sales.id);
      if (recordIndex !== -1) {
        state.salesRecords[recordIndex] = {
          ...state.salesRecords[recordIndex],
          ...payload,
          productId: state.salesRecords[recordIndex].productId || payload.productName
        };
      }
    } else {
      state.salesRecords.push({
        ...payload,
        productId: `CUSTOM-${payload.productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 20)}`
      });
    }

    state.editing.sales = null;
    persistRecords();
    establishFilterOptions();
    refreshAll();
    renderManagementTables();
    event.target.reset();
    document.getElementById('salesRecordMode').value = 'add';
    showStatus('Sales record saved successfully.', 'success');
  });

  document.getElementById('cancelSalesEdit')?.addEventListener('click', () => {
    document.getElementById('salesForm').reset();
    document.getElementById('salesRecordMode').value = 'add';
    state.editing.sales = null;
  });

  document.getElementById('expenseForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const expenseDate = formData.get('date');
    const date = new Date(`${expenseDate}T12:00:00`);
    const payload = {
      id: String(formData.get('expenseId')),
      date: expenseDate,
      month: date.toLocaleString('en-US', { month: 'long' }),
      year: Number(date.getFullYear()),
      category: formData.get('category'),
      description: formData.get('description'),
      amount: Number(formData.get('amount'))
    };

    if (!payload.id || !payload.date || !payload.description || payload.amount <= 0) {
      showStatus('Please enter valid expense details before saving.', 'error');
      return;
    }

    const existing = state.expenseRecords.find((record) => record.id === payload.id);
    if (existing && !state.editing.expense) {
      showStatus('Expense ID already exists. Please use a unique identifier.', 'error');
      return;
    }

    if (state.editing.expense) {
      const index = state.expenseRecords.findIndex((record) => record.id === state.editing.expense.id);
      if (index !== -1) {
        state.expenseRecords[index] = { ...state.expenseRecords[index], ...payload };
      }
    } else {
      state.expenseRecords.push(payload);
    }

    state.editing.expense = null;
    persistRecords();
    refreshAll();
    renderManagementTables();
    event.target.reset();
    document.getElementById('expenseActionMode').value = 'add';
    showStatus('Expense saved successfully.', 'success');
  });

  document.getElementById('cancelExpenseEdit')?.addEventListener('click', () => {
    document.getElementById('expenseForm').reset();
    document.getElementById('expenseActionMode').value = 'add';
    state.editing.expense = null;
  });
}

function renderManagementTables() {
  renderSalesList();
  renderExpenseList();
}

function renderSalesList() {
  const salesContainer = document.getElementById('salesTableContainer');
  if (!salesContainer) {
    return;
  }

  salesContainer.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Product</th>
            <th>Qty</th>
            <th>Revenue</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${state.salesRecords.map((record) => `
            <tr>
              <td>${sanitizeText(record.id)}</td>
              <td>${sanitizeText(record.productName)}</td>
              <td>${record.quantity}</td>
              <td>${formatCurrency(record.quantity * record.unitSellingPrice)}</td>
              <td>
                <button type="button" class="secondary-button" data-edit-sales="${sanitizeText(record.id)}">Edit</button>
                <button type="button" class="secondary-button danger" data-delete-sales="${sanitizeText(record.id)}">Delete</button>
              </td>
            </tr>
          `).join('') || '<tr><td colspan="5">No sales records yet.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;

  salesContainer.querySelectorAll('[data-edit-sales]').forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-edit-sales');
      const record = state.salesRecords.find((item) => item.id === targetId);
      if (!record) {
        return;
      }

      state.editing.sales = record;
      document.getElementById('salesTransactionId').value = record.id;
      document.getElementById('salesDate').value = record.date;
      document.getElementById('salesProductName').value = record.productName;
      document.getElementById('salesCategory').value = record.category;
      document.getElementById('salesQuantity').value = record.quantity;
      document.getElementById('salesUnitPrice').value = record.unitSellingPrice;
      document.getElementById('salesUnitCost').value = record.unitCost;
      document.getElementById('salesRecordMode').value = 'edit';
    });
  });

  salesContainer.querySelectorAll('[data-delete-sales]').forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-delete-sales');
      const target = state.salesRecords.find((item) => item.id === targetId);
      if (!target) {
        return;
      }

      const doDelete = window.confirm(`Delete sales record ${target.id}?`);
      if (!doDelete) {
        return;
      }

      state.salesRecords = state.salesRecords.filter((item) => item.id !== targetId);
      persistRecords();
      establishFilterOptions();
      refreshAll();
      renderManagementTables();
      showStatus('Sales record deleted successfully.', 'success');
    });
  });
}

function renderExpenseList() {
  const expenseContainer = document.getElementById('expenseTableContainer');
  if (!expenseContainer) {
    return;
  }

  expenseContainer.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${state.expenseRecords.map((record) => `
            <tr>
              <td>${sanitizeText(record.id)}</td>
              <td>${sanitizeText(record.category)}</td>
              <td>${formatCurrency(record.amount)}</td>
              <td>
                <button type="button" class="secondary-button" data-edit-expense="${sanitizeText(record.id)}">Edit</button>
                <button type="button" class="secondary-button danger" data-delete-expense="${sanitizeText(record.id)}">Delete</button>
              </td>
            </tr>
          `).join('') || '<tr><td colspan="4">No expense records yet.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;

  expenseContainer.querySelectorAll('[data-edit-expense]').forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-edit-expense');
      const record = state.expenseRecords.find((item) => item.id === targetId);
      if (!record) {
        return;
      }

      state.editing.expense = record;
      document.getElementById('expenseId').value = record.id;
      document.getElementById('expenseDate').value = record.date;
      document.getElementById('expenseCategory').value = record.category;
      document.getElementById('expenseAmount').value = record.amount;
      document.getElementById('expenseDescription').value = record.description;
      document.getElementById('expenseActionMode').value = 'edit';
    });
  });

  expenseContainer.querySelectorAll('[data-delete-expense]').forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-delete-expense');
      const target = state.expenseRecords.find((item) => item.id === targetId);
      if (!target) {
        return;
      }

      const doDelete = window.confirm(`Delete expense ${target.id}?`);
      if (!doDelete) {
        return;
      }

      state.expenseRecords = state.expenseRecords.filter((item) => item.id !== targetId);
      persistRecords();
      refreshAll();
      renderManagementTables();
      showStatus('Expense deleted successfully.', 'success');
    });
  });
}

function exportCsv(filename, rows, columns) {
  if (!rows.length) {
    showStatus('There is no data to export for the current selection.', 'error');
    return;
  }

  const escapeCell = (value) => {
    const stringValue = String(value ?? '');
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const csvRows = [columns.join(',')];

  rows.forEach((row) => {
    csvRows.push(columns.map((column) => escapeCell(row[column])).join(','));
  });

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showStatus(`CSV export completed: ${filename}`, 'success');
}

function initializeApp() {
  const dataset = getDatasetFromStorage();
  state.salesRecords = dataset.sales;
  state.expenseRecords = dataset.expenses;

  if (!state.salesRecords.length) {
    const fallback = createDemoData();
    state.salesRecords = fallback.sales;
    state.expenseRecords = fallback.expenses;
  }

  establishFilterOptions();
  bindStaticEvents();
  renderManagementTables();
  refreshAll();
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof Chart === 'undefined') {
    showStatus('Chart.js failed to load. Please check your internet connection and refresh the page.', 'error');
  }

  initializeApp();
});
