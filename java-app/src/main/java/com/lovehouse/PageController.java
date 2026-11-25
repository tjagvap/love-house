package com.lovehouse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** 首页由 Java 模板引擎渲染，场景资源由 Spring 静态资源处理器提供。 */
@Controller
public class PageController {

    @GetMapping("/")
    public String index() {
        return "index";
    }
}
