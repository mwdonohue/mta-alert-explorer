package io.github.mwdonohue.api.components.incidenttypes;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class IncidentTypeController {
    private final IncidentTypeService incidentTypeService;

    public IncidentTypeController(IncidentTypeService incidentTypeService) {
        this.incidentTypeService = incidentTypeService;
    }

    @GetMapping("/incident_types")
    public List<String> getIncidentTypes() {
        return incidentTypeService.getIncidentTypes();
    }
}
