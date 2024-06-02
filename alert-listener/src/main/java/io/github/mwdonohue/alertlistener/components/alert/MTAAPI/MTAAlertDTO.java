package io.github.mwdonohue.alertlistener.components.alert.MTAAPI;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class MTAAlertDTO {
    @JsonProperty("active_period")
    private List<MTAActivePeriodDTO> activePeriods;
    @JsonProperty("informed_entity")
    private List<MTAInformedEntityDTO> informedEntities;
    @JsonProperty("header_text")
    private MTAHeaderTextDTO headerText;
    @JsonProperty("transit_realtime.mercury_alert")
    private MTARealtimeAlertMetaDataDTO alertMetaData;
}
