package com.smartcampus.demo.Service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class OAuth2UserDetailsService {

    public Map<String, Object> getCurrentUserAttributes() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication instanceof OAuth2AuthenticationToken) {
            OAuth2AuthenticationToken oauth2Token = (OAuth2AuthenticationToken) authentication;
            OAuth2User oauth2User = oauth2Token.getPrincipal();

            return new HashMap<>(oauth2User.getAttributes());
        }
        
        return new HashMap<>();
    }

    public OidcUser getCurrentOidcUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication instanceof OAuth2AuthenticationToken) {
            OAuth2AuthenticationToken oauth2Token = (OAuth2AuthenticationToken) authentication;
            if (oauth2Token.getPrincipal() instanceof OidcUser) {
                return (OidcUser) oauth2Token.getPrincipal();
            }
        }
        
        return null;
    }

    public String getUserEmail() {
        OidcUser oidcUser = getCurrentOidcUser();
        if (oidcUser != null) {
            return oidcUser.getEmail();
        }
        
        Map<String, Object> attributes = getCurrentUserAttributes();
        Object email = attributes.get("email");
        return email != null ? email.toString() : null;
    }

    public String getUserName() {
        OidcUser oidcUser = getCurrentOidcUser();
        if (oidcUser != null) {
            String givenName = oidcUser.getGivenName();
            String familyName = oidcUser.getFamilyName();
            
            if (givenName != null && familyName != null) {
                return givenName + " " + familyName;
            }
            
            return oidcUser.getFullName();
        }
        
        Map<String, Object> attributes = getCurrentUserAttributes();
        Object name = attributes.get("name");
        return name != null ? name.toString() : null;
    }

    public String getUserPicture() {
        OidcUser oidcUser = getCurrentOidcUser();
        if (oidcUser != null) {
            Object picture = oidcUser.getAttributes().get("picture");
            return picture != null ? picture.toString() : null;
        }
        
        Map<String, Object> attributes = getCurrentUserAttributes();
        Object picture = attributes.get("picture");
        return picture != null ? picture.toString() : null;
    }

    public boolean isOAuth2Authenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication instanceof OAuth2AuthenticationToken;
    }

    public String getProvider() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication instanceof OAuth2AuthenticationToken) {
            OAuth2AuthenticationToken oauth2Token = (OAuth2AuthenticationToken) authentication;
            return oauth2Token.getAuthorizedClientRegistrationId();
        }
        
        return null;
    }
}
