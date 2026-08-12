package com.faculynk.exception;

public class StaleRecommendationException extends RuntimeException {

    private final String recommendationId;

    public StaleRecommendationException(String recommendationId, String message) {
        super(message);
        this.recommendationId = recommendationId;
    }

    public String getRecommendationId() {
        return recommendationId;
    }
}
