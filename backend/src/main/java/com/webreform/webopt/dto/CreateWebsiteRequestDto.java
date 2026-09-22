package com.webreform.webopt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CreateWebsiteRequestDto {

    @NotBlank(message = "Website name must not be blank")
    @Size(min = 2, max = 255, message = "Website name must be between 2 and 255 characters")
    private String name;

    @NotBlank(message = "Base URL must not be blank")
    @Size(max = 1024, message = "Base URL must not exceed 1024 characters")
    @Pattern(
        regexp = "^(https?://)?([a-zA-Z0-9.-]+(:[0-9]+)?)(/.*)?$",
        message = "Base URL must be a valid HTTP or HTTPS address"
    )
    private String baseUrl;

    public CreateWebsiteRequestDto() {
    }

    public CreateWebsiteRequestDto(String name, String baseUrl) {
        this.name = name;
        this.baseUrl = baseUrl;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }
}
