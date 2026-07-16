import { useState } from "react";
import "./Shop.css";

const menu = [
    {id:1,name:"plain set",price:40,image:"/images/thattuvadai_set.jpg"},
    {id:2,name:"combo set",price:50,image:"/images/thattuvadai_set.jpg"},
    {id:3,name:"plain noruks",price:40,image:"/images/noruks.jpg"},
    {id:4,name:"combo noruks",price:50,image:"/images/noruks.jpg"},
    {id:5,name:"Veg Burger", price: 70,image:"/images/burger.jpg"},
    {id:6,name:"Chicken Burger",price:80,image:"/images/burger.jpg"},
    {id:7, name: "Fries", price: 60,image:"/images/fries.jpg"},
    {id:8,name:"peri peri fries",price:60,image:"/images/fries.jpg"},
    {id:9,name:"veg momo",price:60,image:"/images/momo.jpg"},
    {id:10,name:"panneer momo",price:70,image:"/images/momo.jpg"},
    {id:11,name:"bread set",price:50,image:"/images/sandwich.jpg"},
    {id:12,name:"bread omlet",price:50,image:"/images/bread omlet.jpg"},
    {id:13,name:"sandwich",price:50,image:"/images/sandwich.jpg"},
    {id:14,name:"cheese sandwich",price:60,image:"/images/sandwich.jpg"},
    {id:15, name: "combos", price:100},
    {id:16, name: "Drinks", price: 40 },
];

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

function Shop() {
  // cart stores quantity for each item id, e.g. { 1: 3, 2: 1 }
  const [cart, setCart] = useState({});

  function addItem(id) {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }

  function removeItem(id) {
    setCart(prev => {
      const current = prev[id] || 0;
      if (current <= 1) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: current - 1 };
    });
  }
  function clearSales() {
    setCart({});
  }

  // total items sold
  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

  // total sales amount
  const totalSales = menu.reduce(
    (sum, item) => sum + (cart[item.id] || 0) * item.price,
    0
  );
  const today = new
  Date().toLocaleDateString("en-IN");

  return (
    <div className="shop-page">
      <h1>CRUNZO</h1>
      <p>Daily Sales Tracker</p>

      <div className="menu-grid">
        {menu.map(item => (
          <MenuItem
            key={item.id}
            item={item}
            qty={cart[item.id] || 0}
            onAdd={addItem}
            onRemove={removeItem}
          />
        ))}
      </div>

      <div className="summary">
        <h2>Today's Sales Summary</h2>
        <p>Date:{today}</p>
        {menu.map(item => (cart[item.id]?(
        <p key={item.id}>
            {item.name}*{cart[item.id]} =${cart[item.id]*item.price}
        </p>
        ):null
        ))}
        <p>Total items sold: <strong>{totalItems}</strong></p>
        <p>Total sales: <strong>₹{totalSales}</strong></p>
        <button onClick={clearSales}>Clear Today's Sales</button>
      </div>
    </div>
  );
}

export default Shop;