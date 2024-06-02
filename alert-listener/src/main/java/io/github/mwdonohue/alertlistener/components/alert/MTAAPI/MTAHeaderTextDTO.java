package io.github.mwdonohue.alertlistener.components.alert.MTAAPI;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class MTAHeaderTextDTO {
    @JsonProperty("translation")
    private List<MTATranslationDTO> translations;
}
