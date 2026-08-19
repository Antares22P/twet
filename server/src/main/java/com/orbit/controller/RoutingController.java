package com.orbit.controller;

import com.orbit.model.RouteResponse;
import com.orbit.service.RoutingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/routing")
public class RoutingController {

    private final RoutingService routingService;

    public RoutingController(RoutingService routingService) {
        this.routingService = routingService;
    }

    @GetMapping("/foot")
    public ResponseEntity<RouteResponse> getFootRoute(
            @RequestParam double originLat,
            @RequestParam double originLng,
            @RequestParam double destLat,
            @RequestParam double destLng) {

        RouteResponse response = routingService.calculateFootRoute(originLat, originLng, destLat, destLng);
        return ResponseEntity.ok(response);
    }
}
