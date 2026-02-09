package org.intervyouai.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/core/v1/test")
public class TestController {

    @GetMapping("/ping")
    public String ping() {
        return "pong";
    }
}
