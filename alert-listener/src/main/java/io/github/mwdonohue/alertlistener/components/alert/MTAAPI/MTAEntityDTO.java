package io.github.mwdonohue.alertlistener.components.alert.MTAAPI;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class MTAEntityDTO {
    private String id;
    private MTAAlertDTO alert;
}
