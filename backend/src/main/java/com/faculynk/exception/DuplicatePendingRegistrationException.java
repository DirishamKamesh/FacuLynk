package com.faculynk.exception;

public class DuplicatePendingRegistrationException extends RuntimeException {
    public DuplicatePendingRegistrationException(String message) {
        super(message);
    }
}
