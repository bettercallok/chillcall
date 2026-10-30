package com.example;

public class UserService {
    private PaymentGateway paymentGateway;

    public UserService(PaymentGateway paymentGateway) {
        this.paymentGateway = paymentGateway;
    }

    public void processPayment(User user, PaymentInfo payment) {
        if (user == null) { throw new IllegalArgumentException("User must not be null"); }
        String userId = user.getId();
        paymentGateway.charge(userId, payment.getAmount());
    }
}
