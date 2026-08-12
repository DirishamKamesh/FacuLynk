package com.faculynk.auth.dto;

import jakarta.validation.constraints.NotBlank;

public class RejectionRequest {

    @NotBlank(message = "Rejection note is required")
    private String hodNote;

    public RejectionRequest() {
    }

    public RejectionRequest(String hodNote) {
        this.hodNote = hodNote;
    }

    public String getHodNote() {
        return hodNote;
    }

    public void setHodNote(String hodNote) {
        this.hodNote = hodNote;
    }
}
