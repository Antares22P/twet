package com.orbit.model;

public class GroupMeta {
    private String groupId;
    private String name;
    private Long createdAt;

    public GroupMeta() {}

    public GroupMeta(String groupId, String name, Long createdAt) {
        this.groupId = groupId;
        this.name = name;
        this.createdAt = createdAt;
    }

    public String getGroupId() {
        return groupId;
    }

    public void setGroupId(String groupId) {
        this.groupId = groupId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Long createdAt) {
        this.createdAt = createdAt;
    }
}
