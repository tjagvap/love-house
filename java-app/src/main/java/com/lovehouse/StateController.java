package com.lovehouse;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 应用状态服务：角色、宠物、漂流瓶、装修、天气昼夜与设置统一由 Java 后端持久化。
 * 数据文件默认位于运行目录下的 data/state.json，便于备份与迁移。
 */
@RestController
@RequestMapping("/api")
public class StateController {

    private final ObjectMapper objectMapper;
    private final Path stateFile = Paths.get("data", "state.json");
    private final Map<String, JsonNode> state = new ConcurrentHashMap<>();

    public StateController(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void load() {
        try {
            if (Files.exists(stateFile)) {
                JsonNode saved = objectMapper.readTree(Files.readAllBytes(stateFile));
                if (saved != null && saved.isObject()) {
                    saved.fields().forEachRemaining(entry -> state.put(entry.getKey(), entry.getValue()));
                }
            }
        } catch (IOException error) {
            System.err.println("读取状态文件失败，将从空状态启动：" + error.getMessage());
        }
    }

    @GetMapping("/state")
    public Map<String, JsonNode> getState() {
        return Collections.unmodifiableMap(new LinkedHashMap<>(state));
    }

    /** 前端批量同步多个键，减少请求次数。 */
    @PostMapping("/state/bulk")
    public ResponseEntity<?> saveBulk(@RequestBody Map<String, JsonNode> payload) {
        if (payload == null || payload.isEmpty()) {
            return ResponseEntity.badRequest().body("empty payload");
        }
        synchronized (state) {
            payload.forEach((key, value) -> {
                if (key != null && key.length() <= 120) state.put(key, value);
            });
            persist();
        }
        return ResponseEntity.ok(Map.of("saved", payload.size()));
    }

    /** 单键保存，兼容直接调用 REST 的客户端。 */
    @PostMapping("/state/{key}")
    public ResponseEntity<?> saveOne(@PathVariable String key, @RequestBody JsonNode value) {
        synchronized (state) {
            state.put(key, value);
            persist();
        }
        return ResponseEntity.ok(Map.of("saved", key));
    }

    @DeleteMapping("/state")
    public ResponseEntity<?> clearState() {
        synchronized (state) {
            state.clear();
            persist();
        }
        return ResponseEntity.ok(Map.of("cleared", true));
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of("status", "UP", "keys", state.size(), "storage", stateFile.toString());
    }

    private void persist() {
        try {
            Files.createDirectories(stateFile.getParent());
            Map<String, JsonNode> ordered = new LinkedHashMap<>(state);
            Files.write(stateFile, objectMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(ordered));
        } catch (IOException error) {
            System.err.println("写入状态文件失败：" + error.getMessage());
        }
    }
}
