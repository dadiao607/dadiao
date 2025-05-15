package com.example.cursorbar.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.UnsupportedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.springframework.http.MediaType;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final UserDetailsService userDetailsService;

    @Value("${jwt.secret}")
    private String jwtSecret;

    public JwtAuthenticationFilter(UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String requestURI = request.getRequestURI();
            String method = request.getMethod();
            logger.debug("Processing request: {} {}", method, requestURI);
            
            if (shouldSkipAuthentication(request)) {
                logger.debug("Skipping authentication for path: {}", requestURI);
                filterChain.doFilter(request, response);
                return;
            }

            String jwt = getJwtFromRequest(request);
            logger.debug("JWT token found: {}", jwt != null);

            if (jwt != null) {
                try {
                String username = getUsernameFromJWT(jwt);
                    logger.debug("Username extracted from JWT: {}", username);

                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    logger.debug("User details loaded for username: {}", username);
                
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                    logger.debug("Authentication set in SecurityContext for user: {}", username);
                    
                    filterChain.doFilter(request, response);
                } catch (ExpiredJwtException e) {
                    logger.error("JWT token has expired", e);
                    sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Token has expired");
                } catch (MalformedJwtException | UnsupportedJwtException | SignatureException e) {
                    logger.error("Invalid JWT token", e);
                    sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
                } catch (Exception e) {
                    logger.error("Could not set user authentication in security context", e);
                    sendErrorResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Internal server error");
        }
            } else {
                logger.debug("No JWT token found in request");
        filterChain.doFilter(request, response);
            }
        } catch (Exception e) {
            logger.error("Could not process request", e);
            sendErrorResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    private boolean shouldSkipAuthentication(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();
        
        // 始终允许OPTIONS请求通过
        if ("OPTIONS".equalsIgnoreCase(method)) {
            return true;
        }
        
        return path.startsWith("/api/auth/") || 
               path.startsWith("/api/public/") || 
               path.startsWith("/api/test/") ||
               path.equals("/error");
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    private String getUsernameFromJWT(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(jwtSecret.getBytes(StandardCharsets.UTF_8))
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    private void sendErrorResponse(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write(String.format("{\"error\": \"%s\", \"status\": %d}", message, status));
    }
} 