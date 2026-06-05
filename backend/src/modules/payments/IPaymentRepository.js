export class IPaymentRepository {
  async createInvoice(invoice) {
    throw new Error('Method createInvoice must be implemented');
  }

  async getInvoiceById(id) {
    throw new Error('Method getInvoiceById must be implemented');
  }

  async getAllInvoices() {
    throw new Error('Method getAllInvoices must be implemented');
  }

  async getInvoicesByCustomerId(customerId) {
    throw new Error('Method getInvoicesByCustomerId must be implemented');
  }

  async createPayment(payment) {
    throw new Error('Method createPayment must be implemented');
  }

  async getPaymentByGatewayId(gatewayId) {
    throw new Error('Method getPaymentByGatewayId must be implemented');
  }

  async updatePaymentStatus(gatewayId, status) {
    throw new Error('Method updatePaymentStatus must be implemented');
  }

  async getCustomerIdFromEntity(type, id) {
    throw new Error('Method getCustomerIdFromEntity must be implemented');
  }

  async updateSourceEntityStatus(type, id) {
    throw new Error('Method updateSourceEntityStatus must be implemented');
  }
}
