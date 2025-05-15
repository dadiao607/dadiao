package com.example.cursorbar.service;

import com.example.cursorbar.entity.Inventory;
import java.util.List;

public interface InventoryService {
    List<Inventory> findAll();
    Inventory findById(Long id);
    Inventory save(Inventory inventory);
    void deleteById(Long id);
} 