package com.smartcampus.demo.Controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/v1")
public class OAuth2DebugController {

    @Value("${server.port:8089}")
    private String serverPort;

    @Value("${spring.security.oauth2.client.registration.google.client-id:NOT_SET}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret:NOT_SET}")
    private String googleClientSecret;

    @Value("${spring.security.oauth2.client.registration.google.redirect-uri:NOT_SET}")
    private String configuredRedirectUri;

    @GetMapping("/oauth2-debug")
    public ResponseEntity<?> debugOAuth2() {
        String redirectUri = configuredRedirectUri.replace("{registrationId}", "google");
        String googleAuthUri = "http://localhost:" + serverPort + "/oauth2/authorization/google";

        Map<String, Object> debug = new HashMap<>();
        debug.put("server_port", serverPort);
        debug.put("expected_redirect_uri", redirectUri);
        debug.put("google_auth_endpoint", googleAuthUri);
        debug.put("google_client_id", googleClientId.substring(0, 20) + "...");
        debug.put("google_client_secret_set", !googleClientSecret.equals("NOT_SET"));
        debug.put("instructions", new String[]{
            "1. Go to https://console.cloud.google.com/",
            "2. Select your project → APIs & Services → Credentials",
            "3. Click your OAuth 2.0 Client ID → Edit",
            "4. Add this EXACT redirect URI under 'Authorized redirect URIs':",
            "   " + redirectUri,
            "5. Click Save",
            "6. Wait 2-3 minutes, then clear browser cache (Ctrl+Shift+Del)",
            "7. Try OAuth login again"
        });
        debug.put("note", "If you changed the port, update application.properties server.port");

        return ResponseEntity.ok(debug);
    }
}
