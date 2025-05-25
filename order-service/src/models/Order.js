class Order {
  constructor(id, userId, items, totalAmount, status = 'pending') {
    this.id = id;
    this.userId = userId;
    this.items = items || [];
    this.totalAmount = totalAmount || 0;
    this.status = status;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  validate() {
    if (!this.userId) {
      throw new Error('User ID is required');
    }
    if (!this.items || this.items.length === 0) {
      throw new Error('Order must have at least one item');
    }
    if (this.totalAmount <= 0) {
      throw new Error('Total amount must be greater than 0');
    }
    if (!['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(this.status)) {
      throw new Error('Invalid order status');
    }
  }

  addItem(item) {
    if (!item.name || !item.price || item.quantity <= 0) {
      throw new Error('Invalid item data');
    }
    this.items.push(item);
    this.recalculateTotal();
  }

  removeItem(itemIndex) {
    if (itemIndex < 0 || itemIndex >= this.items.length) {
      throw new Error('Invalid item index');
    }
    this.items.splice(itemIndex, 1);
    this.recalculateTotal();
  }

  recalculateTotal() {
    this.totalAmount = this.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
    this.updatedAt = new Date();
  }

  updateStatus(newStatus) {
    const validTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['shipped', 'cancelled'],
      'shipped': ['delivered'],
      'delivered': [],
      'cancelled': []
    };

    if (!validTransitions[this.status].includes(newStatus)) {
      throw new Error(`Cannot transition from ${this.status} to ${newStatus}`);
    }
    
    this.status = newStatus;
    this.updatedAt = new Date();
  }

  canBeCancelled() {
    return ['pending', 'confirmed'].includes(this.status);
  }

  isCompleted() {
    return ['delivered', 'cancelled'].includes(this.status);
  }
}

module.exports = Order;
