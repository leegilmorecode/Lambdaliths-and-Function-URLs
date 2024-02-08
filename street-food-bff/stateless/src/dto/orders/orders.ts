export type NewOrder = {
  order: {
    customer: {
      name: string;
      email: string;
      phone: string;
      address: string;
    };
    items: {
      name: string;
      quantity: number;
      price: number;
    }[];
    deliveryMethod: 'pickup' | 'delivery';
    paymentMethod: 'credit_card' | 'cash' | 'paypal';
    totalAmount: number;
  };
};

export type Order = {
  id: string;
  created: string;
  updated?: string;
  order: {
    customer: {
      name: string;
      email: string;
      phone: string;
      address: string;
    };
    items: {
      name: string;
      quantity: number;
      price: number;
    }[];
    deliveryMethod: 'pickup' | 'delivery';
    paymentMethod: 'credit_card' | 'cash' | 'paypal';
    totalAmount: number;
  };
};
