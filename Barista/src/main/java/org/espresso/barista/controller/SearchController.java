package org.espresso.barista.controller;

import org.espresso.barista.model.Keyword;
import org.espresso.barista.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller
public class SearchController {

    private final SearchService searchService;

    @Autowired
    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping("/")
    public String searchForm() {
        return "search";
    }

    @GetMapping("/search")
    public String searchKeywords(@RequestParam("keyword") String query, Model model) {
        List<Keyword> keywords = searchService.searchKeywords(query);
        model.addAttribute("keywords", keywords);
        return "search";
    }
}
