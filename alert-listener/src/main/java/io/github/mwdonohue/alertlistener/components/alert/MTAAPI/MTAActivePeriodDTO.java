package io.github.mwdonohue.alertlistener.components.alert.MTAAPI;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class MTAActivePeriodDTO {
    private int start;
    private int end;
}
