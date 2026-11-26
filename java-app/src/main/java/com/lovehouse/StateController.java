package com.lovehouse;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.annotation.PostConstruct;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 应用状态服务：角色、宠物、漂流瓶、装修、天气昼夜与设置统一由 Java 后端持久化。
 * 数据文件默认位于运行目录下的 data/state.json，便于备份与迁移。
 *
 * 另外提供双方共享的订单接口：订单按 id 合并而不是整块覆盖，
 * 因此两个人同时在小屋里下单也不会把对方的单据冲掉。
 */
@RestController
@RequestMapping("/api")
public class StateController {

    private static final String ORDERS_KEY = "love_house_orders_v1";

    private final ObjectMapper objectMapper;
    private final Path stateFile = Paths.get("data", "state.json");
    private final Map<String, JsonNode> state = new ConcurrentHashMap<>();
    /** 双方共享的点菜订单：id -> 订单。 */
    private final Map<String, JsonNode> orders = new ConcurrentHashMap<>();

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
        JsonNode savedOrders = state.get(ORDERS_KEY);
        if (savedOrders != null && savedOrders.isArray()) {
            savedOrders.forEach(order -> {
                String id = order.path("id").asText("");
                if (!id.isEmpty()) orders.put(id, order);
            });
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
            orders.clear();
            persist();
        }
        return ResponseEntity.ok(Map.of("cleared", true));
    }

    // ---------------- 双方共享的点菜订单 ----------------

    /** 拉取全部订单（按下单时间倒序），任一方下单后另一方刷新即可看到。 */
    @GetMapping("/orders")
    public List<JsonNode> listOrders() {
        return sortedOrders();
    }

    /** 新增订单：按 id 合并，同一单重复提交也不会产生副本。 */
    @PostMapping("/orders")
    public ResponseEntity<?> addOrder(@RequestBody JsonNode order) {
        if (order == null || !order.isObject()) {
            return ResponseEntity.badRequest().body("invalid order");
        }
        String id = order.path("id").asText("");
        if (id.isEmpty()) {
            return ResponseEntity.badRequest().body("missing id");
        }
        synchronized (orders) {
            orders.put(id, order);
            persistOrders();
        }
        return ResponseEntity.ok(sortedOrders());
    }

    /** 更新订单状态（待下厨 → 制作中 → 已上桌），任一方都能改，双方同步可见。 */
    @PutMapping("/orders/{id}")
    public ResponseEntity<?> updateOrder(@PathVariable String id, @RequestBody JsonNode patch) {
        synchronized (orders) {
            JsonNode existing = orders.get(id);
            if (existing == null) {
                return ResponseEntity.status(404).body("order not found");
            }
            ObjectNode merged = objectMapper.createObjectNode();
            if (existing instanceof ObjectNode) {
                merged.setAll((ObjectNode) existing);
            } else {
                merged.set("snapshot", existing);
            }
            if (patch != null && patch.isObject()) {
                patch.fields().forEachRemaining(entry -> merged.set(entry.getKey(), entry.getValue()));
            }
            merged.put("id", id);
            orders.put(id, merged);
            persistOrders();
        }
        return ResponseEntity.ok(sortedOrders());
    }

    /** 删除订单。 */
    @DeleteMapping("/orders/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable String id) {
        synchronized (orders) {
            if (orders.remove(id) != null) {
                persistOrders();
            }
        }
        return ResponseEntity.ok(sortedOrders());
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of("status", "UP", "keys", state.size(), "orders", orders.size(), "storage", stateFile.toString());
    }

    private List<JsonNode> sortedOrders() {
        List<JsonNode> list = new ArrayList<>(orders.values());
        list.sort(Comparator.comparingLong(order -> order.path("at").asLong()));
        Collections.reverse(list);
        return list;
    }

    private void persistOrders() {
        state.put(ORDERS_KEY, objectMapper.valueToTree(sortedOrders()));
        persist();
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
