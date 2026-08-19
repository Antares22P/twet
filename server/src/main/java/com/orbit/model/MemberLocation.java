package com.orbit.model;

public class MemberLocation {
    private String id;
    private String name;
    private String avatar;
    private String color;
    private Double lat;
    private Double lng;
    private Double accuracy;
    private Double heading;
    private Double speed;
    private Long updatedAt;

    public MemberLocation() {}

    public MemberLocation(String id, String name, String avatar, String color,
                          Double lat, Double lng, Double accuracy, Double heading,
                          Double speed, Long updatedAt) {
        this.id = id;
        this.name = name;
        this.avatar = avatar;
        this.color = color;
        this.lat = lat;
        this.lng = lng;
        this.accuracy = accuracy;
        this.heading = heading;
        this.speed = speed;
        this.updatedAt = updatedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }

    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }

    public Double getAccuracy() { return accuracy; }
    public void setAccuracy(Double accuracy) { this.accuracy = accuracy; }

    public Double getHeading() { return heading; }
    public void setHeading(Double heading) { this.heading = heading; }

    public Double getSpeed() { return speed; }
    public void setSpeed(Double speed) { this.speed = speed; }

    public Long getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Long updatedAt) { this.updatedAt = updatedAt; }
}
