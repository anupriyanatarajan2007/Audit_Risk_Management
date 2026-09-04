package com.example.audit_risk_management.enums;

public enum Likelihood {

    RARE(1),

    UNLIKELY(2),

    POSSIBLE(3),

    LIKELY(4),

    ALMOST_CERTAIN(5);

    private final int value;

    Likelihood(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
    
}
