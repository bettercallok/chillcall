package com.example;

public class UserService {
    private PaymentGateway paymentGateway;

    public UserService(PaymentGateway paymentGateway) {
        this.paymentGateway = paymentGateway;
    }

    public void processPayment(User user, PaymentInfo payment) {
        // BUG: user can be null if fetched from DB incorrectly
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }
        String userId = user.getId();
        paymentGateway.charge(userId, payment.getAmount());
    }
}
