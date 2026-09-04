package com.example.audit_risk_management.enums;
public enum Impact {

    VERY_LOW(1),
    LOW(2),
    MEDIUM(3),
    HIGH(4),
    VERY_HIGH(5);

    private final int value;

    Impact(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}