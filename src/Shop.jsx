import { useEffect, useState } from "react";
import "./Shop.css";

const menu = [
    {id:1,name:"plain set",price:40,cost:12,image:"/images/thattuvadai_set.jpg"},
    {id:2,name:"combo set",price:50,cost:13,image:"/images/thattuvadai_set.jpg"},
    {id:3,name:"plain noruks",price:40,cost:12,image:"/images/noruks.jpg"},
    {id:4,name:"combo noruks",price:50,cost:13,image:"/images/noruks.jpg"},
    {id:5,name:"Veg Burger", price: 70,cost:30,image:"/images/burger.jpg"},
    {id:6,name:"Chicken Burger",price:80,cost:30,image:"/images/burger.jpg"},
    {id:7, name: "Fries", price: 60,cost:25,image:"/images/fries.jpg"},
    {id:8,name:"peri peri fries",price:60,cost:25,image:"/images/fries.jpg"},
    {id:9,name:"veg momo",price:60,cost:35,image:"/images/momo.jpg"},
    {id:10,name:"panneer momo",price:70,cost:35,image:"/images/momo.jpg"},
    {id:11,name:"bread set",price:50,cost:20,image:"/images/sandwich.jpg"},
    {id:12,name:"bread omlet",price:50,cost:20,image:"/images/bread omlet.jpg"},
    {id:13,name:"sandwich",price:50,cost:20,image:"/images/sandwich.jpg"},
    {id:14,name:"cheese sandwich",price:60,cost:20,image:"/images/sandwich.jpg"},
    {id:15, name: "combos", price:100,cost:30},
    {id:16, name: "Drinks", price: 40,cost:20 },
];

const CART_STORAGE_KEY = "crunzo-sales-cart";
const HISTORY_STORAGE_KEY = "crunzo-sales-history";
const ORDERS_STORAGE_KEY = "crunzo-sales-orders";
const CUSTOMER_COUNT_STORAGE_KEY = "crunzo-sales-customer-count";

function MenuItem({ item, qty, onAdd, onRemove }) {
  return (
    <div className="menu-card">
        <img src={item.image} alt={item.name}
        className="food-image" />
      <h3>{item.name}</h3>
      <p>₹{item.price}</p>
      <div className="qty-control">
        <button onClick={() => onRemove(item.id)}>-</button>
        <span>{qty}</span>
        <button onClick={() => onAdd(item.id)}>+</button>
      </div>
    </div>
  );
}

function getDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getDateLabel(dateKey) {
  const [year, month, day] = dateKey.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString("en-IN");
}

function calculateSummary(currentCart) {
  const totalItems = Object.values(currentCart).reduce((sum, qty) => sum + qty, 0);
  const totalRevenue = menu.reduce(
    (sum, item) => sum + (currentCart[item.id] || 0) * item.price,
    0
  );
  const totalCost = menu.reduce(
    (sum, item) => sum + (currentCart[item.id] || 0) * item.cost,
    0
  );
  const totalProfit = totalRevenue - totalCost;

  return { totalItems, totalRevenue, totalCost, totalProfit };
}

function Shop() {
  const [cart, setCart] = useState(() => {
    if (typeof window === "undefined") {
      return {};
    }

    try {
      const stored = window.localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [history, setHistory] = useState(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const stored = window.localStorage.getItem(HISTORY_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const stored = window.localStorage.getItem(ORDERS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [customerCounts, setCustomerCounts] = useState(() => {
    if (typeof window === "undefined") {
      return {};
    }

    try {
      const stored = window.localStorage.getItem(CUSTOMER_COUNT_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });

  const [activeTab, setActiveTab] = useState("home");
  const [orderSearch, setOrderSearch] = useState("");
  const [menuSearch, setMenuSearch] = useState("");

  const today = new Date().toLocaleDateString("en-IN");
  const todayKey = getDateKey();

  function getTodaySummary(currentCart) {
    const currentSummary = calculateSummary(currentCart);
    const completedOrders = orders.filter((entry) => entry.date === todayKey);
    const completedRevenue = completedOrders.reduce((sum, entry) => sum + (entry.orderTotal || 0), 0);
    const completedCost = completedOrders.reduce((sum, entry) => sum + (entry.orderCost || 0), 0);
    const completedProfit = completedRevenue - completedCost;
    const completedItems = completedOrders.reduce((sum, entry) => sum + (entry.quantity || 0), 0);

    return {
      totalItems: currentSummary.totalItems + completedItems,
      totalRevenue: currentSummary.totalRevenue + completedRevenue,
      totalCost: currentSummary.totalCost + completedCost,
      totalProfit: currentSummary.totalProfit + completedProfit,
    };
  }

  function saveTodayHistory(currentCart) {
    const summary = getTodaySummary(currentCart);
    setHistory((prev) => {
      const filtered = prev.filter((entry) => entry.date !== todayKey);
      const nextEntry = {
        date: todayKey,
        label: getDateLabel(todayKey),
        totalItems: summary.totalItems,
        totalSales: summary.totalRevenue,
        totalCost: summary.totalCost,
        totalProfit: summary.totalProfit,
      };
      return [...filtered, nextEntry].sort((a, b) => b.date.localeCompare(a.date));
    });
  }

  function addItem(id) {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }

  function removeItem(id) {
    setCart((prev) => {
      const current = prev[id] || 0;

      if (current <= 1) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }

      return { ...prev, [id]: current - 1 };
    });
  }

  function closeSales() {
    const confirmed = window.confirm("Are you sure you want to close today's sales?");

    if (!confirmed) {
      return;
    }

    saveTodayHistory(cart);
    setCart({});
  }

  function completeOrder() {
    const currentSummary = calculateSummary(cart);

    if (currentSummary.totalItems === 0) {
      return;
    }

    const orderItems = menu
      .filter((item) => (cart[item.id] || 0) > 0)
      .map((item) => ({
        name: item.name,
        quantity: cart[item.id],
        itemTotal: (cart[item.id] || 0) * item.price,
      }));

    const nextCustomerNumber = (customerCounts[todayKey] || 0) + 1;
    const newOrder = {
      orderNumber: orders.length + 1,
      customerNumber: nextCustomerNumber,
      date: todayKey,
      label: getDateLabel(todayKey),
      time: new Date().toLocaleTimeString("en-IN", { hour12: true }),
      items: orderItems,
      quantity: currentSummary.totalItems,
      orderTotal: currentSummary.totalRevenue,
      orderCost: currentSummary.totalCost,
      orderProfit: currentSummary.totalProfit,
    };

    setOrders((prev) => [...prev, newOrder]);
    setCustomerCounts((prev) => ({
      ...prev,
      [todayKey]: nextCustomerNumber,
    }));
    setCart({});
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
      window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
      window.localStorage.setItem(CUSTOMER_COUNT_STORAGE_KEY, JSON.stringify(customerCounts));
    }
  }, [cart, history, orders, customerCounts]);

  const currentSummary = calculateSummary(cart);
  const completedTodayOrders = orders.filter((entry) => entry.date === todayKey);
  const completedRevenue = completedTodayOrders.reduce((sum, entry) => sum + (entry.orderTotal || 0), 0);
  const completedCost = completedTodayOrders.reduce((sum, entry) => sum + (entry.orderCost || 0), 0);
  const completedProfit = completedRevenue - completedCost;
  const completedItems = completedTodayOrders.reduce((sum, entry) => sum + (entry.quantity || 0), 0);

  const totalItems = currentSummary.totalItems + completedItems;
  const totalRevenue = currentSummary.totalRevenue + completedRevenue;
  const totalCost = currentSummary.totalCost + completedCost;
  const totalProfit = currentSummary.totalProfit + completedProfit;
  const profitPercentage = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const billItems = menu.filter((item) => (cart[item.id] || 0) > 0);
  const todayCustomerCount = customerCounts[todayKey] || 0;
  const filteredMenuItems = menu.filter((item) =>
    item.name.toLowerCase().includes(menuSearch.trim().toLowerCase())
  );
  const filteredOrders = [...orders]
    .filter((order) => order.date === todayKey)
    .sort((a, b) => b.orderNumber - a.orderNumber)
    .filter((order) => {
      const query = orderSearch.trim().toLowerCase();
      if (!query) {
        return true;
      }

      return String(order.orderNumber).includes(query) || String(order.customerNumber).includes(query);
    });

  const itemSalesToday = menu.reduce((acc, item) => {
    acc[item.id] = 0;
    return acc;
  }, {});

  completedTodayOrders.forEach((order) => {
    order.items.forEach((item) => {
      itemSalesToday[item.id] = (itemSalesToday[item.id] || 0) + item.quantity;
    });
  });

  Object.entries(cart).forEach(([itemId, qty]) => {
    itemSalesToday[itemId] = (itemSalesToday[itemId] || 0) + qty;
  });

  const bestSellingItem = menu.reduce((best, item) => {
    if (!best) {
      return item;
    }

    return itemSalesToday[item.id] > itemSalesToday[best.id] ? item : best;
  }, null);

  const tabs = [
    { key: "home", label: "Home" },
    { key: "menu", label: "Menu" },
    { key: "orders", label: "Orders" },
    { key: "reports", label: "Reports" },
  ];

  const monthlyEntries = history.filter((entry) => entry.date.startsWith(selectedMonth));
  const monthlyRevenue = monthlyEntries.reduce((sum, entry) => sum + entry.totalSales, 0);
  const monthlyItems = monthlyEntries.reduce((sum, entry) => sum + entry.totalItems, 0);
  const monthlyProfit = monthlyEntries.reduce((sum, entry) => sum + (entry.totalProfit || 0), 0);
  const workingDays = monthlyEntries.length;
  const averageDailySales = workingDays > 0 ? monthlyRevenue / workingDays : 0;

  return (
    <div className="shop-page">
      <div className="app-shell">
        <div className="app-header">
          <h1>CRUNZO</h1>
          <p>Mobile POS • Daily Sales Tracker</p>
        </div>

        {activeTab === "home" && (
          <div className="screen-stack">
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <span>Today's Revenue</span>
                <strong>₹{totalRevenue}</strong>
              </div>
              <div className="dashboard-card">
                <span>Today's Profit</span>
                <strong>₹{totalProfit}</strong>
              </div>
              <div className="dashboard-card">
                <span>Total Customers</span>
                <strong>{todayCustomerCount}</strong>
              </div>
              <div className="dashboard-card">
                <span>Total Orders</span>
                <strong>{completedTodayOrders.length}</strong>
              </div>
              <div className="dashboard-card wide-card">
                <span>Best Selling Item</span>
                <strong>{bestSellingItem ? bestSellingItem.name : "No sales yet"}</strong>
              </div>
              <div className="dashboard-card wide-card">
                <span>Current Customer Bill</span>
                <strong>₹{currentSummary.totalRevenue}</strong>
              </div>
            </div>

            <div className="summary compact-summary">
              <h2>Today's Snapshot</h2>
              <p>Total items sold: <strong>{totalItems}</strong></p>
              <p>Total Revenue: <strong>₹{totalRevenue}</strong></p>
              <p>Total Profit: <strong>₹{totalProfit}</strong></p>
              <p>Profit Percentage: <strong>{profitPercentage.toFixed(2)}%</strong></p>
              <button onClick={closeSales}>Close Today's Sales</button>
            </div>
          </div>
        )}

        {activeTab === "menu" && (
          <div className="screen-stack">
            <div className="menu-search-box">
              <input
                type="text"
                placeholder="Search menu items"
                value={menuSearch}
                onChange={(event) => setMenuSearch(event.target.value)}
                className="mobile-search-input"
              />
            </div>

            <div className="menu-grid">
              {filteredMenuItems.length > 0 ? (
                filteredMenuItems.map((item) => (
                  <MenuItem
                    key={item.id}
                    item={item}
                    qty={cart[item.id] || 0}
                    onAdd={addItem}
                    onRemove={removeItem}
                  />
                ))
              ) : (
                <div className="no-items-found">No items found</div>
              )}
            </div>

            <div className="summary bill-section sticky-bill">
              <h2>Current Customer Bill</h2>
              {billItems.length > 0 ? (
                <>
                  <div className="bill-header">
                    <span>Item</span>
                    <span>Qty</span>
                    <span>Item Total</span>
                  </div>
                  {billItems.map((item) => {
                    const qty = cart[item.id] || 0;
                    const itemTotal = qty * item.price;
                    return (
                      <div className="bill-row" key={item.id}>
                        <span>{item.name}</span>
                        <span>{qty}</span>
                        <span>₹{itemTotal}</span>
                      </div>
                    );
                  })}
                  <div className="bill-grand-total">
                    <strong>Grand Total</strong>
                    <strong>₹{currentSummary.totalRevenue}</strong>
                  </div>
                  <button className="complete-order-btn" onClick={completeOrder}>
                    Complete Order
                  </button>
                </>
              ) : (
                <p>No items selected yet.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="screen-stack">
            <div className="summary">
              <h2>Today's Order History</h2>
              <input
                className="order-search"
                type="text"
                placeholder="Search by Order # or Customer #"
                value={orderSearch}
                onChange={(event) => setOrderSearch(event.target.value)}
              />
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <div className="order-history-card" key={order.orderNumber}>
                    <div className="order-history-top">
                      <strong>Order #{order.orderNumber}</strong>
                      <span>Customer #{order.customerNumber}</span>
                    </div>
                    <p>Date: {order.label || order.date} | Time: {order.time}</p>
                    <div className="order-items-list">
                      {order.items.map((item, index) => (
                        <p key={`${order.orderNumber}-${index}`}>
                          {item.name} × {item.quantity} = ₹{item.itemTotal}
                        </p>
                      ))}
                    </div>
                    <p><strong>Order Total: ₹{order.orderTotal}</strong></p>
                  </div>
                ))
              ) : (
                <p>No matching orders yet.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="screen-stack">
            <div className="summary">
              <h2>Monthly Report</h2>
              <label className="month-picker">
                Select Month:
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(event) => setSelectedMonth(event.target.value)}
                />
              </label>
              <div className="report-grid">
                <div className="report-card">
                  <p>Total Monthly Revenue</p>
                  <strong>₹{monthlyRevenue}</strong>
                </div>
                <div className="report-card">
                  <p>Total Items Sold</p>
                  <strong>{monthlyItems}</strong>
                </div>
                <div className="report-card">
                  <p>Total Working Days</p>
                  <strong>{workingDays}</strong>
                </div>
                <div className="report-card">
                  <p>Average Daily Sales</p>
                  <strong>₹{averageDailySales.toFixed(2)}</strong>
                </div>
                <div className="report-card">
                  <p>Total Profit</p>
                  <strong>₹{monthlyProfit}</strong>
                </div>
              </div>
            </div>

            <div className="summary">
              <h2>Profit Summary</h2>
              <p>Today's Revenue: <strong>₹{totalRevenue}</strong></p>
              <p>Today's Profit: <strong>₹{totalProfit}</strong></p>
              <p>Monthly Profit: <strong>₹{monthlyProfit}</strong></p>
              <p>Profit Percentage: <strong>{profitPercentage.toFixed(2)}%</strong></p>
            </div>

            <div className="summary">
              <h2>Date-wise Sales History</h2>
              {history.length > 0 ? (
                history.map((entry) => (
                  <p key={entry.date}>
                    <strong>{entry.label}</strong> — Items: {entry.totalItems}, Sales: ₹{entry.totalSales}
                  </p>
                ))
              ) : (
                <p>No sales history yet.</p>
              )}
            </div>
          </div>
        )}
      </div>

      <nav className="bottom-nav">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? "active" : ""}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default Shop;