package io.github.mwdonohue.api.components.route;

import io.github.mwdonohue.api.components.event.EventService;

import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class RouteService {

    private final EventService eventService;

    public RouteService(EventService eventService) {
        this.eventService = eventService;
    }

    public List<String> getRoutes() {
        return eventService.getEvents().stream().flatMap(event -> event.getAffectedRoutes().stream()).distinct().collect(Collectors.toList());
    }
}
