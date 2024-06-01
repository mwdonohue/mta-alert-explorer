package io.github.mwdonohue.api.components.alert;

import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

public class Alert {
    @Field("start_time")
    private LocalDateTime startTime;
    @Field("end_time")
    private LocalDateTime endTime;
    @Field("created_time")
    private LocalDateTime createdTime;
    @Field("updated_time")
    private LocalDateTime updatedTime;
    @Field("affected_services")
    private List<String> affectedRoutes;
    @Field("affected_stops")
    private List<String> affectedStops;
    @Field("message")
    private String message;

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public LocalDateTime getCreatedTime() {
        return createdTime;
    }

    public void setCreatedTime(LocalDateTime createdTime) {
        this.createdTime = createdTime;
    }

    public LocalDateTime getUpdatedTime() {
        return updatedTime;
    }

    public void setUpdatedTime(LocalDateTime updatedTime) {
        this.updatedTime = updatedTime;
    }

    public List<String> getAffectedRoutes() {
        return affectedRoutes;
    }

    public void setAffectedRoutes(List<String> affectedRoutes) {
        this.affectedRoutes = affectedRoutes;
    }

    public List<String> getAffectedStops() {
        return affectedStops;
    }

    public void setAffectedStops(List<String> affectedStops) {
        this.affectedStops = affectedStops;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Alert alert)) return false;
        return Objects.equals(startTime, alert.startTime) && Objects.equals(endTime, alert.endTime) && Objects.equals(createdTime, alert.createdTime) && Objects.equals(updatedTime, alert.updatedTime) && Objects.equals(affectedRoutes, alert.affectedRoutes) && Objects.equals(affectedStops, alert.affectedStops) && Objects.equals(message, alert.message);
    }

    @Override
    public int hashCode() {
        return Objects.hash(startTime, endTime, createdTime, updatedTime, affectedRoutes, affectedStops, message);
    }
}
