package org.espresso.barista;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
public class Controller {

    @Autowired
    private IndexService indexService;

    @GetMapping("/index/search")
    public List<SolidIndex> search(@RequestParam("keyword") String keyword) {
        return indexService.search(keyword);
    }
}
