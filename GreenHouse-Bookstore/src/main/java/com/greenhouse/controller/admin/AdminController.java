package com.greenhouse.controller.admin;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class AdminController {
    @RequestMapping({"/admin/index"})
    public String adminPage() {
        return "redirect:/admin/index.html";
    }
}
