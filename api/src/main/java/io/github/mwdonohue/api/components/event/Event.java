package io.github.mwdonohue.api.components.event;

import io.github.mwdonohue.api.components.alert.Alert;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;
import java.util.Objects;

@Document(collection = "Events")
public class Event {
    @Field("affected_services")
    private List<String> affectedRoutes;
    @Field("affected_stops")
    private List<String> affectedStops;
    @Field("event_types")
    private List<String> eventTypes;
    @DBRef
    private List<Alert> alerts;

    public List<Alert> getAlerts() {
        return alerts;
    }

    public void setAlerts(List<Alert> alerts) {
        this.alerts = alerts;
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

    public List<String> getEventTypes() {
        return eventTypes;
    }

    public void setEventTypes(List<String> eventTypes) {
        this.eventTypes = eventTypes;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Event event)) return false;
        return Objects.equals(affectedRoutes, event.affectedRoutes) && Objects.equals(affectedStops, event.affectedStops) && Objects.equals(eventTypes, event.eventTypes) && Objects.equals(alerts, event.alerts);
    }

    @Override
    public int hashCode() {
        return Objects.hash(affectedRoutes, affectedStops, eventTypes, alerts);
    }
}
