package io.github.mwdonohue.api.components.stops;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class StopController {
    private final StopService stopService;

    public StopController(StopService stopService) {
        this.stopService = stopService;
    }

    @GetMapping("/stops")
    public List<String> getStops() {
        return stopService.getStops();
    }
}
