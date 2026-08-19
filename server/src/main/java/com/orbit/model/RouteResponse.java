package com.orbit.model;

import java.util.List;

public class RouteResponse {
    private boolean ok;
    private Double distance;
    private Double duration;
    private List<List<Double>> latlngs;
    private Double originLat;
    private Double originLng;
    private Double destLat;
    private Double destLng;
    private Long fetchedAt;
    private String error;

    public RouteResponse() {}

    public RouteResponse(boolean ok, Double distance, Double duration,
                         List<List<Double>> latlngs, Double originLat, Double originLng,
                         Double destLat, Double destLng, Long fetchedAt, String error) {
        this.ok = ok;
        this.distance = distance;
        this.duration = duration;
        this.latlngs = latlngs;
        this.originLat = originLat;
        this.originLng = originLng;
        this.destLat = destLat;
        this.destLng = destLng;
        this.fetchedAt = fetchedAt;
        this.error = error;
    }

    public boolean isOk() { return ok; }
    public void setOk(boolean ok) { this.ok = ok; }

    public Double getDistance() { return distance; }
    public void setDistance(Double distance) { this.distance = distance; }

    public Double getDuration() { return duration; }
    public void setDuration(Double duration) { this.duration = duration; }

    public List<List<Double>> getLatlngs() { return latlngs; }
    public void setLatlngs(List<List<Double>> latlngs) { this.latlngs = latlngs; }

    public Double getOriginLat() { return originLat; }
    public void setOriginLat(Double originLat) { this.originLat = originLat; }

    public Double getOriginLng() { return originLng; }
    public void setOriginLng(Double originLng) { this.originLng = originLng; }

    public Double getDestLat() { return destLat; }
    public void setDestLat(Double destLat) { this.destLat = destLat; }

    public Double getDestLng() { return destLng; }
    public void setDestLng(Double destLng) { this.destLng = destLng; }

    public Long getFetchedAt() { return fetchedAt; }
    public void setFetchedAt(Long fetchedAt) { this.fetchedAt = fetchedAt; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
}
