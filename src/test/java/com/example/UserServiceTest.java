package com.example;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.fail;

public class UserServiceTest {
    @Test
    void processPayment_withNullUser_doesNotThrowRawNPE() {
        UserService service = new UserService(new PaymentGateway());
        PaymentInfo payment = new PaymentInfo();
        try {
            service.processPayment(null, payment);
            // Completing without throwing is also an acceptable, intentional guard.
        } catch (NullPointerException e) {
            fail("processPayment must not let a raw NullPointerException escape for a null user "
                + "— validate explicitly instead");
        } catch (Exception e) {
            // Any other exception (e.g. IllegalArgumentException) is an acceptable, intentional guard.
        }
    }
}
