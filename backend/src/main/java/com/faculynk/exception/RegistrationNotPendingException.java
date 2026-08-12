package com.faculynk.exception;

public class RegistrationNotPendingException extends RuntimeException {
    public RegistrationNotPendingException(String message) {
        super(message);
    }
}
