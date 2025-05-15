package com.example.cursorbar.service;

import com.example.cursorbar.dto.LoginResponse;
import com.example.cursorbar.entity.User;
import com.example.cursorbar.exception.BusinessException;
import com.example.cursorbar.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Base64;
import java.util.Date;

@Service
public class AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private Long jwtExpiration;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public LoginResponse login(String username, String password) {
        try {
            logger.info("尝试用户登录: {}", username);
            
            // 验证用户名和密码
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(username, password)
        );

            // 设置认证信息
        SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // 获取用户信息
            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("用户不存在"));
                
            // 生成JWT令牌
        String token = generateToken(username);

            logger.info("用户 {} 登录成功", username);
        return new LoginResponse(token, user);
        } catch (BadCredentialsException e) {
            logger.error("用户 {} 登录失败: 密码错误", username);
            throw new BadCredentialsException("用户名或密码错误");
        } catch (Exception e) {
            logger.error("用户 {} 登录失败: {}", username, e.getMessage());
            throw new BusinessException("登录失败，请稍后重试");
        }
    }

    @Transactional(readOnly = true)
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.error("获取当前用户信息失败: 用户未登录");
            throw new BusinessException(401, "用户未登录");
        }

        return userRepository.findByUsername(authentication.getName())
            .orElseThrow(() -> {
                logger.error("获取当前用户信息失败: 用户不存在");
                return new BusinessException(404, "用户不存在");
            });
    }

    public void logout() {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
        SecurityContextHolder.clearContext();
            logger.info("用户 {} 已成功登出", username);
        } catch (Exception e) {
            logger.error("登出失败", e);
            throw new BusinessException("登出失败，请稍后重试");
        }
    }

    private String generateToken(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        return Jwts.builder()
            .setSubject(username)
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(SignatureAlgorithm.HS512, jwtSecret.getBytes(StandardCharsets.UTF_8))
            .compact();
    }
} 