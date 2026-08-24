package com.diary.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class PinRequest {

    @NotBlank(message = "PIN is required")
    @Pattern(regexp = "\\d{4,6}", message = "PIN must be 4 to 6 digits")
    private String pin;

    public String getPin() { return pin; }
    public void setPin(String pin) { this.pin = pin; }
}
