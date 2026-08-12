package com.faculynk.model.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

public enum Designation {
    PROFESSOR("Professor", 10),
    ASSOCIATE_PROFESSOR("Associate Professor", 16),
    ASSISTANT_PROFESSOR("Assistant Professor", 20);

    private final String displayName;
    private final int defaultMaxWorkloadHours;

    Designation(String displayName, int defaultMaxWorkloadHours) {
        this.displayName = displayName;
        this.defaultMaxWorkloadHours = defaultMaxWorkloadHours;
    }

    public String getDisplayName() {
        return displayName;
    }

    public int getDefaultMaxWorkloadHours() {
        return defaultMaxWorkloadHours;
    }

    public static Designation fromDisplayName(String displayName) {
        if (displayName == null) return null;
        for (Designation d : Designation.values()) {
            if (d.displayName.equalsIgnoreCase(displayName.trim()) || d.name().equalsIgnoreCase(displayName.trim())) {
                return d;
            }
        }
        throw new IllegalArgumentException("Unknown designation display name: " + displayName);
    }

    @Converter(autoApply = true)
    public static class DesignationConverter implements AttributeConverter<Designation, String> {

        @Override
        public String convertToDatabaseColumn(Designation attribute) {
            return attribute != null ? attribute.getDisplayName() : null;
        }

        @Override
        public Designation convertToEntityAttribute(String dbData) {
            return dbData != null ? Designation.fromDisplayName(dbData) : null;
        }
    }
}
