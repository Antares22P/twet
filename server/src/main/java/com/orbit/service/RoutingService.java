package com.orbit.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.orbit.model.RouteResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RoutingService {

    private static final Logger log = LoggerFactory.getLogger(RoutingService.class);
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${orbit.osrm.base-url:https://routing.openstreetmap.de/routed-foot/route/v1/foot/}")
    private String osrmBaseUrl;

    @Value("${orbit.osrm.cache-duration-seconds:15}")
    private long cacheDurationSeconds;

    // Cache key -> RouteResponse
    private final Map<String, RouteResponse> routeCache = new ConcurrentHashMap<>();

    public RoutingService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public RouteResponse calculateFootRoute(double originLat, double originLng, double destLat, double destLng) {
        String cacheKey = String.format("%.5f,%.5f-%.5f,%.5f", originLat, originLng, destLat, destLng);
        long now = System.currentTimeMillis();

        RouteResponse cached = routeCache.get(cacheKey);
        if (cached != null && (now - cached.getFetchedAt()) < (cacheDurationSeconds * 1000)) {
            return cached;
        }

        // OSRM expects coordinates in lng,lat format
        String url = String.format("%s%.6f,%.6f;%.6f,%.6f?overview=full&geometries=geojson",
                osrmBaseUrl, originLng, originLat, destLng, destLat);

        try {
            String rawJson = restTemplate.getForObject(url, String.class);
            if (rawJson == null) {
                return fallbackStraightLine(originLat, originLng, destLat, destLng, "Empty response from OSRM");
            }

            JsonNode root = objectMapper.readTree(rawJson);
            String code = root.path("code").asText();

            if ("Ok".equalsIgnoreCase(code) && root.path("routes").isArray() && !root.path("routes").isEmpty()) {
                JsonNode primaryRoute = root.path("routes").get(0);
                double distance = primaryRoute.path("distance").asDouble(0.0);
                double duration = primaryRoute.path("duration").asDouble(0.0);

                List<List<Double>> latlngs = new ArrayList<>();
                JsonNode coordinates = primaryRoute.path("geometry").path("coordinates");
                if (coordinates.isArray()) {
                    for (JsonNode coord : coordinates) {
                        double lng = coord.get(0).asDouble();
                        double lat = coord.get(1).asDouble();
                        latlngs.add(List.of(lat, lng));
                    }
                }

                RouteResponse response = new RouteResponse(
                        true,
                        distance,
                        duration,
                        latlngs,
                        originLat,
                        originLng,
                        destLat,
                        destLng,
                        now,
                        null
                );

                routeCache.put(cacheKey, response);
                return response;
            } else {
                return fallbackStraightLine(originLat, originLng, destLat, destLng, "OSRM status: " + code);
            }
        } catch (Exception e) {
            log.warn("OSRM routing failed for coords ({},{}) -> ({},{}): {}", originLat, originLng, destLat, destLng, e.getMessage());
            return fallbackStraightLine(originLat, originLng, destLat, destLng, e.getMessage());
        }
    }

    private RouteResponse fallbackStraightLine(double originLat, double originLng, double destLat, double destLng, String error) {
        double dist = haversine(originLat, originLng, destLat, destLng);
        double duration = dist / 1.35; // default walking speed ~1.35 m/s

        return new RouteResponse(
                false,
                dist,
                duration,
                List.of(List.of(originLat, originLng), List.of(destLat, destLng)),
                originLat,
                originLng,
                destLat,
                destLng,
                System.currentTimeMillis(),
                error
        );
    }

    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371000;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
