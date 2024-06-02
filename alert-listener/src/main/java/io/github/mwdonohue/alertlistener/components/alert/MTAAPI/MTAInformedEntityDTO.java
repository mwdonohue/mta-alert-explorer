package io.github.mwdonohue.alertlistener.components.alert.MTAAPI;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class MTAInformedEntityDTO {
    @JsonProperty("agency_id")
    private String agencyId;
    @JsonProperty("stop_id")
    private String stopId;
    @JsonProperty("route_id")
    private String routeId;
}
