import { v4 as uuidv4 } from 'uuid';
import { PaymentRepository } from './PaymentRepository.js';
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

    return PaymentRepository.createInvoice({
      id,
      payment_id,
      customer_id,
      invoice_number: invoiceNum,
      total_amount: final_amount,
      tax_amount,
      status,
      pdf_url: `/invoices/${invoiceNum}.pdf`
    });
  },

  async listInvoices(user) {
    if (user.role === 'Admin' || user.role === 'Super Admin') {
      return PaymentRepository.getAllInvoices();
    } else {
      return PaymentRepository.getInvoicesByCustomerId(user.id);
    }
  },

  // Mock checkout session creation
  async initCheckout(customerId, { entity_type, entity_id, amount, payment_method }) {
    const gatewayId = 'pay_' + uuidv4().substring(0, 12);
    const paymentId = uuidv4();

    await PaymentRepository.createPayment({
      id: paymentId,
      payment_gateway_id: gatewayId,
      amount,
      status: 'Pending',
      payment_method,
      entity_type,
      entity_id
    });

    return { paymentId, gatewayId, amount, entity_type, entity_id };
  },

  // Confirm payment success (Mock webhook or callback)
  async capturePayment(gatewayId) {
    const payment = await PaymentRepository.getPaymentByGatewayId(gatewayId);
    if (!payment) throw new Error('Payment transaction not found');

    if (payment.status === 'Captured') return payment;

    // 1. Update payment ledger status
    await PaymentRepository.updatePaymentStatus(gatewayId, 'Captured');

    // 2. Fetch the updated payment record
    const updatedPayment = await PaymentRepository.getPaymentByGatewayId(gatewayId);

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
    return PaymentRepository.getCustomerIdFromEntity(type, id);
  },

  async updateSourceEntityStatus(type, id) {
    return PaymentRepository.updateSourceEntityStatus(type, id);
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

