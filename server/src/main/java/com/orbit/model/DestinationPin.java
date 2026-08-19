package com.orbit.model;

public class DestinationPin {
    private String memberId;
    private Double lat;
    private Double lng;
    private Long setAt;

    public DestinationPin() {}

    public DestinationPin(String memberId, Double lat, Double lng, Long setAt) {
        this.memberId = memberId;
        this.lat = lat;
        this.lng = lng;
        this.setAt = setAt;
    }

    public String getMemberId() { return memberId; }
    public void setMemberId(String memberId) { this.memberId = memberId; }

    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }

    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }

    public Long getSetAt() { return setAt; }
    public void setSetAt(Long setAt) { this.setAt = setAt; }
}
