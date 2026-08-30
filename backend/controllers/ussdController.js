const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const Downtime = require('../models/Downtime');
const { airtime, sms } = require('../config/at');
const AirtimeLog = require('../models/AirtimeLog');

const sessions = {};

exports.handleUSSD = async (req, res) => {
  const { sessionId, phoneNumber, text } = req.body;
  const input = text ? text.split('*') : [];
  const level = input.length;
  let response = '';

  const products = await Inventory.find().limit(5);

  if (text === '') {
    sessions[sessionId] = {};
    response = `CON Welcome to FACTORA\n1. Place Order\n2. Track Order\n3. Check Inventory\n4. Report Sales\n5. Log Downtime`;

  } else if (input[0] === '1') {
    if (level === 1) {
      let menu = 'CON Select Product:\n';
      products.forEach((p, i) => { menu += `${i + 1}. ${p.product} (${p.quantity} ${p.unit})\n`; });
      response = menu.trim();
    } else if (level === 2) {
      const idx = parseInt(input[1]) - 1;
      if (!products[idx]) { response = 'END Invalid selection.'; }
      else { sessions[sessionId].product = products[idx].product; response = `CON Enter quantity for ${products[idx].product}:`; }
    } else if (level === 3) {
      const qty = parseInt(input[2]);
      if (isNaN(qty) || qty <= 0) { response = 'END Invalid quantity.'; }
      else {
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
    if (level === 1) { response = 'CON Enter last 6 chars of Order ID:'; }
    else {
      const orders = await Order.find({ distributorPhone: phoneNumber }).sort({ createdAt: -1 }).limit(3);
      if (orders.length === 0) { response = 'END No orders found for your number.'; }
      else {
        let msg = 'END Your recent orders:\n';
        orders.forEach((o) => { msg += `${o._id.toString().slice(-6).toUpperCase()} - ${o.status.toUpperCase()}\n`; });
        response = msg.trim();
      }
    }

  } else if (input[0] === '3') {
    let msg = 'END Inventory:\n';
    products.forEach((p) => { msg += `${p.product}: ${p.quantity} ${p.unit}\n`; });
    response = msg.trim();

  } else if (input[0] === '4') {
    // Report Sales — auto-reward with airtime
    if (level === 1) {
      let menu = 'CON Select product sold:\n';
      products.forEach((p, i) => { menu += `${i + 1}. ${p.product}\n`; });
      response = menu.trim();
    } else if (level === 2) {
      const idx = parseInt(input[1]) - 1;
      if (!products[idx]) { response = 'END Invalid selection.'; }
      else { sessions[sessionId].salesProduct = products[idx].product; response = `CON Enter quantity sold:`; }
    } else if (level === 3) {
      const qty = parseInt(input[2]);
      if (isNaN(qty) || qty <= 0) { response = 'END Invalid quantity.'; }
      else {
        sessions[sessionId].salesQty = qty;
        response = 'CON Confirm sales report?\n1. Yes\n2. No';
      }
    } else if (level === 4) {
      if (input[3] === '1') {
        const { salesProduct, salesQty } = sessions[sessionId];
        delete sessions[sessionId];

        // Auto-send airtime reward (NGN 50 per report)
        const rewardAmount = 50;
        const currency = process.env.AT_AIRTIME_CURRENCY || 'NGN';
        let airtimeStatus = 'failed';
        let atResult = {};
        try {
          const result = await airtime.send({
            recipients: [{ phoneNumber, amount: `${currency} ${rewardAmount}` }],
          });
          atResult = result;
          airtimeStatus = result.responses?.[0]?.status === 'Success' ? 'sent' : 'failed';
        } catch (e) { /* log but don't break */ }

        await AirtimeLog.create({
          distributorPhone: phoneNumber,
          distributorName: 'USSD Reporter',
          amount: rewardAmount,
          currency,
          reason: `Sales report: ${salesProduct} x${salesQty}`,
          status: airtimeStatus,
          atResponse: atResult,
        });

        response = `END Sales report received!\n${salesProduct} x${salesQty} units.\nAirtime reward of ${currency} ${rewardAmount} sent. Thank you!`;
      } else {
        response = 'END Report cancelled.';
      }
    }

  } else if (input[0] === '5') {
    // Log Downtime
    if (level === 1) { response = 'CON Enter machine/line name:'; }
    else if (level === 2) { sessions[sessionId].machine = input[1]; response = 'CON Enter reason for downtime:'; }
    else if (level === 3) {
      const { machine } = sessions[sessionId];
      const reason = input[2];
      delete sessions[sessionId];

      await Downtime.create({ machine, reason, reportedBy: phoneNumber });

      // SMS supervisors
      const Worker = require('../models/Worker');
      const supervisors = await Worker.find({ active: true, role: { $in: ['supervisor', 'manager'] } });
      const phones = supervisors.map((w) => w.phone);
      if (phones.length > 0) {
        await sms.send({
          to: phones,
          message: `[FACTORA] DOWNTIME: ${machine} is down. Reason: ${reason}. Reported by: ${phoneNumber}`,
          from: process.env.AT_SENDER_ID,
        });
      }

      response = `END Downtime logged!\nMachine: ${machine}\nReason: ${reason}\nSupervisors have been notified.`;
    }

  } else {
    response = 'END Invalid option. Please try again.';
  }

  res.set('Content-Type', 'text/plain');
  res.send(response);
};
