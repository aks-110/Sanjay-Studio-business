import { v4 as uuidv4 } from 'uuid';
import { dbQuery } from '../../shared/database/index.js';
import appEvents from '../../shared/events/index.js';

export const paymentService = {
  // Generate a random invoice number
  generateInvoiceNumber() {
    return 'INV-' + Math.floor(100000 + Math.random() * 900000);
  },

  async createInvoice({ payment_id, customer_id, total_amount, tax_rate = 0.18, status = 'Unpaid' }) {
    const id = uuidv4();
    const invoiceNum = this.generateInvoiceNumber();
    const tax_amount = total_amount * tax_rate;
    const final_amount = Number(total_amount) + Number(tax_amount);

    await dbQuery.run(`
      INSERT INTO invoices (id, payment_id, customer_id, invoice_number, total_amount, tax_amount, status, pdf_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, payment_id, customer_id, invoiceNum, final_amount, tax_amount, status, `/invoices/${invoiceNum}.pdf`]);

    return dbQuery.get('SELECT * FROM invoices WHERE id = ?', [id]);
  },

  async listInvoices(user) {
    if (user.role === 'Admin' || user.role === 'Super Admin') {
      return dbQuery.all(`
        SELECT i.*, c.first_name || ' ' || c.last_name as customer_name, c.email as customer_email
        FROM invoices i
        JOIN users c ON i.customer_id = c.id
        ORDER BY i.created_at DESC
      `);
    } else {
      return dbQuery.all(`
        SELECT i.*
        FROM invoices i
        WHERE i.customer_id = ?
        ORDER BY i.created_at DESC
      `, [user.id]);
    }
  },

  // Mock checkout session creation
  async initCheckout(customerId, { entity_type, entity_id, amount, payment_method }) {
    const gatewayId = 'pay_' + uuidv4().substring(0, 12);
    const paymentId = uuidv4();

    await dbQuery.run(`
      INSERT INTO payments (id, payment_gateway_id, amount, status, payment_method, entity_type, entity_id)
      VALUES (?, ?, ?, 'Pending', ?, ?, ?)
    `, [paymentId, gatewayId, amount, payment_method, entity_type, entity_id]);

    return { paymentId, gatewayId, amount, entity_type, entity_id };
  },

  // Confirm payment success (Mock webhook or callback)
  async capturePayment(gatewayId) {
    const payment = await dbQuery.get('SELECT * FROM payments WHERE payment_gateway_id = ?', [gatewayId]);
    if (!payment) throw new Error('Payment transaction not found');

    if (payment.status === 'Captured') return payment;

    // 1. Update payment ledger status
    await dbQuery.run(`
      UPDATE payments
      SET status = 'Captured', updated_at = CURRENT_TIMESTAMP
      WHERE payment_gateway_id = ?
    `, [gatewayId]);

    // 2. Fetch the updated payment record
    const updatedPayment = await dbQuery.get('SELECT * FROM payments WHERE payment_gateway_id = ?', [gatewayId]);

    // 3. Find and update or generate invoice
    const customerId = await this.getCustomerIdFromEntity(updatedPayment.entity_type, updatedPayment.entity_id);
    await this.createInvoice({
      payment_id: updatedPayment.id,
      customer_id: customerId,
      total_amount: updatedPayment.amount,
      status: 'Paid'
    });

    // 4. Update the source record status (Bookings/Rentals/Orders)
    await this.updateSourceEntityStatus(updatedPayment.entity_type, updatedPayment.entity_id);

    // 5. Emit payment.completed event
    appEvents.publish('payment.completed', { payment: updatedPayment });

    return updatedPayment;
  },

  // Utility to find user id from order/booking/rental
  async getCustomerIdFromEntity(type, id) {
    let row;
    if (type === 'Booking') {
      row = await dbQuery.get('SELECT customer_id FROM bookings WHERE id = ?', [id]);
    } else if (type === 'Rental') {
      row = await dbQuery.get('SELECT customer_id FROM rentals WHERE id = ?', [id]);
    } else if (type === 'Order') {
      row = await dbQuery.get('SELECT customer_id FROM orders WHERE id = ?', [id]);
    }
    return row ? row.customer_id : null;
  },

  async updateSourceEntityStatus(type, id) {
    if (type === 'Booking') {
      await dbQuery.run('UPDATE bookings SET status = "Confirmed" WHERE id = ?', [id]);
    } else if (type === 'Rental') {
      await dbQuery.run('UPDATE rentals SET status = "Active" WHERE id = ?', [id]);
    } else if (type === 'Order') {
      await dbQuery.run('UPDATE orders SET status = "Paid" WHERE id = ?', [id]);
    }
  }
};

// Event-driven bindings for automatic Invoicing!
appEvents.subscribe('booking.created', async ({ booking }) => {
  console.log('[Event Listener] Generating draft invoice for Booking:', booking.id);
  await paymentService.createInvoice({
    customer_id: booking.customer_id,
    total_amount: booking.total_price,
    status: 'Unpaid'
  });
});

appEvents.subscribe('rental.created', async ({ rental }) => {
  console.log('[Event Listener] Generating draft invoice for Rental:', rental.id);
  await paymentService.createInvoice({
    customer_id: rental.customer_id,
    total_amount: rental.total_price,
    status: 'Unpaid'
  });
});

appEvents.subscribe('order.placed', async ({ order }) => {
  console.log('[Event Listener] Generating draft invoice for Stationery Order:', order.id);
  await paymentService.createInvoice({
    customer_id: order.customer_id,
    total_amount: order.total_amount,
    status: 'Unpaid'
  });
});
