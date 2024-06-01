package io.github.mwdonohue.api.components.stops;

import io.github.mwdonohue.api.components.event.EventService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StopService {

    private final EventService eventService;

    public StopService(EventService eventService) {
        this.eventService = eventService;
    }

    public List<String> getStops() {
        return eventService.getEvents().stream().flatMap(event -> event.getAffectedStops().stream()).distinct().collect(Collectors.toList());
    }
}
