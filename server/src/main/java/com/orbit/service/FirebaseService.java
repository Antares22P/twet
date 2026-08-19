package com.orbit.service;

import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;
import com.orbit.model.GroupMeta;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class FirebaseService {

    private static final Logger log = LoggerFactory.getLogger(FirebaseService.class);
    private final FirebaseDatabase firebaseDatabase;
    private static final String CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    @Autowired
    public FirebaseService(@Autowired(required = false) FirebaseDatabase firebaseDatabase) {
        this.firebaseDatabase = firebaseDatabase;
    }

    public String generateUniqueGroupId() {
        StringBuilder sb = new StringBuilder(6);
        for (int i = 0; i < 6; i++) {
            sb.append(CODE_CHARS.charAt(RANDOM.nextInt(CODE_CHARS.length())));
        }
        return sb.toString();
    }

    public CompletableFuture<GroupMeta> createGroup(String groupName) {
        String groupId = generateUniqueGroupId();
        String name = (groupName != null && !groupName.trim().isEmpty()) ? groupName.trim() : "Group " + groupId;
        GroupMeta meta = new GroupMeta(groupId, name, System.currentTimeMillis());

        CompletableFuture<GroupMeta> future = new CompletableFuture<>();

        if (firebaseDatabase == null) {
            log.info("Firebase Database is not configured in Admin SDK mode. Returning generated group meta directly.");
            future.complete(meta);
            return future;
        }

        try {
            DatabaseReference metaRef = firebaseDatabase.getReference("groups").child(groupId).child("meta");
            Map<String, Object> data = new HashMap<>();
            data.put("name", meta.getName());
            data.put("createdAt", meta.getCreatedAt());

            metaRef.setValue(data, (error, ref) -> {
                if (error != null) {
                    log.error("Failed to create group in Firebase: {}", error.getMessage());
                    future.completeExceptionally(new RuntimeException(error.getMessage()));
                } else {
                    log.info("Group created in Firebase RTDB: {} ({})", meta.getName(), groupId);
                    future.complete(meta);
                }
            });
        } catch (Exception e) {
            log.warn("Error creating group via Firebase Admin: {}", e.getMessage());
            future.complete(meta);
        }

        return future;
    }

    public CompletableFuture<GroupMeta> getGroupMeta(String groupId) {
        CompletableFuture<GroupMeta> future = new CompletableFuture<>();

        if (firebaseDatabase == null) {
            future.complete(new GroupMeta(groupId, "Group " + groupId, System.currentTimeMillis()));
            return future;
        }

        try {
            DatabaseReference metaRef = firebaseDatabase.getReference("groups").child(groupId).child("meta");
            metaRef.addListenerForSingleValueEvent(new ValueEventListener() {
                @Override
                public void onDataChange(DataSnapshot snapshot) {
                    if (snapshot.exists()) {
                        String name = snapshot.child("name").getValue(String.class);
                        Long createdAt = snapshot.child("createdAt").getValue(Long.class);
                        future.complete(new GroupMeta(
                                groupId,
                                name != null ? name : "Group " + groupId,
                                createdAt != null ? createdAt : System.currentTimeMillis()
                        ));
                    } else {
                        future.complete(null);
                    }
                }

                @Override
                public void onCancelled(DatabaseError error) {
                    future.completeExceptionally(new RuntimeException(error.getMessage()));
                }
            });
        } catch (Exception e) {
            future.complete(new GroupMeta(groupId, "Group " + groupId, System.currentTimeMillis()));
        }

        return future;
    }

    public CompletableFuture<Boolean> removeMember(String groupId, String memberId) {
        CompletableFuture<Boolean> future = new CompletableFuture<>();

        if (firebaseDatabase == null) {
            future.complete(true);
            return future;
        }

        try {
            DatabaseReference memberRef = firebaseDatabase.getReference("groups").child(groupId).child("members").child(memberId);
            DatabaseReference destRef = firebaseDatabase.getReference("groups").child(groupId).child("destinations").child(memberId);

            memberRef.removeValue((err1, ref1) -> {
                destRef.removeValue((err2, ref2) -> {
                    future.complete(true);
                });
            });
        } catch (Exception e) {
            future.complete(false);
        }

        return future;
    }
}
