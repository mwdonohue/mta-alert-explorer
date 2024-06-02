package io.github.mwdonohue.alertlistener.components.alert.MTAAPI;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties
public class MTARealtimeAlertMetaDataDTO {
    @JsonProperty("created_at")
    private int createdAt;
    @JsonIgnoreProperties("updated_at")
    private int updatedAt;
}
