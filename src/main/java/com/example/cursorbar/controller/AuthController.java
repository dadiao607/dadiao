package com.example.cursorbar.controller;

import com.example.cursorbar.common.Result;
import com.example.cursorbar.dto.LoginRequest;
import com.example.cursorbar.dto.LoginResponse;
import com.example.cursorbar.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3004", "http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public Result<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        LoginResponse response = authService.login(loginRequest.getUsername(), loginRequest.getPassword());
        return Result.success(response);
    }

    @GetMapping("/info")
    public Result<?> getUserInfo() {
        return Result.success(authService.getCurrentUser());
    }

    @PostMapping("/logout")
    public Result<Void> logout() {
        authService.logout();
        return Result.success(null);
    }
} 