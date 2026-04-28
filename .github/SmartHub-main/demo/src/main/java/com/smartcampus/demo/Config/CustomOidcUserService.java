package com.smartcampus.demo.Config;

import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

/**
 * Custom OIDC User Service for OAuth2 login.
 * Extends the default OidcUserService to allow customization of OAuth2User handling.
 */
public class CustomOidcUserService extends OidcUserService {

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);
        
        // You can add custom logic here if needed:
        // - Sync user with your database
        // - Map OAuth2 attributes to your user entity
        // - Log user information
        
        return oidcUser;
    }
}
