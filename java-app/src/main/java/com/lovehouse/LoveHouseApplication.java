package com.lovehouse;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 恋爱小屋全栈应用入口。
 * Thymeleaf 负责页面渲染，Spring MVC 负责静态资源与 REST 状态接口。
 */
@SpringBootApplication
public class LoveHouseApplication {

    public static void main(String[] args) {
        SpringApplication.run(LoveHouseApplication.class, args);
    }
}
