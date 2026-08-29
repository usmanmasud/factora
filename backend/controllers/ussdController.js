const Order = require('../models/Order');
const Inventory = require('../models/Inventory');

// USSD session state (in-memory for sandbox; use Redis in production)
const sessions = {};

exports.handleUSSD = async (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;
  const input = text ? text.split('*') : [];
  const level = input.length;
  let response = '';

  // Fetch products for menu
  const products = await Inventory.find().limit(5);

  if (text === '') {
    sessions[sessionId] = {};
    response = `CON Welcome to FACTORA
1. Place Order
2. Track Order
3. Check Inventory`;
  } else if (input[0] === '1') {
    if (level === 1) {
      let menu = 'CON Select Product:\n';
      products.forEach((p, i) => {
        menu += `${i + 1}. ${p.product} (${p.quantity} ${p.unit})\n`;
      });
      response = menu.trim();
    } else if (level === 2) {
      const idx = parseInt(input[1]) - 1;
      if (!products[idx]) {
        response = 'END Invalid selection.';
      } else {
        sessions[sessionId].product = products[idx].product;
        response = `CON Enter quantity for ${products[idx].product}:`;
      }
    } else if (level === 3) {
      const qty = parseInt(input[2]);
      if (isNaN(qty) || qty <= 0) {
        response = 'END Invalid quantity.';
      } else {
        sessions[sessionId].quantity = qty;
        const order = await Order.create({
          distributorPhone: phoneNumber,
          items: [{ product: sessions[sessionId].product, quantity: qty }],
          channel: 'USSD',
        });
        delete sessions[sessionId];
        response = `END Order placed!\nProduct: ${order.items[0].product}\nQty: ${qty}\nOrder ID: ${order._id.toString().slice(-6).toUpperCase()}\nWe will confirm via SMS.`;
      }
    }
  } else if (input[0] === '2') {
    if (level === 1) {
      response = 'CON Enter last 6 chars of Order ID:';
    } else if (level === 2) {
      const orders = await Order.find({ distributorPhone: phoneNumber }).sort({ createdAt: -1 }).limit(3);
      if (orders.length === 0) {
        response = 'END No orders found for your number.';
      } else {
        let msg = 'END Your recent orders:\n';
        orders.forEach((o) => {
          msg += `${o._id.toString().slice(-6).toUpperCase()} - ${o.status.toUpperCase()}\n`;
        });
        response = msg.trim();
      }
    }
  } else if (input[0] === '3') {
    let msg = 'END Inventory:\n';
    products.forEach((p) => {
      msg += `${p.product}: ${p.quantity} ${p.unit}\n`;
    });
    response = msg.trim();
  } else {
    response = 'END Invalid option. Please try again.';
  }

  res.set('Content-Type', 'text/plain');
  res.send(response);
};
