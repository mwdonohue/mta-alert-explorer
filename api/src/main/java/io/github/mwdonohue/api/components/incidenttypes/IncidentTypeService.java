package io.github.mwdonohue.api.components.incidenttypes;

import io.github.mwdonohue.api.components.alert.Alert;
import io.github.mwdonohue.api.components.event.EventService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class IncidentTypeService {

    private final EventService eventService;

    public IncidentTypeService(EventService eventService) {
        this.eventService = eventService;
    }

    public List<String> getIncidentTypes() {
        var alertMessages = eventService.getEvents().stream().flatMap(e -> e.getAlerts().stream()).map(Alert::getMessage).toList();
        // If the phrase is in any of the alerts, that incident type is valid
        return IncidentTypes.lookup.entrySet().stream().filter(e -> alertMessages.stream().anyMatch(m -> m.toLowerCase().contains(e.getKey()))).map(Map.Entry::getValue).distinct().collect(Collectors.toList());
    }
}
