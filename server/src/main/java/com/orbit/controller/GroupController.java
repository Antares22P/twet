package com.orbit.controller;

import com.orbit.model.GroupMeta;
import com.orbit.service.FirebaseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    private final FirebaseService firebaseService;

    public GroupController(FirebaseService firebaseService) {
        this.firebaseService = firebaseService;
    }

    public static class CreateGroupRequest {
        private String name;

        public CreateGroupRequest() {}
        public CreateGroupRequest(String name) { this.name = name; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    @PostMapping("/create")
    public CompletableFuture<ResponseEntity<GroupMeta>> createGroup(@RequestBody(required = false) CreateGroupRequest request) {
        String name = request != null ? request.getName() : null;
        return firebaseService.createGroup(name)
                .thenApply(ResponseEntity::ok)
                .exceptionally(ex -> ResponseEntity.internalServerError().build());
    }

    @GetMapping("/{groupId}/meta")
    public CompletableFuture<ResponseEntity<GroupMeta>> getGroupMeta(@PathVariable String groupId) {
        return firebaseService.getGroupMeta(groupId)
                .thenApply(meta -> {
                    if (meta == null) {
                        return ResponseEntity.notFound().<GroupMeta>build();
                    }
                    return ResponseEntity.ok(meta);
                })
                .exceptionally(ex -> ResponseEntity.internalServerError().build());
    }

    @DeleteMapping("/{groupId}/members/{memberId}")
    public CompletableFuture<ResponseEntity<Map<String, Object>>> removeMember(
            @PathVariable String groupId,
            @PathVariable String memberId) {
        return firebaseService.removeMember(groupId, memberId)
                .thenApply(success -> ResponseEntity.ok(Map.of("success", (Object) success, "memberId", memberId)))
                .exceptionally(ex -> ResponseEntity.internalServerError().build());
    }
}
